import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { ContactModule } from './modules/contact/contact.module';
import { DebugModule } from './modules/debug/debug.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UserDataModule } from './modules/user-data/user-data.module';
import { UserModule } from './modules/user/user.module';
import { UsersModule } from './modules/users/users.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ProductsModule,
    ReviewsModule,
    UserModule,
    UserDataModule,
    CategoriesModule,
    NotificationsModule,
    AddressesModule,
    OrdersModule,
    BrandsModule,
    BlogsModule,
    AdminModule,
    AnalyticsModule,
    ContactModule,
    NewsletterModule,
    CheckoutModule,
    WebhookModule,
    DebugModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
