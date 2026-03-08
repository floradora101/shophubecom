import { Test } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { CsrfGuard, CSRF_TOKEN_COOKIE, CSRF_TOKEN_HEADER, SKIP_CSRF_KEY } from './csrf.guard';

function createMockContext(
  method: string,
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
): ExecutionContext {
  const request = {
    method,
    headers,
    cookies,
  } as unknown as import('express').Request;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  let configService: jest.Mocked<ConfigService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('false'),
    };

    const mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };

    const module = await Test.createTestingModule({
      providers: [
        CsrfGuard,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get(CsrfGuard);
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    reflector = module.get(Reflector) as jest.Mocked<Reflector>;

    jest.clearAllMocks();
  });

  it('allows when ENABLE_CSRF is not "true"', () => {
    configService.get.mockReturnValue('false');
    const ctx = createMockContext('POST', {}, {});

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows GET, HEAD, OPTIONS regardless of CSRF', () => {
    configService.get.mockReturnValue('true');
    const token = 'valid-token';

    expect(
      guard.canActivate(
        createMockContext('GET', { [CSRF_TOKEN_HEADER]: token }, { [CSRF_TOKEN_COOKIE]: token }),
      ),
    ).toBe(true);
    expect(
      guard.canActivate(
        createMockContext('HEAD', {}, {}),
      ),
    ).toBe(true);
    expect(
      guard.canActivate(
        createMockContext('OPTIONS', {}, {}),
      ),
    ).toBe(true);
  });

  it('allows when skipCsrf is set', () => {
    configService.get.mockReturnValue('true');
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = createMockContext('POST', {}, {});

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws when CSRF enabled and token missing', () => {
    configService.get.mockReturnValue('true');
    const ctx = createMockContext('POST', {}, {});

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx)).toThrow('Invalid or missing CSRF token');
  });

  it('throws when header and cookie tokens do not match', () => {
    configService.get.mockReturnValue('true');
    const ctx = createMockContext('POST', {
      [CSRF_TOKEN_HEADER]: 'header-token',
    }, {
      [CSRF_TOKEN_COOKIE]: 'cookie-token',
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows when tokens match', () => {
    configService.get.mockReturnValue('true');
    const token = 'valid-csrf-token';
    const ctx = createMockContext('POST', {
      [CSRF_TOKEN_HEADER]: token,
    }, {
      [CSRF_TOKEN_COOKIE]: token,
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
