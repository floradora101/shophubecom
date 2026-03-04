import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  FilterCategoriesDto,
} from './dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per 60 seconds for read operations
  findAll(@Query() filters: FilterCategoriesDto): Promise<{
    data: CategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.categoriesService.findAll(filters);
  }

  @Get('tree')
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findTree(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findTree();
  }

  @Get(':id')
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per 60 seconds for read operations
  findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoriesService.remove(id);
  }
}
