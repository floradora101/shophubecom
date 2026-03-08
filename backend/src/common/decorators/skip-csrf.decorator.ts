import { SetMetadata } from '@nestjs/common';
import { SKIP_CSRF_KEY } from '../guards/csrf.guard';

/**
 * Skip CSRF validation for this route or controller.
 * Use when ENABLE_CSRF=true but the endpoint does not need CSRF protection
 * (e.g. webhooks, health checks, or endpoints that use other CSRF mitigations).
 */
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
