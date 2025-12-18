export class AddressResponseDto {
  id!: string;
  userId!: string;
  label?: string | null;
  name!: string;
  street!: string;
  street2?: string | null;
  city!: string;
  state?: string | null;
  zipCode!: string;
  country!: string;
  phone?: string | null;
  isDefault!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
