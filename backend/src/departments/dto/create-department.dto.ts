import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  parentCategoryId!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  highlightedSubCategoryIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

