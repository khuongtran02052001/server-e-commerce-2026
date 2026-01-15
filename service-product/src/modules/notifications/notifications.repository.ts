import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { dataPaginate, PaginatedResult } from 'src/common/utils/data-paginator.util';
import { Notification } from './../../../generated/prisma';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private prismaService: PrismaService) {}
  create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prismaService.notification.create({
      data: data,
    });
  }

  async findPagination({
    where,
    orderBy,
    page,
    perPage,
  }: {
    where?: Prisma.NotificationWhereInput;
    orderBy?: Prisma.NotificationOrderByWithRelationInput;
    page?: number | string | undefined;
    perPage?: number | string | undefined;
  }): Promise<PaginatedResult<Notification>> {
    return dataPaginate(this.prismaService.notification, { where, orderBy }, { page, perPage });
  }

  findOne(id: string): Promise<Notification | null> {
    return this.prismaService.notification.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Prisma.NotificationUpdateInput): Promise<Notification> {
    return this.prismaService.notification.update({
      where: { id },
      data: data,
    });
  }
  softDelete(id: string): Promise<Notification> {
    return this.prismaService.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  remove(id: string): Promise<Notification> {
    return this.prismaService.notification.delete({
      where: { id },
    });
  }
}
