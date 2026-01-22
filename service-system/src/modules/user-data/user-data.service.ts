import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserDataService {
  constructor(private readonly prisma: PrismaService) {}

  async getByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [addresses, orders] = await Promise.all([
      this.prisma.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
      this.prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    ]);

    return { addresses, orders };
  }
}
