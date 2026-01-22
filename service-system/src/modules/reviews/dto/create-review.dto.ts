import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty()
  @IsString()
  @Length(5, 100)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(20, 1000)
  content: string;
}
