import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  private mapStatus(status: string) {
    if (status === 'subscribed') return 'active';
    return status;
  }

  async subscribe(dto: SubscribeNewsletterDto) {
    const email = this.normalizeEmail(dto.email);
    const existing = await this.prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing && ['active', 'subscribed'].includes(existing.status)) {
      return {
        success: true,
        alreadySubscribed: true,
        message: 'Email is already subscribed to newsletter',
        data: {
          ...existing,
          status: this.mapStatus(existing.status),
        },
      };
    }

    const subscription = await this.prisma.newsletterSubscription.upsert({
      where: { email },
      create: {
        email,
        status: 'active',
        source: dto.source || 'footer',
        ipAddress: dto.ipAddress || 'unknown',
        userAgent: dto.userAgent || 'unknown',
        subscribedAt: new Date(),
        unsubscribedAt: null,
      },
      update: {
        status: 'active',
        source: dto.source || existing?.source || 'footer',
        ipAddress: dto.ipAddress || existing?.ipAddress || 'unknown',
        userAgent: dto.userAgent || existing?.userAgent || 'unknown',
        subscribedAt: new Date(),
        unsubscribedAt: null,
      },
    });

    return {
      success: true,
      alreadySubscribed: false,
      message: 'Thank you for subscribing! Check your email for updates.',
      data: {
        ...subscription,
        status: this.mapStatus(subscription.status),
      },
    };
  }

  async unsubscribe(emailInput: string) {
    const email = this.normalizeEmail(emailInput);
    const subscription = await this.prisma.newsletterSubscription.upsert({
      where: { email },
      create: {
        email,
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
      update: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter',
      data: {
        ...subscription,
        status: this.mapStatus(subscription.status),
      },
    };
  }

  async checkStatus(emailInput: string) {
    const email = this.normalizeEmail(emailInput);
    const subscription = await this.prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (!subscription) {
      return { subscribed: false };
    }

    const normalizedStatus = this.mapStatus(subscription.status);
    return {
      subscribed: normalizedStatus === 'active',
      status: normalizedStatus,
      data: {
        id: subscription.id,
        email: subscription.email,
        status: normalizedStatus,
        subscribedAt: subscription.subscribedAt,
        unsubscribedAt: subscription.unsubscribedAt,
        source: subscription.source || 'unknown',
        ipAddress: subscription.ipAddress || 'unknown',
      },
    };
  }
}
