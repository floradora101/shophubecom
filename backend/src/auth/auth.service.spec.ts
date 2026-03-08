import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUserCacheService } from '../common/cache/auth-user-cache.service';
import { EmailService } from '../email/email.service';
import { createHash } from 'crypto';
import { UserRole } from '@prisma/client';
import {
  UserAlreadyExistsException,
  InvalidCredentialsException,
  InvalidResetTokenException,
} from '../common/exceptions';
import * as bcrypt from 'bcrypt';

// Mock bcrypt so we can assert compare is called (timing-safe path when user not found).
// AuthService imports { compare } from 'bcrypt', so the mock must replace the module.
jest.mock('bcrypt', () => {
  const actual = jest.requireActual<typeof import('bcrypt')>('bcrypt');
  return {
    ...actual,
    compare: jest.fn((...args: unknown[]) =>
      actual.compare(...(args as [string, string])),
    ),
  };
});

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '$2b$10$dummyhash',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          JWT_ACCESS_SECRET: 'access-secret',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_ACCESS_EXPIRY: '15m',
          JWT_REFRESH_EXPIRY: '7d',
        };
        return config[key];
      }),
    };

    const mockPrismaService = {
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'rt-1', userId: mockUser.id, tokenHash: 'hash', expiresAt: new Date(), createdAt: new Date() }),
        findUnique: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      loginLockout: {
        findUnique: jest.fn().mockResolvedValue(null),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      passwordResetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const mockAuthUserCacheService = {
      invalidate: jest.fn(),
    };

    const mockEmailService = {
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuthUserCacheService, useValue: mockAuthUserCacheService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);

    await authService.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user, hash password, and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).toHaveBeenCalled();
      const createCall = usersService.create.mock.calls[0][0];
      expect(createCall.email).toBe('test@example.com');
      expect(createCall.passwordHash).not.toBe('Test123!@#');
      expect(createCall.role).toBe(UserRole.CUSTOMER);
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            tokenHash: expect.stringContaining('sha256:'),
            expiresAt: expect.any(Date),
          }),
        }),
      );
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toBeDefined();
    });

    it('should throw UserAlreadyExistsException when email exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'Test123!@#',
        }),
      ).rejects.toThrow(UserAlreadyExistsException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user on valid credentials', async () => {
      const userWithHash = {
        ...mockUser,
        passwordHash: await bcrypt.hash('correct-password', 10),
      };
      usersService.findByEmail.mockResolvedValue(userWithHash);

      const result = await authService.validateUser({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result).toEqual(userWithHash);
    });

    it('should run bcrypt compare when user not found (timing safety)', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.validateUser({
          email: 'nonexistent@example.com',
          password: 'any-password',
        }),
      ).rejects.toThrow(InvalidCredentialsException);

      expect(bcrypt.compare).toHaveBeenCalledWith('any-password', expect.any(String));
    });

    it('should throw InvalidCredentialsException on wrong password', async () => {
      const userWithHash = {
        ...mockUser,
        passwordHash: await bcrypt.hash('correct-password', 10),
      };
      usersService.findByEmail.mockResolvedValue(userWithHash);

      await expect(
        authService.validateUser({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('login', () => {
    it('should return tokens and user on valid credentials', async () => {
      const userWithHash = {
        ...mockUser,
        passwordHash: await bcrypt.hash('correct-password', 10),
      };
      usersService.findByEmail.mockResolvedValue(userWithHash);
      jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toBeDefined();
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            tokenHash: expect.stringContaining('sha256:'),
            expiresAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should rotate tokens and invalidate old one', async () => {
      const token = 'valid-refresh-token';
      const digest = createHash('sha256').update(token).digest('hex');
      const storedToken = {
        id: 'rt-1',
        tokenHash: `sha256:${digest}`,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
      };
      jwtService.verify.mockReturnValue({ sub: mockUser.id });
      usersService.findById.mockResolvedValue(mockUser);
      prismaService.refreshToken.findUnique.mockResolvedValue(storedToken);
      prismaService.refreshToken.delete.mockResolvedValue(storedToken);
      prismaService.refreshToken.create.mockResolvedValue({ ...storedToken, id: 'rt-2', tokenHash: 'sha256:newhash' });
      jwtService.signAsync.mockResolvedValueOnce('new-access').mockResolvedValueOnce('new-refresh');

      const result = await authService.refresh({ refreshToken: token });

      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tokenHash: `sha256:${digest}` } }),
      );
      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'rt-1' } });
      expect(prismaService.refreshToken.create).toHaveBeenCalled();
    });

    it('should reject expired/invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(
        authService.refresh({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('forgotPassword', () => {
    it('should return same message for existing and non-existing emails', async () => {
      const expectedMessage = 'If an account exists, a reset link has been sent.';

      usersService.findByEmail.mockResolvedValue(null);
      const resultNonexistent = await authService.forgotPassword({
        email: 'nonexistent@example.com',
      });
      expect(resultNonexistent.message).toBe(expectedMessage);

      usersService.findByEmail.mockResolvedValue(mockUser);
      prismaService.passwordResetToken.create.mockResolvedValue({
        id: 'token-1',
        userId: mockUser.id,
        tokenHash: 'hash',
        expiresAt: new Date(),
        used: false,
      });
      const resultExisting = await authService.forgotPassword({
        email: 'test@example.com',
      });
      expect(resultExisting.message).toBe(expectedMessage);
    });
  });

  describe('resetPassword', () => {
    it('should update password and invalidate all refresh tokens', async () => {
      const rawToken = 'raw-token-value';
      const hashedToken = await bcrypt.hash(rawToken, 10);
      const record = {
        id: 'token-id',
        userId: mockUser.id,
        tokenHash: hashedToken,
        expiresAt: new Date(Date.now() + 60000),
        used: false,
      };
      prismaService.passwordResetToken.findUnique.mockResolvedValue(record);
      usersService.updateUser.mockResolvedValue(mockUser);
      prismaService.passwordResetToken.update.mockResolvedValue(record);
      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      const result = await authService.resetPassword({
        token: `token-id:${rawToken}`,
        password: 'NewPassword123!',
      });

      expect(result.message).toBe('Password reset successful');
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, expect.objectContaining({
        passwordHash: expect.any(String),
      }));
      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
      expect(prismaService.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'token-id' },
        data: { used: true },
      });
    });

    it('should reject expired/used token', async () => {
      prismaService.passwordResetToken.findUnique.mockResolvedValue({
        id: 'token-id',
        userId: mockUser.id,
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() - 1000),
        used: false,
      });

      await expect(
        authService.resetPassword({
          token: 'token-id:raw-token',
          password: 'NewPassword123!',
        }),
      ).rejects.toThrow(InvalidResetTokenException);
    });
  });
});
