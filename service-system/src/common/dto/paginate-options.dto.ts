// src/products/dto/paginate-options.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginateOptionsDTO {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number) // chuyển '2' -> 2
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  perPage?: number = 10;
}
