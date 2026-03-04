import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AdminModule } from './admin/admin.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';
import { CheckoutModule } from './checkout/checkout.module';
import { HeroSlidesModule } from './hero-slides/hero-slides.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { CouponsModule } from './coupons/coupons.module';
import { PromotionsModule } from './promotions/promotions.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmailModule } from './email/email.module';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ScheduleModule.forRoot(),
    // Rate limiting: 100 requests per 60 seconds by default
    // Increased for development - read operations (GET) are frequently accessed
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per ttl
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    AdminModule,
    OrdersModule,
    CartModule,
    AddressesModule,
    CheckoutModule,
    HeroSlidesModule,
    AnnouncementsModule,
    CouponsModule,
    PromotionsModule,
    DepartmentsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply throttler globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
