import { Injectable } from '@nestjs/common';
import { Prisma, ReviewStatus } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

type Pagination = {
  skip: number;
  take: number;
};

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUsers(where: Prisma.UserWhereInput | undefined, pagination: Pagination) {
    return this.prisma.user.findMany({
      where,
      take: pagination.take,
      skip: pagination.skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  countUsers(where: Prisma.UserWhereInput | undefined) {
    return this.prisma.user.count({ where });
  }

  deleteUsers(userIds: string[]) {
    return this.prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  listBusinessAccounts(pagination: Pagination) {
    return this.prisma.user.findMany({
      where: { businessStatus: { in: ['pending', 'active', 'rejected'] } },
      orderBy: { businessAppliedAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });
  }

  countBusinessAccounts() {
    return this.prisma.user.count({
      where: { businessStatus: { in: ['pending', 'active', 'rejected'] } },
    });
  }

  listPremiumAccounts(pagination: Pagination) {
    return this.prisma.user.findMany({
      where: { premiumStatus: { in: ['pending', 'active', 'rejected'] } },
      orderBy: { premiumAppliedAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });
  }

  countPremiumAccounts() {
    return this.prisma.user.count({
      where: { premiumStatus: { in: ['pending', 'active', 'rejected'] } },
    });
  }

  listAccountRequests(pagination: Pagination) {
    return Promise.all([
      this.prisma.user.findMany({
        where: { premiumStatus: 'pending' },
        orderBy: { premiumAppliedAt: 'desc' },
        take: pagination.take,
        skip: pagination.skip,
      }),
      this.prisma.user.findMany({
        where: { businessStatus: 'pending' },
        orderBy: { businessAppliedAt: 'desc' },
        take: pagination.take,
        skip: pagination.skip,
      }),
      this.prisma.user.findMany({
        where: { premiumStatus: 'active' },
        orderBy: { premiumApprovedAt: 'desc' },
        take: pagination.take,
        skip: pagination.skip,
      }),
      this.prisma.user.findMany({
        where: { businessStatus: 'active' },
        orderBy: { businessApprovedAt: 'desc' },
        take: pagination.take,
        skip: pagination.skip,
      }),
      this.prisma.user.findMany({
        where: { OR: [{ premiumStatus: { not: 'none' } }, { businessStatus: { not: 'none' } }] },
        take: pagination.take,
        skip: pagination.skip,
      }),
    ]);
  }

  countAccountRequests() {
    return Promise.all([
      this.prisma.user.count({ where: { premiumStatus: 'pending' } }),
      this.prisma.user.count({ where: { businessStatus: 'pending' } }),
      this.prisma.user.count({ where: { premiumStatus: 'active' } }),
      this.prisma.user.count({ where: { businessStatus: 'active' } }),
      this.prisma.user.count({
        where: { OR: [{ premiumStatus: { not: 'none' } }, { businessStatus: { not: 'none' } }] },
      }),
    ]);
  }

  listOrders(pagination: Pagination) {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });
  }

  countOrders() {
    return this.prisma.order.count();
  }

  getOrderById(id: string) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  listProducts(pagination: Pagination) {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });
  }

  countProducts() {
    return this.prisma.product.count();
  }

  createNotifications(
    recipients: string[],
    payload: {
      title: string;
      message: string;
      type?: string;
      priority?: string;
      actionUrl?: string;
      sentBy?: string;
    },
  ) {
    return this.prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type as any,
        priority: payload.priority as any,
        actionUrl: payload.actionUrl,
        sentBy: payload.sentBy,
      })),
    });
  }

  listSentNotifications(pagination: Pagination) {
    return this.prisma.notification.findMany({
      where: { sentBy: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });
  }

  countSentNotifications() {
    return this.prisma.notification.count({ where: { sentBy: { not: null } } });
  }

  getNotificationById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  listSubscriptions(pagination: Pagination) {
    return this.prisma.newsletterSubscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });
  }

  countSubscriptions() {
    return this.prisma.newsletterSubscription.count();
  }

  getSubscriptionById(id: string) {
    return this.prisma.newsletterSubscription.findUnique({ where: { id } });
  }

  listReviewsByStatus(status: ReviewStatus, pagination: Pagination) {
    return this.prisma.review.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });
  }

  countReviewsByStatus(status: ReviewStatus) {
    return this.prisma.review.count({ where: { status } });
  }

  findReviewById(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });
  }

  updateReview(id: string, data: Prisma.ReviewUpdateInput) {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  listApprovedReviewsByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, status: 'approved' },
      select: { rating: true },
    });
  }

  updateProduct(productId: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id: productId }, data });
  }

  findRatingDistribution(productId: string) {
    return this.prisma.ratingDistribution.findFirst({ where: { productId } });
  }

  updateRatingDistribution(id: number, data: Prisma.RatingDistributionUpdateInput) {
    return this.prisma.ratingDistribution.update({ where: { id }, data });
  }

  createRatingDistribution(data: Prisma.RatingDistributionUncheckedCreateInput) {
    return this.prisma.ratingDistribution.create({ data });
  }
}
