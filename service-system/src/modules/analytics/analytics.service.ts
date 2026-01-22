import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  trackEvent(eventName: string, eventParams?: Record<string, unknown>, userId?: string) {
    return this.prisma.analyticsEvent.create({
      data: {
        eventName,
        eventParams: (eventParams ?? undefined) as Prisma.InputJsonValue | undefined,
        userId,
      },
    });
  }

  async getBestSellers(limit: number) {
    const grouped = await this.prisma.orderProduct.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const ids = grouped.map((g) => g.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        categories: true,
        brand: true,
        images: true,
      },
    });

    const ranked = grouped.map((g) => ({
      productId: g.productId,
      totalSold: g._sum.quantity || 0,
      product: products.find((p) => p.id === g.productId) || null,
    }));

    return ranked;
  }
}
