import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductMapperService } from './services/product-mapper.service';
import { VariantService } from './services/variant.service';
import { ProductDerivedFieldsService } from './services/product-derived-fields.service';

@Module({
  imports: [PrismaModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductMapperService,
    VariantService,
    ProductDerivedFieldsService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
