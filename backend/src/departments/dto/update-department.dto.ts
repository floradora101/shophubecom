import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  parentCategoryId?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  highlightedSubCategoryIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

