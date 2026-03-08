import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

function createMockContext(user: { role?: string } | null): ExecutionContext {
  const request = { user };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get(RolesGuard);
    reflector = module.get(Reflector) as jest.Mocked<Reflector>;

    jest.clearAllMocks();
  });

  it('allows when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createMockContext(null))).toBe(true);
    expect(guard.canActivate(createMockContext({ role: UserRole.CUSTOMER }))).toBe(true);
  });

  it('allows when user has one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.STAFF]);

    expect(guard.canActivate(createMockContext({ role: UserRole.ADMIN }))).toBe(true);
    expect(guard.canActivate(createMockContext({ role: UserRole.STAFF }))).toBe(true);
  });

  it('denies when user does not have required role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(createMockContext({ role: UserRole.CUSTOMER }))).toBe(false);
    expect(guard.canActivate(createMockContext(null))).toBe(false);
  });

  it('denies when user is undefined', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(createMockContext(null))).toBe(false);
  });
});
