import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProductStatus } from 'generated/prisma';
import { PaginateOptionsDTO } from '../../../common/dto/paginate-options.dto';

export class FindProductsQueryDTO extends PaginateOptionsDTO {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  variant?: ProductStatus;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsIn(['name', 'price', 'createdAt', 'updatedAt'])
  sort?: 'name' | 'price' | 'createdAt' | 'updatedAt' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';
}
