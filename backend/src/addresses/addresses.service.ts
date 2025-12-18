import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAddressDto, UpdateAddressDto, AddressResponseDto } from './dto';
import { AddressNotFoundException } from '../common/exceptions/address-not-found.exception';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<AddressResponseDto[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((address) => this.mapToResponseDto(address));
  }

  async findOne(id: string, userId: string): Promise<AddressResponseDto> {
    const address = await this.prisma.address.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!address) {
      throw new AddressNotFoundException();
    }

    return this.mapToResponseDto(address);
  }

  async create(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    // If this is set as default, unset other default addresses
    if (createAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Map frontend fields to database fields
    const data: Prisma.AddressCreateInput = {
      user: { connect: { id: userId } },
      name: createAddressDto.name,
      street1: createAddressDto.street,
      city: createAddressDto.city,
      state: createAddressDto.state ?? null,
      postalCode: createAddressDto.zipCode ?? null,
      country: createAddressDto.country || 'US',
      phone: createAddressDto.phone ?? null,
      isDefault: createAddressDto.isDefault || false,
    };

    const address = await this.prisma.address.create({ data });
    return this.mapToResponseDto(address);
  }

  async update(
    id: string,
    userId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    // Verify address belongs to user
    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AddressNotFoundException();
    }

    // If setting as default, unset other default addresses
    if (updateAddressDto.isDefault === true) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Build update data
    const data: Prisma.AddressUpdateInput = {};
    if (updateAddressDto.name !== undefined) {
      data.name = updateAddressDto.name;
    }
    if (updateAddressDto.street !== undefined) {
      data.street1 = updateAddressDto.street;
    }
    if (updateAddressDto.city !== undefined) {
      data.city = updateAddressDto.city;
    }
    if (updateAddressDto.state !== undefined) {
      data.state = updateAddressDto.state;
    }
    if (updateAddressDto.zipCode !== undefined) {
      data.postalCode = updateAddressDto.zipCode;
    }
    if (updateAddressDto.country !== undefined) {
      data.country = updateAddressDto.country;
    }
    if (updateAddressDto.phone !== undefined) {
      data.phone = updateAddressDto.phone;
    }
    if (updateAddressDto.isDefault !== undefined) {
      data.isDefault = updateAddressDto.isDefault;
    }

    const address = await this.prisma.address.update({
      where: { id },
      data,
    });

    return this.mapToResponseDto(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      throw new AddressNotFoundException();
    }

    await this.prisma.address.delete({
      where: { id },
    });
  }

  private mapToResponseDto(
    address: Prisma.AddressGetPayload<Record<string, never>>,
  ): AddressResponseDto {
    return {
      id: address.id,
      userId: address.userId,
      name: address.name,
      street: address.street1,
      city: address.city,
      state: address.state,
      zipCode: address.postalCode ?? '',
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
