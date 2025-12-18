# Complete Authentication Flow Testing Guide

## Prerequisites

### 1. Start Backend Server

```bash
cd backend
npm run start:dev
```

**Expected:** Should see `🚀 Backend server running on http://localhost:3001/api`

### 2. Start Frontend Server

```bash
cd frontend
npm run dev
```

**Expected:** Should see `Ready on http://localhost:3000`

### 3. Verify Database

- Docker Compose should be running
- Prisma migrations applied
- Database is accessible

### 4. Check Environment Variables

- Backend: `.env` file should have JWT secrets configured
- Frontend: `.env.local` should have `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

---

## Complete Test Flow

### Phase 1: Initial State & Registration

#### Test 1.1: Visit Homepage (Unauthenticated)

- **Action:** Navigate to `http://localhost:3000`
- **Expected:**
  - ✅ Homepage loads without errors
  - ✅ No user menu visible (or shows "Login" link)
  - ✅ Can browse products (public access)

#### Test 1.2: Access Protected Route (Unauthenticated)

- **Action:** Navigate to `http://localhost:3000/profile`
- **Expected:**
  - ✅ Middleware redirects to `/login?redirect=/profile`
  - ✅ Login page displays
  - ✅ Redirect parameter is preserved in URL

#### Test 1.3: Navigate to Registration Page

- **Action:** Click "Create one now" link on login page OR navigate to `/register`
- **Expected:**
  - ✅ Registration form displays
  - ✅ Form has fields: Email, Password
  - ✅ Form validation is active (Yup schema)

#### Test 1.4: Test Registration Form Validation

- **Action:** Try submitting empty form
- **Expected:**

  - ✅ Form shows validation errors
  - ✅ Email field shows "Email is required"
  - ✅ Password field shows "Password is required"

- **Action:** Enter invalid email (e.g., "notanemail")
- **Expected:**

  - ✅ Email validation error appears

- **Action:** Enter weak password (e.g., "123")
- **Expected:**
  - ✅ Password validation error appears (must meet requirements)

#### Test 1.5: Successful Registration

- **Action:** Fill registration form:
  - Email: `testuser@example.com` (use unique email each time)
  - Password: `Test1234!` (must meet requirements)
- **Action:** Click "REGISTER" button
- **Expected:**
  - ✅ Button shows loading state (spinner)
  - ✅ Form is disabled during submission
  - ✅ After success: Redirects to homepage (`/`)
  - ✅ User is logged in automatically
  - ✅ User data stored in localStorage (check DevTools → Application → Local Storage → `auth-storage`)
  - ✅ Access token set in httpOnly cookie (check DevTools → Application → Cookies)
  - ✅ Header shows user menu/name (if implemented)

#### Test 1.6: Registration with Duplicate Email

- **Action:** Try registering with same email again
- **Expected:**
  - ✅ Error message displayed: "Email already exists" or similar
  - ✅ Error shown in red Alert component
  - ✅ User remains on registration page
  - ✅ Form is not disabled (can retry)

#### Test 1.7: Registration with Redirect Parameter

- **Action:** Navigate to `/register?redirect=/profile`
- **Action:** Complete registration successfully
- **Expected:**
  - ✅ After registration, redirects to `/profile` (not homepage)
  - ✅ User can access protected route immediately

---

### Phase 2: Login Flow

#### Test 2.1: Navigate to Login Page

- **Action:** Navigate to `http://localhost:3000/login`
- **Expected:**
  - ✅ Login form displays
  - ✅ Form has fields: Email, Password, Remember Me checkbox
  - ✅ Link to registration page visible

#### Test 2.2: Test Login Form Validation

- **Action:** Try submitting empty form
- **Expected:**

  - ✅ Form shows validation errors
  - ✅ Email and password fields show required errors

- **Action:** Enter invalid email format
- **Expected:**
  - ✅ Email validation error appears

#### Test 2.3: Login with Wrong Credentials

- **Action:** Enter:
  - Email: `wrong@example.com`
  - Password: `WrongPass123!`
- **Action:** Click "LOG IN" button
- **Expected:**
  - ✅ Button shows loading state
  - ✅ After failure: Error message displayed in red Alert
  - ✅ Error message: "Invalid credentials" or similar
  - ✅ User remains on login page
  - ✅ Form is not disabled (can retry)
  - ✅ Password field is cleared (security best practice)

#### Test 2.4: Login with Wrong Password (Correct Email)

- **Action:** Enter:
  - Email: `testuser@example.com` (from registration)
  - Password: `WrongPassword123!`
- **Action:** Click "LOG IN"
- **Expected:**
  - ✅ Error message: "Invalid credentials"
  - ✅ User not logged in

#### Test 2.5: Successful Login

- **Action:** Enter correct credentials:
  - Email: `testuser@example.com`
  - Password: `Test1234!`
- **Action:** Click "LOG IN" button
- **Expected:**
  - ✅ Button shows loading state
  - ✅ After success: Redirects to homepage (`/`)
  - ✅ User is logged in
  - ✅ User data in localStorage updated
  - ✅ Access token in httpOnly cookie updated
  - ✅ Header shows user menu/name

#### Test 2.6: Login with Redirect Parameter

- **Action:** Navigate to `/login?redirect=/profile`
- **Action:** Complete login successfully
- **Expected:**
  - ✅ After login, redirects to `/profile` (not homepage)
  - ✅ User can access protected route

#### Test 2.7: Remember Me Checkbox

- **Action:** Check "Remember me" checkbox and login
- **Expected:**
  - ✅ Login works normally
  - ✅ Token persistence works (tested in Phase 3)

---

### Phase 3: Authentication Persistence & State

#### Test 3.1: Token Persistence After Page Refresh

- **Action:** After successful login, refresh the page (F5 or Ctrl+R)
- **Expected:**
  - ✅ User remains logged in
  - ✅ No redirect to login page
  - ✅ User data still visible
  - ✅ AuthProvider calls `/auth/me` on initialization
  - ✅ User state restored from localStorage

#### Test 3.2: Token Persistence After Browser Restart

- **Action:** Close browser completely, reopen, navigate to `http://localhost:3000`
- **Expected:**
  - ✅ User still logged in (if tokens valid)
  - ✅ User data restored from localStorage
  - ✅ AuthProvider validates token via `/auth/me`

#### Test 3.3: Multiple Tab Synchronization

- **Action:** Open two tabs, login in Tab 1
- **Expected:**
  - ✅ Tab 2 should reflect logged-in state (after refresh or via localStorage sync)
  - ✅ Both tabs show user as authenticated

#### Test 3.4: Logout Functionality

- **Action:** Click logout button (if available) OR call logout function
- **Expected:**
  - ✅ User logged out
  - ✅ User data cleared from localStorage
  - ✅ Cookies cleared (or invalidated on server)
  - ✅ Redirects to homepage or login page
  - ✅ Cannot access protected routes

---

### Phase 4: Protected Routes & Authorization

#### Test 4.1: Access Protected Routes (Authenticated)

- **Action:** While logged in, navigate to:
  - `/profile`
  - `/checkout`
  - `/cart`
- **Expected:**
  - ✅ All routes accessible
  - ✅ No redirect to login
  - ✅ Content loads correctly

#### Test 4.2: Access Protected Routes (Unauthenticated)

- **Action:** After logout, try accessing `/profile`
- **Expected:**
  - ✅ Middleware redirects to `/login?redirect=/profile`
  - ✅ Cannot access protected route

#### Test 4.3: Admin Routes (Role-Based Access)

- **Action:** As regular user, try accessing `/admin`
- **Expected:**

  - ✅ Redirects to homepage or shows "Access Denied"
  - ✅ Cannot access admin routes

- **Action:** Create admin user (via backend/seed) and login
- **Action:** Navigate to `/admin`
- **Expected:**
  - ✅ Admin dashboard accessible
  - ✅ Admin features visible

#### Test 4.4: Protected Route with Query Parameters

- **Action:** While logged out, navigate to `/profile?tab=orders`
- **Expected:**
  - ✅ Redirects to `/login?redirect=/profile?tab=orders`
  - ✅ After login, redirects back to `/profile?tab=orders` (with query params preserved)

---

### Phase 5: Token Expiration & Refresh

#### Test 5.1: Token Expiration Handling

- **Action:** Wait for access token to expire (or manually expire it in backend)
- **Action:** Make an API call (e.g., navigate to protected route)
- **Expected:**
  - ✅ Axios interceptor detects 401
  - ✅ Attempts to refresh token automatically
  - ✅ If refresh succeeds: Request retried, user stays logged in
  - ✅ If refresh fails: User logged out, redirected to login

#### Test 5.2: Auth Expiration Event

- **Action:** Simulate token expiration (or wait for it)
- **Expected:**
  - ✅ `onAuthExpired` event fired
  - ✅ AuthProvider clears auth state
  - ✅ Redirects to login with current path as redirect parameter
  - ✅ User sees appropriate message (if implemented)

---

### Phase 6: Error Handling & Edge Cases

#### Test 6.1: Network Error During Login

- **Action:** Stop backend server, try to login
- **Expected:**
  - ✅ Error message displayed: "Network error" or "Unable to connect"
  - ✅ User not logged in
  - ✅ Form can be retried

#### Test 6.2: Network Error During Registration

- **Action:** Stop backend server, try to register
- **Expected:**
  - ✅ Error message displayed
  - ✅ User not registered
  - ✅ Form can be retried

#### Test 6.3: Invalid Token in Cookie

- **Action:** Manually set invalid token in cookie, refresh page
- **Expected:**
  - ✅ `/auth/me` call fails with 401
  - ✅ User logged out automatically
  - ✅ Redirects to login

#### Test 6.4: Concurrent Login Attempts

- **Action:** Click login button multiple times rapidly
- **Expected:**
  - ✅ Only one request sent
  - ✅ Button disabled during submission (`isSubmitting` state)
  - ✅ No duplicate API calls

#### Test 6.5: Form Error Clearing

- **Action:** Trigger an error, then start typing in form
- **Expected:**
  - ✅ Error message clears (if `clearError` is called on input change)
  - ✅ Or error persists until successful submission

---

### Phase 7: UI/UX Validation

#### Test 7.1: Loading States

- **Action:** Submit login/register form
- **Expected:**
  - ✅ Button shows loading spinner
  - ✅ Button text changes to "Loading..." or similar
  - ✅ Form inputs disabled during submission

#### Test 7.2: Error Display

- **Action:** Trigger various errors
- **Expected:**
  - ✅ Errors displayed in red Alert component
  - ✅ Error messages are user-friendly (not technical)
  - ✅ Errors are clearly visible

#### Test 7.3: Success Feedback

- **Action:** Complete successful login/registration
- **Expected:**
  - ✅ Smooth redirect (no flash of content)
  - ✅ User sees appropriate success state

#### Test 7.4: Responsive Design

- **Action:** Test on mobile, tablet, desktop
- **Expected:**
  - ✅ Forms are responsive
  - ✅ Buttons are easily clickable
  - ✅ Text is readable

---

## Browser DevTools Checks

### Application Tab → Local Storage

- **Check:** `auth-storage` key exists
- **Value:** Should contain `{"state":{"user":{...},"version":0}}`
- **User object:** Should have `id`, `email`, `firstName`, `lastName`, `role`

### Application Tab → Cookies

- **Check:** `accessToken` cookie exists (httpOnly, secure in production)
- **Check:** `refreshToken` cookie exists (scoped to `/api/auth/refresh`)
- **Path:** Access token should be scoped to `/api`

### Network Tab

- **Check:** `/auth/login` or `/auth/register` returns 200
- **Check:** Response includes `Set-Cookie` headers
- **Check:** `/auth/me` called on page load (after login)
- **Check:** No unnecessary duplicate calls

### Console Tab

- **Check:** No errors or warnings
- **Check:** Auth-related logs (if debug mode enabled)

---

## Backend API Verification

### Test Backend Endpoints Directly

#### Register Endpoint

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","firstName":"Test","lastName":"User"}'
```

- **Expected:** Returns user data, sets cookies

#### Login Endpoint

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

- **Expected:** Returns user data, sets cookies

#### Get Current User

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

- **Expected:** Returns user data if token valid

---

## Checklist Summary

### Registration Flow

- [ ] Registration form displays correctly
- [ ] Form validation works (empty, invalid email, weak password)
- [ ] Successful registration logs user in
- [ ] Duplicate email shows error
- [ ] Redirect parameter works
- [ ] User data stored in localStorage
- [ ] Cookies set correctly

### Login Flow

- [ ] Login form displays correctly
- [ ] Form validation works
- [ ] Wrong credentials show error
- [ ] Successful login works
- [ ] Redirect parameter works
- [ ] Remember me checkbox works

### Authentication State

- [ ] User persists after page refresh
- [ ] User persists after browser restart
- [ ] Multiple tabs stay synchronized
- [ ] Logout clears all state

### Protected Routes

- [ ] Authenticated users can access protected routes
- [ ] Unauthenticated users redirected to login
- [ ] Redirect parameter preserved
- [ ] Query parameters preserved in redirect
- [ ] Admin routes require admin role

### Token Management

- [ ] Token refresh works automatically
- [ ] Expired tokens handled gracefully
- [ ] Auth expiration events fire correctly

### Error Handling

- [ ] Network errors handled
- [ ] Invalid tokens handled
- [ ] Concurrent requests prevented
- [ ] Error messages are user-friendly

### UI/UX

- [ ] Loading states work
- [ ] Error display is clear
- [ ] Forms are responsive
- [ ] No console errors

---

## Common Issues & Solutions

### Issue: Forms Not Submitting

**Check:**

- Browser console for errors
- Backend server is running
- `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Network tab shows request being sent

**Solution:**

- Verify API URL is correct
- Check CORS settings on backend
- Verify backend is accessible

### Issue: 401 Unauthorized Errors

**Check:**

- Backend JWT secrets are set in `.env`
- Tokens are being set in cookies
- Cookie domain/path settings are correct

**Solution:**

- Verify JWT secrets match between access and refresh token generation
- Check cookie settings (httpOnly, secure, sameSite)
- Verify token expiration times

### Issue: Redirect Loops

**Check:**

- Middleware is not redirecting authenticated users away from login
- AuthProvider is not causing infinite re-renders
- Token validation is working correctly

**Solution:**

- Verify middleware logic for auth routes
- Check AuthProvider initialization logic
- Ensure `checkAuth` is not called repeatedly

### Issue: Styling Looks Wrong

**Check:**

- `globals.css` has color variables defined
- Tailwind is compiling correctly
- CSS classes are applied

**Solution:**

- Run `npm run build` to check for Tailwind errors
- Verify Tailwind config includes all necessary paths

### Issue: User Not Persisting After Refresh

**Check:**

- localStorage has `auth-storage` key
- `checkAuth` is being called on mount
- `/auth/me` endpoint is working

**Solution:**

- Verify Zustand persist middleware is configured
- Check that `checkAuth` is called in AuthProvider
- Verify backend `/auth/me` endpoint returns correct data

---

## Advanced Testing Scenarios

### Test Token Refresh Flow

1. Login successfully
2. Wait for access token to expire (or modify expiration in backend)
3. Make an API call
4. Verify refresh token is used automatically
5. Verify new access token is set

### Test Concurrent Sessions

1. Login in Browser A
2. Login with same account in Browser B
3. Verify both sessions work independently
4. Logout from Browser A
5. Verify Browser B still works

### Test Role-Based Access

1. Create regular user account
2. Try accessing `/admin`
3. Verify access denied
4. Create admin account (via backend)
5. Login as admin
6. Verify admin routes accessible

---

## Notes

- **Security:** Tokens are stored in httpOnly cookies (not accessible to JavaScript)
- **State Management:** User state is in Zustand store with localStorage persistence
- **Token Refresh:** Automatic via Axios interceptor
- **Route Protection:** Middleware handles edge protection, backend handles real enforcement
- **Error Handling:** Errors are caught and displayed in user-friendly format
