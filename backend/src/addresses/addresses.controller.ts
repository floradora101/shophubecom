import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CreateAddressDto, UpdateAddressDto, AddressResponseDto } from './dto';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: AddressResponseDto[] }> {
    const addresses = await this.addressesService.findAll(user.id);
    return {
      success: true,
      data: addresses,
    };
  }

  @Get(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: AddressResponseDto }> {
    const address = await this.addressesService.findOne(id, user.id);
    return {
      success: true,
      data: address,
    };
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: AddressResponseDto }> {
    const address = await this.addressesService.create(
      user.id,
      createAddressDto,
    );
    return {
      success: true,
      data: address,
    };
  }

  @Put(':id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: AddressResponseDto }> {
    const address = await this.addressesService.update(
      id,
      user.id,
      updateAddressDto,
    );
    return {
      success: true,
      data: address,
    };
  }

  @Delete(':id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.addressesService.remove(id, user.id);
  }
}
