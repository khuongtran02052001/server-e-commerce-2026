import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ required: false })
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  range?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  imageUrl: string;
}
