import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module'; // nếu bạn có module notification
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Module({
  imports: [PrismaModule, NotificationsModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
