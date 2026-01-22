import { Module } from '@nestjs/common';
import { AddressesModule } from '../addresses/addresses.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrdersModule,
    NotificationsModule,
    AddressesModule,
    ReviewsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
