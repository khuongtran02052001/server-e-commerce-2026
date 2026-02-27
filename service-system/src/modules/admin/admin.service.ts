import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PaginateOptionsDTO } from 'src/common/dto/paginate-options.dto';
import { AdminUpdateOrderDto } from '../orders/dto/admin-update-order.dto';
import { AdminRepository } from './admin.repository';

type PaginationMeta = {
  page: number;
  perPage: number;
  totalCount: number;
  hasNextPage: boolean;
};

type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  ensureAdmin(user: { isAdmin?: boolean }) {
    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  private normalizePagination(pagination?: PaginateOptionsDTO) {
    const page = Math.max(1, pagination?.page || 1);
    const perPage = Math.max(1, pagination?.perPage || 10);
    return { page, perPage, skip: (page - 1) * perPage, take: perPage };
  }

  private buildMeta(page: number, perPage: number, totalCount: number): PaginationMeta {
    return {
      page,
      perPage,
      totalCount,
      hasNextPage: page * perPage < totalCount,
    };
  }

  async getAccountRequests(pagination?: PaginateOptionsDTO) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
    const [
      premiumRequests,
      businessRequests,
      approvedPremiumAccounts,
      approvedBusinessAccounts,
      allUsers,
    ] = await this.adminRepository.listAccountRequests({ skip, take });

    const [
      premiumRequestsCount,
      businessRequestsCount,
      approvedPremiumCount,
      approvedBusinessCount,
      allUsersCount,
    ] = await this.adminRepository.countAccountRequests();

    return {
      success: true,
      premiumRequests,
      businessRequests,
      approvedPremiumAccounts,
      approvedBusinessAccounts,
      allUsers,
      meta: {
        premiumRequests: this.buildMeta(page, perPage, premiumRequestsCount),
        businessRequests: this.buildMeta(page, perPage, businessRequestsCount),
        approvedPremiumAccounts: this.buildMeta(page, perPage, approvedPremiumCount),
        approvedBusinessAccounts: this.buildMeta(page, perPage, approvedBusinessCount),
        allUsers: this.buildMeta(page, perPage, allUsersCount),
      },
    };
  }

  async getAccountRequestsSummary() {
    const [pendingPremiumCount, pendingBusinessCount] = await Promise.all([
      this.adminRepository.countUsers({ premiumStatus: 'pending' }),
      this.adminRepository.countUsers({ businessStatus: 'pending' }),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRequests = await this.adminRepository.countUsers({
      OR: [
        { premiumStatus: 'pending', premiumAppliedAt: { gt: sevenDaysAgo } },
        { businessStatus: 'pending', businessAppliedAt: { gt: sevenDaysAgo } },
      ],
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
    const user = await this.adminRepository.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (type === 'business' && user.premiumStatus !== 'active') {
      throw new BadRequestException('User must have an active premium account');
    }

    if (type === 'premium') {
      if (user.premiumStatus !== 'pending') {
        throw new BadRequestException('Premium account is not in pending status');
      }
      await this.adminRepository.updateUser(userId, {
        premiumStatus: 'active',
        isActive: true,
        membershipType: 'premium',
        premiumApprovedAt: new Date(),
        premiumApprovedBy: adminId,
        rejectionReason: null,
      });
    } else {
      if (user.businessStatus !== 'pending') {
        throw new BadRequestException('Business account is not in pending status');
      }
      await this.adminRepository.updateUser(userId, {
        businessStatus: 'active',
        isBusiness: true,
        membershipType: 'business',
        businessApprovedAt: new Date(),
        businessApprovedBy: adminId,
        rejectionReason: null,
      });
    }

    return { success: true, message: `${type} account approved successfully` };
  }

  async rejectAccount(userId: string, type: 'premium' | 'business', reason: string) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (type === 'premium') {
      if (user.premiumStatus !== 'pending') {
        throw new BadRequestException('Premium account is not in pending status');
      }
      await this.adminRepository.updateUser(userId, {
        premiumStatus: 'rejected',
        premiumRejectedAt: new Date(),
        rejectionReason: reason,
      });
    } else {
      if (user.businessStatus !== 'pending') {
        throw new BadRequestException('Business account is not in pending status');
      }
      await this.adminRepository.updateUser(userId, {
        businessStatus: 'rejected',
        businessRejectedAt: new Date(),
        rejectionReason: reason,
      });
    }

    return { success: true, message: `${type} account rejected` };
  }

  async cancelAccount(accountId: string, type: 'premium' | 'business', reason: string) {
    const user = await this.adminRepository.findUserById(accountId);
    if (!user) throw new NotFoundException('User not found');

    if (type === 'premium') {
      if (user.premiumStatus !== 'active') {
        throw new BadRequestException('Premium account is not active');
      }
      return this.adminRepository.updateUser(accountId, {
        premiumStatus: 'cancelled',
        rejectionReason: reason,
      });
    }

    if (user.businessStatus !== 'active') {
      throw new BadRequestException('Business account is not active');
    }
    return this.adminRepository.updateUser(accountId, {
      businessStatus: 'cancelled',
      rejectionReason: reason,
    });
  }

  async listBusinessAccounts(pagination?: PaginateOptionsDTO) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
    const [accounts, totalCount] = await Promise.all([
      this.adminRepository.listBusinessAccounts({ skip, take }),
      this.adminRepository.countBusinessAccounts(),
    ]);

    return { data: accounts, meta: this.buildMeta(page, perPage, totalCount) };
  }

  async listPremiumAccounts(pagination?: PaginateOptionsDTO) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
    const [accounts, totalCount] = await Promise.all([
      this.adminRepository.listPremiumAccounts({ skip, take }),
      this.adminRepository.countPremiumAccounts(),
    ]);

    return { data: accounts, meta: this.buildMeta(page, perPage, totalCount) };
  }

  async updateBusinessAccount(
    accountId: string,
    approve: boolean,
    adminEmail: string,
    reason?: string,
  ) {
    return this.adminRepository.updateUser(accountId, {
      ...(approve
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
          }),
    });
  }

  async updatePremiumAccount(
    accountId: string,
    approve: boolean,
    adminEmail: string,
    reason?: string,
  ) {
    return this.adminRepository.updateUser(accountId, {
      ...(approve
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
          }),
    });
  }

  async listUsers(pagination?: PaginateOptionsDTO, query?: string) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
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
      this.adminRepository.findUsers(where, { skip, take }),
      this.adminRepository.countUsers(where),
    ]);

    return { data: users, meta: this.buildMeta(page, perPage, totalCount) };
  }

  async deleteUsers(userIds: string[], currentUserId: string) {
    if (userIds.includes(currentUserId)) {
      throw new BadRequestException('Cannot delete your own admin account');
    }

    const result = await this.adminRepository.deleteUsers(userIds);

    return {
      success: true,
      message: `Successfully deleted ${result.count} user(s)`,
    };
  }

  updateUserActivation(userId: string, action: 'activate' | 'deactivate', adminEmail: string) {
    return this.adminRepository.updateUser(userId, {
      ...(action === 'activate'
        ? { isActive: true, premiumStatus: 'active', premiumApprovedBy: adminEmail }
        : { isActive: false }),
    });
  }

  async manageUserByEmail(email: string, setPremium: boolean, adminEmail: string) {
    const existing = await this.adminRepository.findUserByEmail(email);
    if (existing) {
      return this.adminRepository.updateUser(existing.id, {
        isActive: setPremium || existing.isActive,
        premiumStatus: setPremium ? 'active' : existing.premiumStatus,
        membershipType: setPremium ? 'premium' : existing.membershipType,
        premiumApprovedBy: adminEmail,
        premiumApprovedAt: setPremium ? new Date() : existing.premiumApprovedAt,
      });
    }

    return this.adminRepository.createUser({
      email,
      isActive: setPremium || true,
      isBusiness: false,
      membershipType: setPremium ? 'premium' : 'standard',
      premiumStatus: setPremium ? 'active' : 'none',
      premiumApprovedBy: adminEmail,
      premiumApprovedAt: setPremium ? new Date() : null,
      rewardPoints: 0,
      loyaltyPoints: setPremium ? 100 : 0,
    });
  }

  async getOrders(pagination?: PaginateOptionsDTO) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
    const [orders, totalCount] = await Promise.all([
      this.adminRepository.listOrders({ skip, take }),
      this.adminRepository.countOrders(),
    ]);

    return { data: orders, meta: this.buildMeta(page, perPage, totalCount) };
  }

  getOrderById(id: string) {
    return this.adminRepository.getOrderById(id);
  }

  async updateOrder(id: string, dto: AdminUpdateOrderDto) {
    const order = await this.adminRepository.getOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!dto.status && !dto.paymentStatus) {
      throw new BadRequestException('status or paymentStatus is required');
    }

    return this.adminRepository.updateOrderById(id, {
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.paymentStatus ? { paymentStatus: dto.paymentStatus } : {}),
    });
  }

  async getProducts(pagination?: PaginateOptionsDTO) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
    const [products, totalCount] = await Promise.all([
      this.adminRepository.listProducts({ skip, take }),
      this.adminRepository.countProducts(),
    ]);

    return { data: products, meta: this.buildMeta(page, perPage, totalCount) };
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
    const created = await this.adminRepository.createNotifications(recipients, payload);

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

  async getSentNotifications(pagination?: PaginateOptionsDTO) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
    const [notifications, totalCount] = await Promise.all([
      this.adminRepository.listSentNotifications({ skip, take }),
      this.adminRepository.countSentNotifications(),
    ]);

    return { data: notifications, meta: this.buildMeta(page, perPage, totalCount) };
  }

  getNotificationById(id: string) {
    return this.adminRepository.getNotificationById(id);
  }

  getStats() {
    return Promise.all([
      this.adminRepository.countUsers(undefined),
      this.adminRepository.countOrders(),
      this.adminRepository.countProducts(),
    ]).then(([users, orders, products]) => ({
      users,
      orders,
      products,
    }));
  }

  private parsePeriod(period?: string): AnalyticsPeriod {
    if (period === '7d' || period === '30d' || period === '90d' || period === '1y') {
      return period;
    }
    return '30d';
  }

  private getPeriodDays(period: AnalyticsPeriod) {
    if (period === '7d') return 7;
    if (period === '90d') return 90;
    if (period === '1y') return 365;
    return 30;
  }

  private percentageChange(current: number, previous: number) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  async getAnalytics(period?: string) {
    const normalizedPeriod = this.parsePeriod(period);
    const days = this.getPeriodDays(normalizedPeriod);

    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - days);

    const previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - days);

    const [
      revenueCurrentAgg,
      revenuePreviousAgg,
      currentOrderStatusGroups,
      previousOrderStatusGroups,
      totalCustomers,
      newCustomersCurrent,
      newCustomersPrevious,
      activeCustomersCurrent,
      totalProducts,
      productsCurrent,
      productsPrevious,
      lowStock,
      outOfStock,
      topProductGroups,
      recentOrders,
    ] = await Promise.all([
      this.adminRepository.aggregateOrders({
        createdAt: { gte: currentStart, lt: now },
        status: { in: ['delivered', 'completed'] },
      }),
      this.adminRepository.aggregateOrders({
        createdAt: { gte: previousStart, lt: currentStart },
        status: { in: ['delivered', 'completed'] },
      }),
      this.adminRepository.groupOrdersByStatusBetween(currentStart, now),
      this.adminRepository.groupOrdersByStatusBetween(previousStart, currentStart),
      this.adminRepository.countUsers(undefined),
      this.adminRepository.countUsersCreatedBetween(currentStart, now),
      this.adminRepository.countUsersCreatedBetween(previousStart, currentStart),
      this.adminRepository.countUsersWithOrdersBetween(currentStart, now),
      this.adminRepository.countProducts(),
      this.adminRepository.countProductsWhere({ createdAt: { gte: currentStart, lt: now } }),
      this.adminRepository.countProductsWhere({
        createdAt: { gte: previousStart, lt: currentStart },
      }),
      this.adminRepository.countProductsWhere({
        stock: { gt: 0, lte: 10 },
      }),
      this.adminRepository.countProductsWhere({ stock: { lte: 0 } }),
      this.adminRepository.groupTopOrderItemsByPeriod(currentStart, now, 5),
      this.adminRepository.findRecentOrdersByPeriod(currentStart, now, 10),
    ]);

    const revenueCurrent = revenueCurrentAgg._sum.totalPrice ?? 0;
    const revenuePrevious = revenuePreviousAgg._sum.totalPrice ?? 0;
    const revenueTrend = Array.from({ length: 7 }, (_, index) => {
      const ratio = (index + 1) / 7;
      return Math.round(revenueCurrent * ratio);
    });

    const currentStatusCount = new Map(
      currentOrderStatusGroups.map((item) => [item.status, item._count.status]),
    );
    const previousStatusCount = new Map(
      previousOrderStatusGroups.map((item) => [item.status, item._count.status]),
    );

    const ordersCurrentTotal = [...currentStatusCount.values()].reduce(
      (sum, count) => sum + count,
      0,
    );
    const ordersPreviousTotal = [...previousStatusCount.values()].reduce(
      (sum, count) => sum + count,
      0,
    );

    const pendingCurrent =
      (currentStatusCount.get('pending') ?? 0) +
      (currentStatusCount.get('address_confirmed') ?? 0) +
      (currentStatusCount.get('order_confirmed') ?? 0) +
      (currentStatusCount.get('packed') ?? 0);
    const completedCurrent =
      (currentStatusCount.get('delivered') ?? 0) + (currentStatusCount.get('completed') ?? 0);
    const cancelledCurrent =
      (currentStatusCount.get('cancelled') ?? 0) + (currentStatusCount.get('failed_delivery') ?? 0);

    const topProductIds = topProductGroups.map((item) => item.productId);
    const topProductInfos = topProductIds.length
      ? await this.adminRepository.findProductsBasicByIds(topProductIds)
      : [];
    const productInfoMap = new Map(topProductInfos.map((item) => [item.id, item]));

    const topProducts = topProductGroups.map((item) => {
      const info = productInfoMap.get(item.productId);
      const sales = item._sum.quantity ?? 0;
      const unitPrice = info?.price ?? 0;
      return {
        name: info?.name ?? 'Unknown',
        sales,
        revenue: unitPrice * sales,
      };
    });

    const recentActivity = recentOrders.map((order) => ({
      action: `Order ${order.status}`,
      time: order.createdAt.toISOString(),
      value: `${order.totalPrice.toLocaleString('vi-VN')} VND`,
    }));

    return {
      revenue: {
        total: revenueCurrent,
        change: this.percentageChange(revenueCurrent, revenuePrevious),
        trend: revenueTrend,
      },
      orders: {
        total: ordersCurrentTotal,
        change: this.percentageChange(ordersCurrentTotal, ordersPreviousTotal),
        pending: pendingCurrent,
        completed: completedCurrent,
        cancelled: cancelledCurrent,
      },
      customers: {
        total: totalCustomers,
        change: this.percentageChange(newCustomersCurrent, newCustomersPrevious),
        active: activeCustomersCurrent,
        new: newCustomersCurrent,
      },
      products: {
        total: totalProducts,
        change: this.percentageChange(productsCurrent, productsPrevious),
        lowStock,
        outOfStock,
      },
      topProducts,
      recentActivity,
    };
  }

  async getSubscriptions(pagination?: PaginateOptionsDTO) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
    const [subscriptions, totalCount] = await Promise.all([
      this.adminRepository.listSubscriptions({ skip, take }),
      this.adminRepository.countSubscriptions(),
    ]);

    return { data: subscriptions, meta: this.buildMeta(page, perPage, totalCount) };
  }

  getSubscriptionById(id: string) {
    return this.adminRepository.getSubscriptionById(id);
  }

  async getReviewsByStatus(
    status: 'pending' | 'approved' | 'rejected',
    pagination?: PaginateOptionsDTO,
  ) {
    const { page, perPage, skip, take } = this.normalizePagination(pagination);
    const [reviews, totalCount] = await Promise.all([
      this.adminRepository.listReviewsByStatus(status, { skip, take }),
      this.adminRepository.countReviewsByStatus(status),
    ]);

    return { data: reviews, meta: this.buildMeta(page, perPage, totalCount) };
  }

  async updateReviewStatus(
    reviewId: string,
    action: 'approve' | 'reject',
    adminId: string,
    adminNotes?: string,
  ) {
    const review = await this.adminRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await this.adminRepository.updateReview(reviewId, {
      status: newStatus,
      approvedAt: action === 'approve' ? new Date() : null,
      approvedBy: action === 'approve' ? adminId : null,
      adminNotes: adminNotes ?? undefined,
    } as Prisma.ReviewUpdateInput);

    if (action === 'approve') {
      await this.recalculateProductRating(review.productId);
    }

    return { success: true, message: `Review ${action}d successfully`, status: newStatus };
  }

  private async recalculateProductRating(productId: string) {
    const approvedReviews = await this.adminRepository.listApprovedReviewsByProduct(productId);

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

    await this.adminRepository.updateProduct(productId, {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    });

    const existing = await this.adminRepository.findRatingDistribution(productId);
    if (existing) {
      await this.adminRepository.updateRatingDistribution(existing.id, ratingDistribution);
    } else {
      await this.adminRepository.createRatingDistribution({ productId, ...ratingDistribution });
    }
  }
}
