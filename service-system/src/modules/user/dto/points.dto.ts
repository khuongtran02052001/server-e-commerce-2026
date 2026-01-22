import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdatePointsDto {
  @ApiProperty()
  @IsNumber()
  orderTotal: number;

  @ApiProperty()
  @IsNumber()
  @IsString()
  orderId: string;
}
