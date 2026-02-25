import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

const SelectOptions = {
  id: true,
  name: true,
  price: true,
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
}
