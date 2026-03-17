import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { AdminUpdateOrderDto } from './dto/admin-update-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { SendOrderEmailDto } from './dto/send-order-email.dto';
import { UserOrderActionDto } from './dto/user-order-action.dto';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private repo: OrdersRepository) {}

  private mailerTransporter: nodemailer.Transporter | null = null;

  private readonly orderTaxRate = Number(process.env.ORDER_TAX_RATE ?? 0);
  private readonly orderShippingFee = Number(process.env.ORDER_SHIPPING_FEE ?? 30000);
  private readonly freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD ?? 149000);

  private normalizePaymentMethod(method: string) {
    return method.trim().toLowerCase();
  }

  private getMailerTransporter() {
    if (this.mailerTransporter) return this.mailerTransporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new BadRequestException('SMTP is not configured');
    }

    const secureEnv = process.env.SMTP_SECURE;
    const secure = secureEnv ? secureEnv === 'true' : port === 465;

    this.mailerTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    return this.mailerTransporter;
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

  async sendOrderEmail(dto: SendOrderEmailDto, user: { email?: string }) {
    const payload = dto?.orderData;
    if (!payload?.customerEmail) {
      throw new BadRequestException('Customer email is required');
    }

    if (user?.email && payload.customerEmail !== user.email) {
      throw new BadRequestException('Email does not match authenticated user');
    }

    const transporter = this.getMailerTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';

    const itemsHtml = payload.items
      .map((item) => {
        const imageHtml = item.image
          ? `<img src="${item.image}" alt="${item.name}" width="56" height="56" style="border-radius:8px; object-fit:cover; display:block;" />`
          : `<div style="width:56px;height:56px;border-radius:8px;background:#f1f5f9;"></div>`;
        return `
          <tr>
            <td style="padding:12px 0; border-bottom:1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding-right:12px;">${imageHtml}</td>
                  <td>
                    <div style="font-weight:600; color:#0f172a;">${item.name}</div>
                    <div style="color:#64748b; font-size:12px;">Qty: ${item.quantity}</div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding:12px 0; border-bottom:1px solid #e2e8f0; text-align:right; color:#0f172a;">
              ${item.price.toLocaleString('vi-VN')} VND
            </td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <div style="background:#f8fafc; padding:24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(15, 23, 42, 0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0f172a,#334155); padding:24px;">
                    <div style="color:#ffffff; font-size:20px; font-weight:700;">Order Confirmation</div>
                    <div style="color:#e2e8f0; font-size:13px; margin-top:6px;">${payload.orderDate}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <div style="font-size:16px; color:#0f172a; font-weight:600;">Hi ${payload.customerName},</div>
                    <div style="margin-top:8px; color:#334155;">
                      Thanks for your order <strong>#${payload.orderId}</strong>. We’re getting it ready for you.
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;">
                      <tr>
                        <td style="padding:14px 16px; background:#f1f5f9; border-radius:10px;">
                          <div style="font-size:12px; text-transform:uppercase; color:#64748b; letter-spacing:0.08em;">Estimated Delivery</div>
                          <div style="margin-top:6px; font-size:14px; color:#0f172a; font-weight:600;">
                            ${payload.estimatedDelivery ?? 'N/A'}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <h3 style="margin:24px 0 8px; font-size:16px; color:#0f172a;">Items</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <thead>
                        <tr>
                          <th align="left" style="padding:8px 0; font-size:12px; text-transform:uppercase; color:#94a3b8;">Product</th>
                          <th align="right" style="padding:8px 0; font-size:12px; text-transform:uppercase; color:#94a3b8;">Price</th>
                        </tr>
                      </thead>
                      <tbody>${itemsHtml}</tbody>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:16px;">
                      <tr>
                        <td style="color:#64748b;">Subtotal</td>
                        <td align="right" style="color:#0f172a;">${payload.subtotal.toLocaleString('vi-VN')} VND</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;">Shipping</td>
                        <td align="right" style="color:#0f172a;">${payload.shipping.toLocaleString('vi-VN')} VND</td>
                      </tr>
                      <tr>
                        <td style="color:#64748b;">Tax</td>
                        <td align="right" style="color:#0f172a;">${payload.tax.toLocaleString('vi-VN')} VND</td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px; font-weight:700; color:#0f172a;">Total</td>
                        <td align="right" style="padding-top:12px; font-weight:700; color:#0f172a;">
                          ${payload.total.toLocaleString('vi-VN')} VND
                        </td>
                      </tr>
                    </table>

                    <h3 style="margin:24px 0 8px; font-size:16px; color:#0f172a;">Shipping Address</h3>
                    <div style="color:#334155;">
                      ${payload.shippingAddress.name}<br/>
                      ${payload.shippingAddress.street}<br/>
                      ${payload.shippingAddress.city}, ${payload.shippingAddress.state} ${payload.shippingAddress.zipCode}<br/>
                      ${payload.shippingAddress.country ?? ''}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f1f5f9; padding:16px 24px; color:#64748b; font-size:12px;">
                    Need help? Reply to this email or contact support.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to: payload.customerEmail,
      subject: `Order Confirmation #${payload.orderId}`,
      html,
    });

    return {
      success: true,
      message: 'Order confirmation email sent',
      messageId: info.messageId,
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
