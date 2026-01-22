import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class RelatedProductsQueryDTO {
  @ApiProperty({ required: false })
  @IsString()
  categoryIds?: string;

  @ApiProperty({ required: false })
  @IsString()
  currentSlug?: string;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
