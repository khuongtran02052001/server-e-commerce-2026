import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateWishlistDto {
  @ApiProperty()
  @IsUUID()
  productId: string;
}
