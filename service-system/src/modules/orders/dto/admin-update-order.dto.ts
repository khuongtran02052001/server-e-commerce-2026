import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

const ORDER_STATUSES = [
  'pending',
  'address_confirmed',
  'order_confirmed',
  'packed',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
  'rescheduled',
  'failed_delivery',
] as const;

const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
  'stripe',
  'cash_on_delivery',
] as const;

export class AdminUpdateOrderDto {
  @ApiPropertyOptional({ enum: ORDER_STATUSES })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const normalized = value.toLowerCase();
    if (normalized === 'canceled') return 'cancelled';
    return normalized;
  })
  @IsString()
  @IsIn(ORDER_STATUSES)
  status?: (typeof ORDER_STATUSES)[number];

  @ApiPropertyOptional({ enum: PAYMENT_STATUSES })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const normalized = value.toLowerCase();
    if (normalized === 'completed') return 'paid';
    if (normalized === 'unpaid') return 'pending';
    return normalized;
  })
  @IsString()
  @IsIn(PAYMENT_STATUSES)
  paymentStatus?: (typeof PAYMENT_STATUSES)[number];
}
