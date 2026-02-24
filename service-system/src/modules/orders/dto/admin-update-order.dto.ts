import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'failed',
] as const;

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

export class AdminUpdateOrderDto {
  @ApiPropertyOptional({ enum: ORDER_STATUSES })
  @IsOptional()
  @IsString()
  @IsIn(ORDER_STATUSES)
  status?: (typeof ORDER_STATUSES)[number];

  @ApiPropertyOptional({ enum: PAYMENT_STATUSES })
  @IsOptional()
  @IsString()
  @IsIn(PAYMENT_STATUSES)
  paymentStatus?: (typeof PAYMENT_STATUSES)[number];
}
