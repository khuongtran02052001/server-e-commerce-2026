import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({ data });
  }

  findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllUnReadByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async markAsRead(id: string) {
    const exists = await this.prisma.notification.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }

  delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  deleteAllForUser(userId: string) {
    return this.prisma.notification.deleteMany({ where: { userId } });
  }
}
