import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { CouponsModule } from '../coupons/coupons.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    CartModule,
    ProductsModule,
    CouponsModule,
    PromotionsModule,
    EmailModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
