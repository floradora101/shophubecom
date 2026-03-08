import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductMapperService } from './services/product-mapper.service';
import { VariantService } from './services/variant.service';
import { ProductPromotionService } from './services/product-promotion.service';
import { ProductQueryService } from './services/product-query.service';

@Module({
  imports: [PrismaModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductMapperService,
    VariantService,
    ProductPromotionService,
    ProductQueryService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
