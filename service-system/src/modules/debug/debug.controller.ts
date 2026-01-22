import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Debug')
@Controller('debug')
export class DebugController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('calculate-points')
  calculatePoints(@Body() body: { orderTotal?: number }) {
    const orderTotal = body.orderTotal || 0;
    const points = Math.floor(orderTotal / 10);
    return { success: true, points };
  }

  @Post('create-user')
  createUser(@Body() body: { email: string; firstName?: string; lastName?: string }) {
    return this.prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
      },
    });
  }

  @Patch('update-user')
  updateUser(@Body() body: { id: string; data: Record<string, unknown> }) {
    return this.prisma.user.update({
      where: { id: body.id },
      data: body.data,
    });
  }

  @Get('user-status')
  async userStatus(@Body() body: { userId?: string }) {
    const userId = body.userId;
    if (!userId) {
      return { success: false, message: 'userId is required' };
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        isBusiness: true,
        premiumStatus: true,
        businessStatus: true,
      },
    });
    return { success: true, user };
  }
}
