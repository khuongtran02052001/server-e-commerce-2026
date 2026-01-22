import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { ProductStatus } from 'generated/prisma';

export class CreateProductDto {
  @ApiProperty({ required: false })
  @IsString()
  name: string;
  @ApiProperty({ required: false })
  @IsString()
  slug: string;
  @ApiProperty({ required: false })
  @IsString()
  description: string;
  @ApiProperty({ required: false })
  @IsNumber()
  price: number;
  @ApiProperty({ required: false })
  @IsNumber()
  discount: number;
  @ApiProperty({ required: false })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  categoryIds: string[];
  @ApiProperty({ required: false })
  @IsNumber()
  stock: number;
  @ApiProperty({ required: false })
  @IsEnum(ProductStatus)
  status: ProductStatus;
  @ApiProperty({ required: false })
  @IsBoolean()
  isFeatured: boolean;
  @ApiProperty({ required: false })
  @IsNumber()
  averageRating: number;
  @ApiProperty({ required: false })
  @IsString()
  userId: string;
  @ApiProperty({ required: false })
  @IsString()
  brandId: string;
  @ApiProperty({ required: false })
  @IsNumber()
  totalReviews: number;
}
