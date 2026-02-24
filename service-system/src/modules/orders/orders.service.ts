import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserOrderActionDto } from './dto/user-order-action.dto';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private repo: OrdersRepository) {}

  async createOrder(dto: CreateOrderDto, user: any) {
    const orderNumber = `ORDER-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;

    const data: any = {
      orderNumber,
      userId: user.id,
      customerName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      email: user.email,
      phone: user.phone ?? '',

      status: 'pending',
      paymentMethod: dto.paymentMethod,
      paymentStatus: dto.paymentMethod === 'cod' ? 'pending' : 'paid',

      totalPrice: dto.totalPrice,
      subtotal: dto.subtotal,
      shipping: dto.shipping,
      tax: dto.tax,

      addressName: dto.addressName,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      zip: dto.zip,

      products: {
        create: dto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    };

    const order = await this.repo.create(data);

    return {
      success: true,
      message: 'Order created successfully',
      order,
    };
  }

  async getMyOrders(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async getOrderDetail(orderId: string, userId: string) {
    const order = await this.repo.findById(orderId);

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrdersCount(userId: string) {
    const totalOrders = await this.repo.countByUserId(userId);
    return { success: true, totalOrders };
  }

  async updateOrderByAdmin(orderId: string, dto: AdminUpdateOrderDto) {
    const order = await this.repo.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!dto.status && !dto.paymentStatus) {
      throw new BadRequestException('status or paymentStatus is required');
    }

    return this.repo.updateById(orderId, {
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.paymentStatus ? { paymentStatus: dto.paymentStatus } : {}),
    });
  }

  async handleMyOrderAction(orderId: string, userId: string, dto: UserOrderActionDto) {
    const order = await this.repo.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (dto.action === 'cancel') {
      const cancellable = [
        'pending',
        'address_confirmed',
        'order_confirmed',
        'packed',
        'ready_for_delivery',
        'rescheduled',
      ];
      if (!cancellable.includes(order.status)) {
        throw new BadRequestException('Order cannot be cancelled at this stage');
      }

      const cancelled = await this.repo.updateById(orderId, { status: 'cancelled' });
      return { success: true, message: 'Order cancelled', order: cancelled };
    }

    const receivable = ['out_for_delivery', 'delivered'];
    if (!receivable.includes(order.status)) {
      throw new BadRequestException('Order cannot be confirmed as received');
    }

    const completed = await this.repo.updateById(orderId, { status: 'completed' });
    return { success: true, message: 'Order marked as completed', order: completed };
  }
}
