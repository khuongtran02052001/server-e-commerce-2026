import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  ensureAdmin(user: { isAdmin?: boolean }) {
    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  async getAccountRequests() {
    const [
      premiumRequests,
      businessRequests,
      approvedPremiumAccounts,
      approvedBusinessAccounts,
      allUsers,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where: { premiumStatus: 'pending' },
        orderBy: { premiumAppliedAt: 'desc' },
      }),
      this.prisma.user.findMany({
        where: { businessStatus: 'pending' },
        orderBy: { businessAppliedAt: 'desc' },
      }),
      this.prisma.user.findMany({
        where: { premiumStatus: 'active' },
        orderBy: { premiumApprovedAt: 'desc' },
      }),
      this.prisma.user.findMany({
        where: { businessStatus: 'active' },
        orderBy: { businessApprovedAt: 'desc' },
      }),
      this.prisma.user.findMany({
        where: { OR: [{ premiumStatus: { not: 'none' } }, { businessStatus: { not: 'none' } }] },
      }),
    ]);

    return {
      success: true,
      premiumRequests,
      businessRequests,
      approvedPremiumAccounts,
      approvedBusinessAccounts,
      allUsers,
    };
  }

  async getAccountRequestsSummary() {
    const [pendingPremiumCount, pendingBusinessCount] = await Promise.all([
      this.prisma.user.count({ where: { premiumStatus: 'pending' } }),
      this.prisma.user.count({ where: { businessStatus: 'pending' } }),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRequests = await this.prisma.user.count({
      where: {
        OR: [
          { premiumStatus: 'pending', premiumAppliedAt: { gt: sevenDaysAgo } },
          { businessStatus: 'pending', businessAppliedAt: { gt: sevenDaysAgo } },
        ],
      },
    });

    return {
      success: true,
      pendingPremiumCount,
      pendingBusinessCount,
      totalPendingRequests: pendingPremiumCount + pendingBusinessCount,
      recentRequests,
    };
  }

  async approveAccount(userId: string, type: 'premium' | 'business', adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (type === 'business' && user.premiumStatus !== 'active') {
      throw new BadRequestException('User must have an active premium account');
    }

    if (type === 'premium') {
      if (user.premiumStatus !== 'pending') {
        throw new BadRequestException('Premium account is not in pending status');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          premiumStatus: 'active',
          isActive: true,
          membershipType: 'premium',
          premiumApprovedAt: new Date(),
          premiumApprovedBy: adminId,
          rejectionReason: null,
        },
      });
    } else {
      if (user.businessStatus !== 'pending') {
        throw new BadRequestException('Business account is not in pending status');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          businessStatus: 'active',
          isBusiness: true,
          membershipType: 'business',
          businessApprovedAt: new Date(),
          businessApprovedBy: adminId,
          rejectionReason: null,
        },
      });
    }

    return { success: true, message: `${type} account approved successfully` };
  }

  async rejectAccount(userId: string, type: 'premium' | 'business', reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (type === 'premium') {
      if (user.premiumStatus !== 'pending') {
        throw new BadRequestException('Premium account is not in pending status');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          premiumStatus: 'rejected',
          premiumRejectedAt: new Date(),
          rejectionReason: reason,
        },
      });
    } else {
      if (user.businessStatus !== 'pending') {
        throw new BadRequestException('Business account is not in pending status');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          businessStatus: 'rejected',
          businessRejectedAt: new Date(),
          rejectionReason: reason,
        },
      });
    }

    return { success: true, message: `${type} account rejected` };
  }

  async cancelAccount(accountId: string, type: 'premium' | 'business', reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: accountId } });
    if (!user) throw new NotFoundException('User not found');

    if (type === 'premium') {
      if (user.premiumStatus !== 'active') {
        throw new BadRequestException('Premium account is not active');
      }
      return this.prisma.user.update({
        where: { id: accountId },
        data: {
          premiumStatus: 'cancelled',
          rejectionReason: reason,
        },
      });
    }

    if (user.businessStatus !== 'active') {
      throw new BadRequestException('Business account is not active');
    }
    return this.prisma.user.update({
      where: { id: accountId },
      data: {
        businessStatus: 'cancelled',
        rejectionReason: reason,
      },
    });
  }

  listBusinessAccounts() {
    return this.prisma.user.findMany({
      where: { businessStatus: { in: ['pending', 'active', 'rejected'] } },
      orderBy: { businessAppliedAt: 'desc' },
    });
  }

  listPremiumAccounts() {
    return this.prisma.user.findMany({
      where: { premiumStatus: { in: ['pending', 'active', 'rejected'] } },
      orderBy: { premiumAppliedAt: 'desc' },
    });
  }

  async updateBusinessAccount(
    accountId: string,
    approve: boolean,
    adminEmail: string,
    reason?: string,
  ) {
    return this.prisma.user.update({
      where: { id: accountId },
      data: approve
        ? {
            isBusiness: true,
            businessStatus: 'active',
            membershipType: 'business',
            businessApprovedBy: adminEmail,
            businessApprovedAt: new Date(),
            rejectionReason: null,
          }
        : {
            isBusiness: false,
            businessStatus: 'rejected',
            businessApprovedBy: adminEmail,
            businessApprovedAt: new Date(),
            rejectionReason: reason || 'No reason provided',
          },
    });
  }

  async updatePremiumAccount(
    accountId: string,
    approve: boolean,
    adminEmail: string,
    reason?: string,
  ) {
    return this.prisma.user.update({
      where: { id: accountId },
      data: approve
        ? {
            isActive: true,
            premiumStatus: 'active',
            membershipType: 'premium',
            premiumApprovedBy: adminEmail,
            premiumApprovedAt: new Date(),
            loyaltyPoints: 100,
            rejectionReason: null,
          }
        : {
            isActive: false,
            premiumStatus: 'rejected',
            premiumApprovedBy: adminEmail,
            premiumApprovedAt: new Date(),
            rejectionReason: reason || 'No reason provided',
          },
    });
  }

  async listUsers(limit: number, offset: number, query?: string) {
    const where = query
      ? {
          OR: [
            { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { firstName: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      totalCount,
      hasNextPage: offset + limit < totalCount,
    };
  }

  async deleteUsers(userIds: string[], currentUserId: string) {
    if (userIds.includes(currentUserId)) {
      throw new BadRequestException('Cannot delete your own admin account');
    }

    const result = await this.prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    return {
      success: true,
      message: `Successfully deleted ${result.count} user(s)`,
    };
  }

  updateUserActivation(userId: string, action: 'activate' | 'deactivate', adminEmail: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data:
        action === 'activate'
          ? { isActive: true, premiumStatus: 'active', premiumApprovedBy: adminEmail }
          : { isActive: false },
    });
  }

  async manageUserByEmail(email: string, setPremium: boolean, adminEmail: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return this.prisma.user.update({
        where: { email },
        data: {
          isActive: setPremium || existing.isActive,
          premiumStatus: setPremium ? 'active' : existing.premiumStatus,
          membershipType: setPremium ? 'premium' : existing.membershipType,
          premiumApprovedBy: adminEmail,
          premiumApprovedAt: setPremium ? new Date() : existing.premiumApprovedAt,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email,
        isActive: setPremium || true,
        isBusiness: false,
        membershipType: setPremium ? 'premium' : 'standard',
        premiumStatus: setPremium ? 'active' : 'none',
        premiumApprovedBy: adminEmail,
        premiumApprovedAt: setPremium ? new Date() : null,
        rewardPoints: 0,
        loyaltyPoints: setPremium ? 100 : 0,
      },
    });
  }

  getOrders() {
    return this.prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  }

  getOrderById(id: string) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  getProducts() {
    return this.prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async sendNotifications(
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
    const created = await this.prisma.notification.createMany({
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

    return {
      success: true,
      message: 'Notifications sent successfully',
      stats: {
        total: recipients.length,
        successful: created.count,
        failed: recipients.length - created.count,
      },
    };
  }

  getSentNotifications() {
    return this.prisma.notification.findMany({
      where: { sentBy: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getNotificationById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  getStats() {
    return Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.product.count(),
    ]).then(([users, orders, products]) => ({
      users,
      orders,
      products,
    }));
  }

  getAnalytics() {
    return this.getStats();
  }

  getSubscriptions() {
    return this.prisma.newsletterSubscription.findMany({ orderBy: { createdAt: 'desc' } });
  }

  getSubscriptionById(id: string) {
    return this.prisma.newsletterSubscription.findUnique({ where: { id } });
  }

  getReviewsByStatus(status: 'pending' | 'approved' | 'rejected') {
    return this.prisma.review.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
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

  async updateReviewStatus(
    reviewId: string,
    action: 'approve' | 'reject',
    adminId: string,
    adminNotes?: string,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, productId: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status: newStatus,
        approvedAt: action === 'approve' ? new Date() : null,
        approvedBy: action === 'approve' ? adminId : null,
        adminNotes: adminNotes ?? undefined,
      } as Prisma.ReviewUpdateInput,
    });

    if (action === 'approve') {
      await this.recalculateProductRating(review.productId);
    }

    return { success: true, message: `Review ${action}d successfully`, status: newStatus };
  }

  private async recalculateProductRating(productId: string) {
    const approvedReviews = await this.prisma.review.findMany({
      where: { productId, status: 'approved' },
      select: { rating: true },
    });

    const totalReviews = approvedReviews.length;
    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews ? totalRating / totalReviews : 0;

    const ratingDistribution = {
      fiveStars: approvedReviews.filter((r) => r.rating === 5).length,
      fourStars: approvedReviews.filter((r) => r.rating === 4).length,
      threeStars: approvedReviews.filter((r) => r.rating === 3).length,
      twoStars: approvedReviews.filter((r) => r.rating === 2).length,
      oneStar: approvedReviews.filter((r) => r.rating === 1).length,
    };

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
      },
    });

    const existing = await this.prisma.ratingDistribution.findFirst({
      where: { productId },
    });
    if (existing) {
      await this.prisma.ratingDistribution.update({
        where: { id: existing.id },
        data: ratingDistribution,
      });
    } else {
      await this.prisma.ratingDistribution.create({
        data: { productId, ...ratingDistribution },
      });
    }
  }
}
