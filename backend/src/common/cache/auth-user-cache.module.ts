import { Global, Module } from '@nestjs/common';
import { AuthUserCacheService } from './auth-user-cache.service';

@Global()
@Module({
  providers: [AuthUserCacheService],
  exports: [AuthUserCacheService],
})
export class AuthUserCacheModule {}
