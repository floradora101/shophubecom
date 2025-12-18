## Authentication Architecture

This document describes how authentication is implemented end-to-end in **ShopHub**, covering both **backend (NestJS + Prisma)** and **frontend (Next.js + Zustand + Axios)**, and how all pieces integrate.

---

## High-Level Design

- **Authentication method**: JWT-based, cookie-backed.
- **Token locations**:
  - `accessToken` – httpOnly cookie, path `/` (used for:
    - Backend guards (`JwtAuthGuard` / `JwtStrategy`)
    - Next.js middleware on frontend routes
  - `refreshToken` – httpOnly cookie, path `/api/auth/refresh` (only sent to the refresh endpoint).
- **Frontend state**:
  - Tokens are **never stored in JS** (not in `localStorage` or Redux/Zustand).
  - Only the **user object** is persisted in `localStorage` via Zustand.
- **Responsibility split**:
  - **Backend**: Issues and validates tokens, enforces security, roles, and access.
  - **Frontend**: Manages user UI state, initializes auth on app load, and protects routes at the edge and client levels.

---

## Backend (NestJS + Prisma)

### 1. Data Model (Prisma)

**File**: `backend/prisma/schema.prisma`

#### User Model

```48:66:backend/prisma/schema.prisma
model User {
  id                  String               @id @default(cuid())
  email               String               @unique
  passwordHash        String
  firstName           String
  lastName            String
  phone               String?              @db.VarChar(32)
  role                UserRole             @default(CUSTOMER)
  refreshToken        String?
  addresses           Address[]
  orders              Order[]
  cart                Cart?
  auditLogs           AuditLog[]
  passwordResetTokens PasswordResetToken[]
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt

  @@index([email])
}
```

- **Password** is stored as `passwordHash` (bcrypt hash).
- `role` is an enum: `CUSTOMER` or `ADMIN`.
- `refreshToken` stores a **hashed** refresh token.

#### UserRole Enum

```13:17:backend/prisma/schema.prisma
enum UserRole {
  CUSTOMER
  ADMIN
}
```

#### Password Reset Tokens

```338:349:backend/prisma/schema.prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  tokenHash String
  used      Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

---

### 2. Auth Module and JWT Configuration

**File**: `backend/src/auth/auth.module.ts`

```12:35:backend/src/auth/auth.module.ts
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET')!,
          signOptions: {
            expiresIn: configService.get<string>(
              'JWT_ACCESS_EXPIRY',
            ) as StringValue,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

- Registers **Passport** with default `jwt` strategy.
- Configures **access token** secret and expiry via environment variables.
- Exposes `AuthService` and `JwtModule` to the rest of the app.

---

### 3. JwtStrategy – JWT from Cookies

**File**: `backend/src/auth/strategies/jwt.strategy.ts`

Responsibilities:

- Read `accessToken` **ONLY** from an httpOnly cookie.
- Validate signature and expiry with `JWT_ACCESS_SECRET`.
- Look up the user in the database (with caching).
- Return an `AuthenticatedUser` object attached to `request.user`.

#### Cookie Extraction

```73:81:backend/src/auth/strategies/jwt.strategy.ts
const extractor = (request: RequestWithCookies): string | null => {
  // Web-only: Read access token ONLY from httpOnly cookie
  // This prevents XSS attacks that could intercept tokens from Authorization header
  if (request?.cookies?.accessToken) {
    return request.cookies.accessToken;
  }
  return null;
};
```

#### Strategy Setup

```84:92:backend/src/auth/strategies/jwt.strategy.ts
const jwtExtractorFn = (req: Request): string | null => {
  return extractor(req as RequestWithCookies);
};

super({
  jwtFromRequest: jwtExtractorFn,
  ignoreExpiration: false,
  secretOrKey: jwtSecret,
} as StrategyOptions);
```

#### User Lookup + Caching

```118:159:backend/src/auth/strategies/jwt.strategy.ts
async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
  const userId = payload.sub;

  // 1. Try cache first
  const cached = this.userCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    this.logger.debug(`User ${userId} loaded from cache`);
    return cached.user;
  }
  if (cached) {
    this.userCache.delete(userId);
  }

  // 2. Always verify user exists in DB
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    this.logger.warn(`User ${userId} not found in database`);
    throw new UnauthorizedException('User not found');
  }

  // 3. Cache for performance
  this.userCache.set(userId, {
    user,
    expiresAt: Date.now() + this.CACHE_TTL,
  });

  // (Optional cleanup)
  return user;
}
```

> For more rationale see `backend/AUTH_BEST_PRACTICES.md`.

---

### 4. Guards and Decorators

#### JwtAuthGuard

**File**: `backend/src/common/guards/jwt-auth.guard.ts`

```5:12:backend/src/common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
```

Applies the `JwtStrategy` to routes and populates `request.user`.

#### CurrentUser Decorator

**File**: `backend/src/common/decorators/current-user.decorator.ts`

```1:7:backend/src/common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

Usage in controllers:

```21:23:backend/src/users/users.controller.ts
@Get('profile')
getProfile(@CurrentUser() user: AuthenticatedUser): UserResponseDto {
  return user as UserResponseDto;
}
```

#### Roles Decorator and RolesGuard

**File**: `backend/src/common/decorators/roles.decorator.ts`

```1:3:backend/src/common/decorators/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**File**: `backend/src/common/guards/roles.guard.ts`

```4:20:backend/src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.role === role);
  }
}
```

Example usage on admin-only routes:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
```

---

### 5. AuthService – Tokens and Business Logic

**File**: `backend/src/auth/auth.service.ts`

Responsibilities:

- Register:
  - Validate unique email.
  - Hash password.
  - Create new user (default `CUSTOMER`).
  - Generate access and refresh tokens.
  - Hash and store refresh token.
- Login:
  - Validate credentials.
  - Same token behavior as register.
- Refresh:
  - Validate refresh token (signature + expiry) using `JWT_REFRESH_SECRET`.
  - Compare presented token against stored hash.
  - Generate new tokens, update hashed refresh token.
- Logout:
  - Clear stored `refreshToken` in DB.
- Password reset:
  - Generate/reset via `PasswordResetToken`.

#### Login Example

```132:145:backend/src/auth/auth.service.ts
async login(loginDto: LoginDto): Promise<AuthServiceResponse> {
  const user = await this.validateUser(loginDto);
  const tokens = await this.generateTokens(user);
  const hashedRefreshToken = await hash(tokens.refreshToken, 10);

  await this.usersService.updateUser(user.id, {
    refreshToken: hashedRefreshToken,
  } as Prisma.UserUpdateInput);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: new UserEntity(user),
  };
}
```

#### Token Generation

```294:320:backend/src/auth/auth.service.ts
private async generateTokens(user: User) {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessExpiry = this.configService.get<string>(
    'JWT_ACCESS_EXPIRY',
    '15m',
  ) as StringValue;
  const refreshExpiry = this.configService.get<string>(
    'JWT_REFRESH_EXPIRY',
    '7d',
  ) as StringValue;

  const accessToken = await this.jwtService.signAsync(payload, {
    secret: this.configService.get<string>('JWT_ACCESS_SECRET')!,
    expiresIn: accessExpiry,
  });

  const refreshToken = await this.jwtService.signAsync(payload, {
    secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
    expiresIn: refreshExpiry,
  });

  return { accessToken, refreshToken };
}
```

---

### 6. AuthController – HTTP + Cookie Handling

**File**: `backend/src/auth/auth.controller.ts`

Key constants:

```50:52:backend/src/auth/auth.controller.ts
const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
```

#### Cookie Options

```97:110:backend/src/auth/auth.controller.ts
private get cookieBaseOptions() {
  const isProd = this.configService.get<string>('NODE_ENV') === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
  };
}
```

#### Setting Auth Cookies

```118:145:backend/src/auth/auth.controller.ts
private setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  const accessExpiryMs = this.parseDurationToMs(
    this.configService.get<string>('JWT_ACCESS_EXPIRY'),
    15 * 60 * 1000,
  );
  const refreshExpiryMs = this.parseDurationToMs(
    this.configService.get<string>('JWT_REFRESH_EXPIRY'),
    7 * 24 * 60 * 60 * 1000,
  );

  // Access token: visible on ALL routes (Next.js middleware needs it)
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...this.cookieBaseOptions,
    path: '/', // IMPORTANT: accessible on frontend routes
    maxAge: accessExpiryMs,
  });

  // Refresh token: scoped to refresh endpoint only
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...this.cookieBaseOptions,
    path: '/api/auth/refresh',
    maxAge: refreshExpiryMs,
  });
}
```

#### Clearing Cookies (Logout)

```151:159:backend/src/auth/auth.controller.ts
private clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    ...this.cookieBaseOptions,
    path: '/', // must match set call
  });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    ...this.cookieBaseOptions,
    path: '/api/auth/refresh',
  });
}
```

#### Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout` (requires `JwtAuthGuard`)
- `POST /api/auth/refresh` (reads refresh token from cookie)
- `GET /api/auth/me` (requires `JwtAuthGuard`, returns current user)

Example: `/auth/login`:

```208:235:backend/src/auth/auth.controller.ts
@Post('login')
@HttpCode(HttpStatus.OK)
@Throttle({ default: { limit: 5, ttl: 60000 } })
async login(
  @Body() loginDto: LoginDto,
  @Res({ passthrough: true }) res: Response,
): Promise<AuthResponseDto> {
  const response = await this.authService.login(loginDto);
  this.setAuthCookies(res, {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });

  const expiresIn = this.parseDurationToSeconds(
    this.configService.get<string>('JWT_ACCESS_EXPIRY'),
    15 * 60,
  );
  return {
    user: response.user,
    message: 'Login successful',
    expiresIn,
  };
}
```

---

### 7. UsersController – Authenticated Profile Routes

**File**: `backend/src/users/users.controller.ts`

```16:23:backend/src/users/users.controller.ts
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser): UserResponseDto {
    // user is already sanitized by JwtStrategy
    return user as UserResponseDto;
  }
}
```

All routes here are automatically protected via `JwtAuthGuard`.

---

## Frontend (Next.js + Axios + Zustand)

### 1. Types and Auth API Wrapper

**File**: `frontend/lib/types/auth.types.ts`

```1:8:frontend/lib/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}
```

```15:28:frontend/lib/types/auth.types.ts
export interface AuthResponseData {
  user: User;
  message?: string;
  expiresIn?: number;
}

export interface AuthResponse {
  success: boolean;
  data: AuthResponseData;
  timestamp?: string;
}
```

**File**: `frontend/lib/api/auth.ts`

- Wraps authentication endpoints:
  - `register`
  - `login`
  - `logout`
  - `getMe`
  - `refreshToken`
  - `forgotPassword`
  - `resetPassword`

Example: login:

```43:60:frontend/lib/api/auth.ts
async login(data: LoginFormData): Promise<AuthResponseData> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    {
      email: data.email,
      password: data.password,
    },
    {
      _skipAuthRefresh: true,
    } as ExtendedAxiosRequestConfig
  );

  if (!response.data.success || !response.data.data) {
    throw new Error("Login failed");
  }

  // Tokens are automatically set in httpOnly cookies by backend
  return response.data.data;
}
```

> Note: tokens are not returned by the backend; they are only set in cookies.

---

### 2. Axios Client and Token Refresh Interceptor

**File**: `frontend/lib/api/client.ts`

#### Axios Instance

```41:48:frontend/lib/api/client.ts
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required for httpOnly cookies
  timeout: 30000,
});
```

#### Refresh Logic on 401

When a non-auth request returns `401 Unauthorized`:

1. Check that:
   - We haven’t already retried this request.
   - `_skipAuthRefresh` is not set.
   - URL is not an auth endpoint (`/auth/login`, `/auth/register`, etc.).
2. If `isRefreshing` is **true**:
   - Queue the request until refresh finishes.
3. If `isRefreshing` is **false**:
   - Call `POST /auth/refresh` via plain `axios` (not `apiClient`) with cookies.
   - If successful:
     - Process queued requests.
     - Retry original request using new cookies.
   - If it fails with 400/401/403:
     - Emit auth expired event (`emitAuthExpired()`).

Refresh call:

```94:105:frontend/lib/api/client.ts
const response = await apiClient.post<AuthResponse>("/auth/refresh", {}, {
  _skipAuthRefresh: true,
} as ExtendedAxiosRequestConfig);

if (!response.data.success || !response.data.data) {
  throw new Error("Token refresh failed");
}
```

On refresh failure:

```167:176:frontend/lib/api/client.ts
if (
  typeof window !== "undefined" &&
  status &&
  (status === 401 || status === 403 || status === 400)
) {
  console.log(
    "[Auth] Refresh token invalid or expired, emitting auth expired event"
  );
  emitAuthExpired();
}
```

---

### 3. Auth Events Bridge

**File**: `frontend/lib/api/authEvents.ts`

```9:21:frontend/lib/api/authEvents.ts
type AuthExpiredCallback = () => void;

let onAuthExpiredCallback: AuthExpiredCallback | null = null;

export function setOnAuthExpired(callback: AuthExpiredCallback) {
  onAuthExpiredCallback = callback;
}

export function clearOnAuthExpired() {
  onAuthExpiredCallback = null;
}
```

```28:35:frontend/lib/api/authEvents.ts
export function emitAuthExpired() {
  if (onAuthExpiredCallback) {
    onAuthExpiredCallback();
  }
}
```

- **Axios** (network layer) calls `emitAuthExpired()` when refresh fails.
- **AuthProvider** (UI layer) calls `setOnAuthExpired()` to handle expiry centrally.

---

### 4. Zustand Auth Store

**File**: `frontend/store/auth-store.ts`

#### State Shape

```13:27:frontend/store/auth-store.ts
interface AuthState {
  user: User | null;
  isInitializing: boolean;
  isSubmitting: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  clearAuth: () => void;
}
```

Initial values:

```31:37:frontend/store/auth-store.ts
user: null,
// Start in initializing state so route guards wait until we've checked auth
isInitializing: true,
isSubmitting: false,
error: null,
```

#### Actions

- `login`:
  - Calls `authApi.login`.
  - On success: sets `user` and clears errors.
- `register`:
  - Similar to `login`.
- `logout`:
  - Calls `authApi.logout` (backend clears cookies + DB refresh token).
  - Always calls `clearAuth()` (sets `user = null`).
- `checkAuth`:
  - Calls `authApi.getMe()`:
    - Success → sets `user`.
    - Failure → sets `user = null`.
  - Controls `isInitializing` around the call.

#### Persistence

```151:159:frontend/store/auth-store.ts
{
  name: "auth-storage",
  storage: createJSONStorage(() => localStorage),
  // Only persist user data, not tokens (tokens are in httpOnly cookies)
  partialize: (state: AuthState) => ({
    user: state.user,
  }),
}
```

- Only `user` is persisted (no token leakage).
- On reload, Zustand rehydrates `user` from `localStorage`, but **auth validity** is always verified against `/auth/me` via cookies.

---

### 5. Global AuthProvider

**File**: `frontend/components/providers/AuthProvider.tsx`

Wrapped by `AppProviders` in `app/layout.tsx`, so it is active for all routes.

#### Responsibilities

- Initialize auth state:
  - On first mount, call `checkAuth()` once (`/auth/me`).
- Listen for `authExpired` events from Axios:
  - Clear local auth state.
  - Invalidate cart queries.
  - Redirect to `/login?redirect=...` if on a protected route.
- Invalidate cart when `user.id` changes (login or logout).
- Show a full-screen loading state while `isInitializing` is true.

#### Initialization

```48:64:frontend/components/providers/AuthProvider.tsx
useEffect(() => {
  if (hasInitialized.current) return;
  hasInitialized.current = true;

  const initializeAuth = async () => {
    try {
      await checkAuth();
    } catch {
      console.debug("Auth initialization: User not authenticated");
    }
  };

  initializeAuth();
}, [checkAuth]);
```

#### Handling Auth Expiry

```88:113:frontend/components/providers/AuthProvider.tsx
useEffect(() => {
  const handleAuthExpired = () => {
    clearAuth();
    queryClient.invalidateQueries({ queryKey: cartKeys.all });

    const protectedRoutes = ["/profile", "/orders", "/checkout", "/admin"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/register");

    if (isProtectedRoute && !isAuthPage) {
      const loginUrl = new URL("/login", window.location.origin);
      const fullPath = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      loginUrl.searchParams.set("redirect", fullPath);
      router.replace(loginUrl.pathname + loginUrl.search);
    }
  };

  setOnAuthExpired(handleAuthExpired);
  return () => {
    clearOnAuthExpired();
  };
}, [clearAuth, pathname, searchParams, router, queryClient]);
```

#### Loading State

```143:151:frontend/components/providers/AuthProvider.tsx
if (isInitializing) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" className="text-primary-500" />
        <p className="text-gray-600">Initializing...</p>
      </div>
    </div>
  );
}
```

---

### 6. Route Protection – Middleware and RequireAuth

Authentication is enforced at two layers:

1. **Next.js middleware** (edge, cookie-based).
2. **Client-side `RequireAuth` guard** (state-based, UX + roles).

#### 6.1 Next.js Middleware

**File**: `frontend/middleware.ts`

Protected route prefixes:

```26:27:frontend/middleware.ts
const protectedRoutes = ["/profile", "/orders", "/checkout", "/admin"];
```

Core logic:

```28:43:frontend/middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken");

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
```

If there is **no accessToken cookie** and the user performs a **direct navigation** (no same-origin referer):

```45:63:frontend/middleware.ts
if (isProtectedRoute && !accessToken) {
  const referer = request.headers.get("referer");
  const isClientNavigation =
    referer && new URL(referer).origin === request.nextUrl.origin;

  if (!isClientNavigation) {
    const loginUrl = new URL("/login", request.url);
    const fullPath = request.nextUrl.search
      ? `${pathname}${request.nextUrl.search}`
      : pathname;
    loginUrl.searchParams.set("redirect", fullPath);
    return NextResponse.redirect(loginUrl);
  }
}
```

- Prevents unauthenticated hard refresh / direct bookmark access to protected pages.
- Defers client-side navigations (which might be using a stale cookie path) to the in-app guard.

#### 6.2 RequireAuth Component

**File**: `frontend/components/auth/RequireAuth.tsx`

Props:

- `role?: User["role"] | User["role"][]` – optional required role(s).
- `redirectTo?: string` – where to send unauthenticated users (default `/login`).
- `fallbackTo?: string` – where to send authenticated users lacking role (default `/`).

Reads state from `auth-store`:

```51:55:frontend/components/auth/RequireAuth.tsx
const { user, isInitializing } = useAuthStore(
  useShallow((state) => ({
    user: state.user,
    isInitializing: state.isInitializing,
  }))
);
```

Auth and role checks:

```61:74:frontend/components/auth/RequireAuth.tsx
const isAuthenticated = !!user;

const hasRequiredRole = role
  ? (() => {
      const userRole = user?.role;
      if (userRole === undefined) return false;
      return Array.isArray(role)
        ? role.includes(userRole)
        : userRole === role;
    })()
  : true;
```

Redirect effect:

```76:99:frontend/components/auth/RequireAuth.tsx
useEffect(() => {
  // Wait for initial bootstrap
  if (isInitializing) return;

  if (!isAuthenticated) {
    const loginUrl = new URL(redirectTo, window.location.origin);
    const fullPath = pathname + (search ? `?${search}` : "");
    loginUrl.searchParams.set("redirect", fullPath);
    router.replace(loginUrl.pathname + loginUrl.search);
    return;
  }

  if (isAuthenticated && !hasRequiredRole) {
    router.replace(fallbackTo);
    return;
  }
}, [
  isAuthenticated,
  hasRequiredRole,
  isInitializing,
  router,
  redirectTo,
  fallbackTo,
  pathname,
  search,
]);
```

Rendering:

```111:121:frontend/components/auth/RequireAuth.tsx
if (isInitializing) {
  return null;
}

if (!isAuthenticated || !hasRequiredRole) {
  return null;
}

return <>{children}</>;
```

#### 6.3 Admin Layout Integration

**File**: `frontend/app/admin/layout.tsx`

```13:26:frontend/app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth role="ADMIN">
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 min-w-0 lg:ml-0 pt-16 lg:pt-0">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
```

Only authenticated users with role `ADMIN` can see any admin routes.

---

### 7. UI Components and Auth Usage

#### 7.1 Header

**File**: `frontend/components/layout/Header.tsx`

Reads `user` and `logout` from `auth-store`:

```19:27:frontend/components/layout/Header.tsx
const { user, logout } = useAuthStore(
  useShallow((state) => ({
    user: state.user,
    logout: state.logout,
  }))
);
const userFirstName = user?.firstName;
const isAuthenticated = !!user;
```

Shows either:

- **Authenticated UI**:

```109:133:frontend/components/layout/Header.tsx
{isAuthenticated ? (
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={() => router.push("/profile?tab=dashboard")}
    >
      <User className="h-4 w-4" />
      <span className="hidden md:inline">{userFirstName}</span>
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await logout();
        // Cart invalidation handled by AuthProvider
        router.push("/login");
      }}
      className="hidden sm:flex"
    >
      Logout
    </Button>
  </div>
) : (
  // ...
)}
```

- **Unauthenticated UI**:
  - Login / Sign Up buttons opening the `AuthModal`.

#### 7.2 AuthModal

**File**: `frontend/components/auth/AuthModal.tsx`

- Contains `LoginForm` and `RegisterForm`.
- Watches `user` from `auth-store` and auto-closes when the user becomes authenticated.

```23:31:frontend/components/auth/AuthModal.tsx
const user = useAuthStore(useShallow((state) => state.user));
const isAuthenticated = !!user;

// Close modal when user becomes authenticated
useEffect(() => {
  if (isAuthenticated && isOpen) {
    onClose();
  }
}, [isAuthenticated, isOpen, onClose]);
```

#### 7.3 Login and Register Pages

**File**: `frontend/app/(auth)/login/page.tsx`

- Parses `redirect` query param and forwards to `LoginForm`.

```8:21:frontend/app/(auth)/login/page.tsx
export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  return (
    <div className="space-y-8">
      {/* ... */}
      <LoginForm redirectUrl={redirect || undefined} />
      {/* ... */}
    </div>
  );
}
```

**File**: `frontend/app/(auth)/register/page.tsx`

Works similarly, passing `redirect` into `RegisterForm` so users can be redirected back to the originally requested page.

---

### 8. Root Layout and Providers Integration

**File**: `frontend/app/layout.tsx`

```22:33:frontend/app/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

**File**: `frontend/app/providers.tsx`

```13:34:frontend/app/providers.tsx
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster />
    </QueryClientProvider>
  );
}
```

- Ensures `AuthProvider` is mounted once per app shell, so auth initialization and event handling are always active.

---

## End-to-End Flows

### 1. Login Flow

1. User submits login form (`LoginForm` or `AuthModal`).
2. `LoginForm` calls `useAuthStore().login(credentials)`.
3. `auth-store.login` calls `authApi.login(credentials)`:
   - `apiClient.post("/auth/login", credentials, { withCredentials: true })`.
4. Backend `AuthController.login`:
   - Uses `AuthService.login` to validate credentials and generate tokens.
   - Sets:
     - `accessToken` cookie on path `/`.
     - `refreshToken` cookie on path `/api/auth/refresh`.
   - Returns `{ success: true, data: { user, message, expiresIn } }`.
5. `auth-store`:
   - Sets `user` from response.
   - `isSubmitting` becomes false.
6. UI updates:
   - `Header` shows user first name + logout.
   - `AuthModal` detects `isAuthenticated` and closes.
   - Any `RequireAuth` components now pass checks and render children.

---

### 2. Token Refresh Flow (Automatic)

1. User makes a request through any `lib/api/*` that uses `apiClient`.
2. Access token is expired → backend returns 401.
3. Axios response interceptor:
   - Confirms this is not a login/register/logout/refresh call.
   - If another refresh is in progress:
     - Queues this request until refresh completes.
   - Else:
     - Calls `POST /auth/refresh` using plain `axios` with cookies.
4. Backend `AuthController.refresh`:
   - Reads `refreshToken` from cookie `refreshToken` (path `/api/auth/refresh`).
   - `AuthService.refresh` validates token and matches it to stored hash.
   - Generates new access+refresh tokens, updates hashed refresh token in DB.
   - Sets new cookies.
5. On success:
   - Interceptor processes queued requests.
   - Retries the original request with new cookies.
6. On failure (400/401/403):
   - Interceptor calls `emitAuthExpired()`.
   - `AuthProvider`:
     - Calls `clearAuth()`.
     - Invalidates cart queries.
     - If on a protected route (`/profile`, `/orders`, `/checkout`, `/admin`), redirects to `/login?redirect=currentPath`.

---

### 3. Logout Flow

1. User clicks **Logout** in the header.
2. `Header` calls `await logout()` from `auth-store`.
3. `auth-store.logout`:
   - Calls `authApi.logout()` → `POST /auth/logout`.
   - Backend:
     - `JwtAuthGuard` validates `accessToken` cookie.
     - `AuthController.logout`:
       - `AuthService.logout(userId)` sets `refreshToken = null` in DB.
       - `clearAuthCookies()` removes both `accessToken` and `refreshToken` cookies.
   - In `finally`, `auth-store` always calls `clearAuth()` (sets `user = null`).
4. `AuthProvider` detects `user.id` changed and invalidates cart.
5. `Header` updates to unauthenticated UI.

---

### 4. Page Refresh and Persistence

Scenario: User is logged in and visits `/admin/products`, then performs a hard refresh.

1. **Browser** sends request to `/admin/products`.
2. **Next.js middleware** (edge):
   - Reads `accessToken` cookie.
   - If present:
     - Allows the request to proceed (no redirect).
   - If absent:
     - Redirects to `/login?redirect=/admin/products`.
3. **App shell mounts**:
   - Zustand rehydrates `user` from `localStorage` (if present).
   - `AuthProvider` runs `checkAuth()` **once**:
     - `authApi.getMe()` calls `GET /auth/me` with cookies.
     - Backend `JwtAuthGuard` + `JwtStrategy` validate `accessToken` and load user from DB.
     - `auth-store` sets `user` and `isInitializing = false`.
4. **RequireAuth** in `AdminLayout`:
   - While `isInitializing` is `true`, does nothing and renders nothing.
   - After initialization:
     - If `user` exists and `user.role === 'ADMIN'`:
       - Renders children (admin UI).
     - If no user or wrong role:
       - Redirects to `/login?redirect=/admin/...` or fallback.

This guarantees:

- Auth is validated against the backend on every full reload.
- Admin pages do not kick you out on refresh while tokens are valid.

---

### 5. Route Protection Summary

- **Backend**:
  - Use `@UseGuards(JwtAuthGuard)` on controllers/routes that require authentication.
  - Use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` for admin-only APIs.
- **Frontend**:
  - **Edge protection**: `frontend/middleware.ts` for `/profile`, `/orders`, `/checkout`, `/admin`.
  - **Client protection**: `RequireAuth` for layouts/pages that require auth (with optional role).
  - **Global initialization and expiry handling**: `AuthProvider`.

---

## Where to Look / Modify

- **Backend auth core**:

  - Module: `backend/src/auth/auth.module.ts`
  - Service: `backend/src/auth/auth.service.ts`
  - Controller: `backend/src/auth/auth.controller.ts`
  - JWT strategy: `backend/src/auth/strategies/jwt.strategy.ts`
  - Guards & decorators:
    - `backend/src/common/guards/jwt-auth.guard.ts`
    - `backend/src/common/guards/roles.guard.ts`
    - `backend/src/common/decorators/current-user.decorator.ts`
    - `backend/src/common/decorators/roles.decorator.ts`
  - Data model: `backend/prisma/schema.prisma` (`User`, `PasswordResetToken`, `UserRole`)

- **Frontend auth core**:
  - Types: `frontend/lib/types/auth.types.ts`
  - Axios + refresh: `frontend/lib/api/client.ts`
  - Auth API: `frontend/lib/api/auth.ts`
  - Auth events: `frontend/lib/api/authEvents.ts`
  - Zustand auth store: `frontend/store/auth-store.ts`
  - Auth provider: `frontend/components/providers/AuthProvider.tsx`
  - Route guard: `frontend/components/auth/RequireAuth.tsx`
  - Middleware: `frontend/middleware.ts`
  - Admin layout protection: `frontend/app/admin/layout.tsx`
  - UI integration: `frontend/components/layout/Header.tsx`, `frontend/components/auth/AuthModal.tsx`

For a more step-by-step manual testing guide, see `frontend/TESTING_AUTH.md`.
