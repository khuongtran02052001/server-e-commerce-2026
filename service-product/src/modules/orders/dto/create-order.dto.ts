import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  items: {
    productId: string;
    quantity: number;
  }[];

  @IsString()
  paymentMethod: string;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  shipping?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

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
