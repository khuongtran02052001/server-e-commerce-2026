import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class EmailOrderItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;
}

class EmailShippingAddressDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  zipCode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;
}

class EmailOrderDataDto {
  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  orderDate: string;

  @ApiProperty({ type: [EmailOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailOrderItemDto)
  items: EmailOrderItemDto[];

  @ApiProperty()
  @IsNumber()
  subtotal: number;

  @ApiProperty()
  @IsNumber()
  shipping: number;

  @ApiProperty()
  @IsNumber()
  tax: number;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty({ type: EmailShippingAddressDto })
  @ValidateNested()
  @Type(() => EmailShippingAddressDto)
  shippingAddress: EmailShippingAddressDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  estimatedDelivery?: string;
}

export class SendOrderEmailDto {
  @ApiProperty({ type: EmailOrderDataDto })
  @ValidateNested()
  @Type(() => EmailOrderDataDto)
  orderData: EmailOrderDataDto;
}
