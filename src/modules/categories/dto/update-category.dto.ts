import { IsString, IsOptional } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}