import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ApplyBusinessDto } from './dto/apply-business.dto';
import { CancelApplicationDto } from './dto/cancel-application.dto';
import { RequestAccessDto } from './dto/request-access.dto';
import { UpdatePointsDto } from './dto/points.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        profileImage: dto.profileImage,
      },
    });
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        preferences: dto.preferences ?? undefined,
      },
    });
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isBusiness: true,
        membershipType: true,
        premiumStatus: true,
        businessStatus: true,
        premiumAppliedAt: true,
        premiumApprovedAt: true,
        premiumApprovedBy: true,
        businessAppliedAt: true,
        businessApprovedAt: true,
        businessApprovedBy: true,
        rejectionReason: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      userExists: true,
      userProfile: user,
    };
  }

  async applyPremium(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.premiumStatus === 'rejected') {
      throw new BadRequestException('Premium application was rejected');
    }
    if (user.premiumStatus === 'pending') {
      throw new BadRequestException('Premium application is already pending');
    }
    if (user.isActive) {
      throw new BadRequestException('User already has premium account');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        premiumStatus: 'pending',
        premiumAppliedAt: new Date(),
      },
    });

    return {
      success: true,
      message:
        "Premium application submitted successfully! Your application is under review.",
      userProfile: updated,
    };
  }

  async applyBusiness(userId: string, dto: ApplyBusinessDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.isActive) {
      throw new BadRequestException('Please activate your premium account first');
    }
    if (user.businessStatus === 'rejected') {
      throw new BadRequestException('Business account application was rejected');
    }
    if (user.businessStatus === 'pending') {
      throw new BadRequestException('Business account application is already pending');
    }
    if (user.isBusiness) {
      throw new BadRequestException('Business account already approved');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        businessStatus: 'pending',
        businessAppliedAt: new Date(),
      },
    });

    return {
      success: true,
      message:
        'Business account application submitted successfully! Your application is under review.',
      user: updated,
    };
  }

  async cancelApplication(userId: string, dto: CancelApplicationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.applicationType === 'premium') {
      if (user.premiumStatus !== 'pending' && user.premiumStatus !== 'rejected') {
        throw new BadRequestException('Cannot cancel premium application in current status');
      }

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { premiumStatus: 'cancelled' },
      });

      return {
        success: true,
        message: 'Premium application cancelled. You can apply again.',
        user: updated,
      };
    }

    if (user.businessStatus !== 'pending' && user.businessStatus !== 'rejected') {
      throw new BadRequestException('Cannot cancel business application in current status');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { businessStatus: 'cancelled' },
    });

    return {
      success: true,
      message: 'Business application cancelled. You can apply again.',
      user: updated,
    };
  }

  async requestAccess(dto: RequestAccessDto) {
    const existing = await this.prisma.userAccessRequest.findFirst({
      where: { userId: dto.userId },
    });

    if (existing) {
      return { success: false, message: 'Access request already exists' };
    }

    const created = await this.prisma.userAccessRequest.create({
      data: {
        userId: dto.userId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: 'pending',
        requestedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Access request submitted successfully',
      requestId: created.id,
    };
  }

  async getCombinedData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        notifications: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
      ordersCount: user.orders.length || 0,
      isEmployee: user.isEmployee || false,
      unreadNotifications: user.notifications.filter((n) => !n.read).length || 0,
      walletBalance: user.walletBalance || 0,
    };
  }

  async getOrdersCount(userId: string) {
    const totalOrders = await this.prisma.order.count({ where: { userId } });
    return { success: true, totalOrders };
  }

  async getPoints(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        rewardPoints: true,
        loyaltyPoints: true,
        totalSpent: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const completedOrders = await this.prisma.order.count({
      where: { userId, status: 'completed' },
    });
    const pendingOrders = await this.prisma.order.count({
      where: { userId, status: { in: ['pending', 'processing'] } },
    });
    const totalOrders = await this.prisma.order.count({
      where: { userId },
    });

    return {
      success: true,
      stats: {
        rewardPoints: user.rewardPoints || 0,
        loyaltyPoints: user.loyaltyPoints || 0,
        totalSpent: user.totalSpent || 0,
        lastLogin: user.lastLogin,
        completedOrders,
        pendingOrders,
        totalOrders,
      },
    };
  }

  async updatePoints(userId: string, dto: UpdatePointsDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const pointsEarned = Math.floor(dto.orderTotal / 10);
    const nextReward = (user.rewardPoints || 0) + pointsEarned;
    const nextTotalSpent = (user.totalSpent || 0) + dto.orderTotal;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        rewardPoints: nextReward,
        totalSpent: nextTotalSpent,
        lastLogin: new Date(),
      },
    });

    return {
      success: true,
      user: updated,
      pointsEarned: {
        rewardPoints: pointsEarned,
        loyaltyPoints: 0,
      },
      messages: ['Points updated successfully'],
    };
  }

  async dashboardStats(userId: string) {
    const [ordersCount, wishlistCount, notifications, user] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { wishlist: { select: { id: true } }, rewardPoints: true, walletBalance: true },
      }),
      this.prisma.notification.findMany({ where: { userId } }),
      this.prisma.user.findUnique({ where: { id: userId } }),
    ]);

    const unreadNotifications = notifications.filter((n) => !n.read).length;
    const stats = {
      ordersCount,
      wishlistCount: wishlistCount?.wishlist.length || 0,
      notificationsCount: notifications.length,
      unreadNotifications,
      rewardPoints: user?.rewardPoints || 0,
      walletBalance: user?.walletBalance || 0,
    };

    return {
      success: true,
      stats,
      recentActivity: [],
    };
  }
}
