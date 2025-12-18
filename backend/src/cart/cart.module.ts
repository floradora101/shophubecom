import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartIdentityService } from './cart-identity.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [CartController],
  providers: [CartService, CartIdentityService],
  exports: [CartService],
})
export class CartModule {}
