import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  subscribe(email: string) {
    return this.prisma.newsletterSubscription.upsert({
      where: { email },
      create: {
        email,
        status: 'subscribed',
        subscribedAt: new Date(),
      },
      update: {
        status: 'subscribed',
        subscribedAt: new Date(),
        unsubscribedAt: null,
      },
    });
  }

  unsubscribe(email: string) {
    return this.prisma.newsletterSubscription.upsert({
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
  }
}
