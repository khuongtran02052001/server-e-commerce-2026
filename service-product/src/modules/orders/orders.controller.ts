import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from 'src/common/utils/current-user.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private service: OrdersService) {}

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
}
