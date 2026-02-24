import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from 'src/common/utils/current-user.util';
import { AddressesService } from '../addresses/addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserOrderActionDto } from './dto/user-order-action.dto';
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

  @Patch(':id/action')
  handleMyOrderAction(
    @Param('id') id: string,
    @Body() dto: UserOrderActionDto,
    @CurrentUser() user,
  ) {
    return this.service.handleMyOrderAction(id, user.id, dto);
  }
}
