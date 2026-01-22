import { Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
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
}
