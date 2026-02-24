import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

const USER_ORDER_ACTIONS = ['cancel', 'confirm_received'] as const;

export class UserOrderActionDto {
  @ApiProperty({ enum: USER_ORDER_ACTIONS })
  @IsString()
  @IsIn(USER_ORDER_ACTIONS)
  action: (typeof USER_ORDER_ACTIONS)[number];
}
