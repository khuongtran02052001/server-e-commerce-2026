import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  paymentMethod: string;

  // Address
  @IsString()
  addressName: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zip: string;
}
