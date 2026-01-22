import { Injectable } from '@nestjs/common';
import { Prisma, Review } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        profileImage: true;
      };
    };
  };
}>;

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findApprovedByProductId(productId: string): Promise<ReviewWithUser[]> {
    return this.prisma.review.findMany({
      where: { productId, status: 'approved', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });
  }

  findByUserProduct(productId: string, userId: string): Promise<Review | null> {
    return this.prisma.review.findFirst({
      where: { productId, userId, deletedAt: null },
    });
  }

  findById(id: string): Promise<Review | null> {
    return this.prisma.review.findFirst({
      where: { id, deletedAt: null },
    });
  }

  create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({ data });
  }

  productExists(productId: string): Promise<{ id: string } | null> {
    return this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });
  }

  hasDeliveredOrder(userId: string, productId: string): Promise<{ id: string } | null> {
    return this.prisma.orderProduct.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'delivered',
        },
      },
      select: { id: true },
    });
  }

  findHelpful(
    reviewId: string,
    userId: string,
  ): Promise<{ reviewId: string; userId: string } | null> {
    return this.prisma.reviewHelpful.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });
  }

  async addHelpful(reviewId: string, userId: string): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      await tx.reviewHelpful.create({
        data: { reviewId, userId },
      });
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: { helpful: { increment: 1 } },
        select: { helpful: true },
      });
      return updated.helpful;
    });
  }

  async removeHelpful(reviewId: string, userId: string): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id: reviewId },
        select: { helpful: true },
      });
      if (!review) {
        return 0;
      }
      await tx.reviewHelpful.delete({
        where: { reviewId_userId: { reviewId, userId } },
      });
      const nextHelpful = Math.max(0, review.helpful - 1);
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: { helpful: nextHelpful },
        select: { helpful: true },
      });
      return updated.helpful;
    });
  }
}
