import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

const SelectOptions = {
  id: true,
  name: true,
  price: true,
  stock: true,
  images: true,
  slug: true,
};
@Injectable()
export class OrdersRepository {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({
      data,
      include: {
        products: {
          include: {
            product: {
              select: SelectOptions,
            },
          },
        },
      },
    });
  }

  findByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        products: {
          include: {
            product: {
              select: SelectOptions,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: SelectOptions,
            },
          },
        },
      },
    });
  }

  updateById(id: string, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        products: {
          include: {
            product: {
              select: SelectOptions,
            },
          },
        },
      },
    });
  }

  countByUserId(userId: string) {
    return this.prisma.order.count({ where: { userId } });
  }

  findProductsForOrder(productIds: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
      },
    });
  }

  async createWithStockReservation(
    orderData: Omit<Prisma.OrderUncheckedCreateInput, 'id' | 'createdAt' | 'updatedAt'>,
    items: Array<{ productId: string; quantity: number }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(`OUT_OF_STOCK:${item.productId}`);
        }
      }

      return tx.order.create({
        data: {
          ...orderData,
          products: {
            create: items,
          },
        },
        include: {
          products: {
            include: {
              product: {
                select: SelectOptions,
              },
            },
          },
        },
      });
    });
  }
}
