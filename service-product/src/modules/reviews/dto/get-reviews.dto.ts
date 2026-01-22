import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetReviewsQueryDto {
  @ApiProperty()
  @IsUUID()
  productId: string;
}
