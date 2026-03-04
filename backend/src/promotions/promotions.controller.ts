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
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionResponseDto,
} from './dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  findAll(): Promise<PromotionResponseDto[]> {
    return this.promotionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PromotionResponseDto> {
    return this.promotionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePromotionDto): Promise<PromotionResponseDto> {
    return this.promotionsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    return this.promotionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.promotionsService.remove(id);
  }
}
