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
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { DepartmentsService } from './departments.service';
import {
  CreateDepartmentDto,
  DepartmentResponseDto,
  FilterDepartmentsDto,
  UpdateDepartmentDto,
} from './dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  /**
   * Public endpoint: active department spotlights for homepage usage.
   */
  @Get('active')
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findActive(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.findActive();
  }

  /**
   * Admin endpoint: list all departments with filtering and pagination.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findAll(@Query() filters: FilterDepartmentsDto): Promise<{
    data: DepartmentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.departmentsService.findAll(filters);
  }

  /**
   * Admin endpoint: get single department by ID.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  findOne(@Param('id') id: string): Promise<DepartmentResponseDto> {
    return this.departmentsService.findOne(id);
  }

  /**
   * Admin endpoint: create new department.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentsService.create(dto);
  }

  /**
   * Admin endpoint: update department.
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, dto);
  }

  /**
   * Admin endpoint: delete department.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.departmentsService.remove(id);
  }
}

