import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserOrderActionDto } from './dto/user-order-action.dto';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private repo: OrdersRepository) {}

  private readonly orderTaxRate = Number(process.env.ORDER_TAX_RATE ?? 0);
  private readonly orderShippingFee = Number(process.env.ORDER_SHIPPING_FEE ?? 30000);
  private readonly freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD ?? 149000);

  private normalizePaymentMethod(method: string) {
    return method.trim().toLowerCase();
  }

  async createOrder(dto: CreateOrderDto, user: any) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must include at least one item');
    }

    const quantityByProductId = new Map<string, number>();
    for (const item of dto.items) {
      const current = quantityByProductId.get(item.productId) ?? 0;
      quantityByProductId.set(item.productId, current + item.quantity);
    }

    const productIds = Array.from(quantityByProductId.keys());
    const products = await this.repo.findProductsForOrder(productIds);
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products do not exist');
    }

    let subtotal = 0;
    for (const product of products) {
      const quantity = quantityByProductId.get(product.id) ?? 0;
      const unitPrice = product.price ?? 0;
      if (quantity <= 0) {
        throw new BadRequestException(`Invalid quantity for product ${product.id}`);
      }
      if (product.stock != null && product.stock < quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }
      subtotal += unitPrice * quantity;
    }

    const tax = Math.round(subtotal * this.orderTaxRate);
    const shipping = subtotal >= this.freeShippingThreshold ? 0 : this.orderShippingFee;
    const totalPrice = subtotal + tax + shipping;

    const orderNumber = `ORDER-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;
    const paymentMethod = this.normalizePaymentMethod(dto.paymentMethod);

    const orderData = {
      orderNumber,
      userId: user.id,
      customerName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      email: user.email,
      phone: user.phone ?? '',

      status: 'pending',
      paymentMethod: dto.paymentMethod,
      paymentStatus:
        paymentMethod === 'cod' || paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      totalPrice,
      subtotal,
      shipping,
      tax,

      addressName: dto.addressName,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      zip: dto.zip,
    };
    const orderItems = Array.from(quantityByProductId.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    let order;
    try {
      order = await this.repo.createWithStockReservation(orderData, orderItems);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('OUT_OF_STOCK:')) {
        const outProductId = error.message.replace('OUT_OF_STOCK:', '');
        throw new BadRequestException(`Insufficient stock for product ${outProductId}`);
      }
      throw error;
    }

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
