import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from 'src/common/utils/current-user.util';
import { AddressesService } from '../addresses/addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private service: OrdersService,
    private addressesService: AddressesService,
  ) {}

  @Get()
  getMyOrders(@CurrentUser() user) {
    return this.service.getMyOrders(user.id);
  }

  @Get(':id')
  getOrderDetail(@Param('id') id: string, @CurrentUser() user) {
    return this.service.getOrderDetail(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user) {
    return this.service.createOrder(dto, user);
  }

  @Get('count')
  getOrdersCount(@CurrentUser() user) {
    return this.service.getOrdersCount(user.id);
  }

  @Get('addresses')
  getOrderAddresses(@CurrentUser() user) {
    return this.addressesService.getAddressesByUser(user.id);
  }

  @Post('refund')
  refund(@Body() body: any) {
    return { success: true, message: 'Refund requested (mock)', payload: body };
  }

  @Post('send-email')
  sendEmail(@Body() body: any) {
    return { success: true, message: 'Order email queued (mock)', payload: body };
  }

  @Post(':orderId/pay')
  pay(@Param('orderId') orderId: string, @Body() body: any) {
    return { success: true, message: 'Payment initiated (mock)', orderId, payload: body };
  }

  @Post(':orderId/pay-now')
  payNow(@Param('orderId') orderId: string, @Body() body: any) {
    return { success: true, message: 'Payment completed (mock)', orderId, payload: body };
  }

  @Get(':orderId/generate-invoice')
  generateInvoice(@Param('orderId') orderId: string) {
    return { success: true, message: 'Invoice generated (mock)', orderId };
  }
}
