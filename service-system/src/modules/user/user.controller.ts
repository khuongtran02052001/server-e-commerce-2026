import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/utils/current-user.util';
import { AddressesService } from '../addresses/addresses.service';
import { CreateAddressDto } from '../addresses/dto/create-address.dto';
import { UpdateAddressDto } from '../addresses/dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { OrdersService } from '../orders/orders.service';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';
import { ReviewsService } from '../reviews/reviews.service';
import { ApplyBusinessDto } from './dto/apply-business.dto';
import { CancelApplicationDto } from './dto/cancel-application.dto';
import { UpdatePointsDto } from './dto/points.dto';
import { RequestAccessDto } from './dto/request-access.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
    private readonly addressesService: AddressesService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  updateSettings(@Body() dto: UpdateSettingsDto, @CurrentUser() user) {
    return this.userService.updateSettings(user.id, dto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  getStatus(@CurrentUser() user) {
    return this.userService.getStatus(user.id);
  }

  @Post('status')
  @UseGuards(JwtAuthGuard)
  applyPremium(@CurrentUser() user) {
    return this.userService.applyPremium(user.id);
  }

  @Post('business-apply')
  @UseGuards(JwtAuthGuard)
  applyBusiness(@Body() dto: ApplyBusinessDto, @CurrentUser() user) {
    return this.userService.applyBusiness(user.id, dto);
  }

  @Post('cancel-application')
  @UseGuards(JwtAuthGuard)
  cancelApplication(@Body() dto: CancelApplicationDto, @CurrentUser() user) {
    return this.userService.cancelApplication(user.id, dto);
  }

  @Post('request-access')
  @UseGuards(JwtAuthGuard)
  requestAccess(@Body() dto: RequestAccessDto, @CurrentUser() user) {
    return this.userService.requestAccess({ ...dto, userId: dto.userId || user.id });
  }

  @Get('combined-data')
  @UseGuards(JwtAuthGuard)
  getCombinedData(@CurrentUser() user) {
    return this.userService.getCombinedData(user.id);
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard)
  getDashboardStats(@CurrentUser() user) {
    return this.userService.dashboardStats(user.id);
  }

  @Get('points')
  @UseGuards(JwtAuthGuard)
  getPoints(@CurrentUser() user) {
    return this.userService.getPoints(user.id);
  }

  @Post('points')
  @UseGuards(JwtAuthGuard)
  updatePoints(@Body() dto: UpdatePointsDto, @CurrentUser() user) {
    return this.userService.updatePoints(user.id, dto);
  }

  @Get('reward-points')
  @UseGuards(JwtAuthGuard)
  rewardPoints() {
    return { message: 'Reward points endpoint' };
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  getOrders(@CurrentUser() user) {
    return this.ordersService.getMyOrders(user.id);
  }

  @Get('orders/count')
  @UseGuards(JwtAuthGuard)
  getOrdersCount(@CurrentUser() user) {
    return this.userService.getOrdersCount(user.id);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@CurrentUser() user) {
    const notifications = await this.notificationsService.findAllByUser(user.id);
    return {
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    };
  }

  @Patch('notifications')
  @UseGuards(JwtAuthGuard)
  markNotification(@Body() body: { notificationId?: string }) {
    if (!body.notificationId) {
      return { success: false, message: 'Notification ID is required' };
    }
    return this.notificationsService.markAsRead(body.notificationId);
  }

  @Delete('notifications')
  @UseGuards(JwtAuthGuard)
  deleteNotification(@Query('id') id: string) {
    if (!id) {
      return { success: false, message: 'Notification ID is required' };
    }
    return this.notificationsService.delete(id);
  }

  @Delete('notifications/:id')
  @UseGuards(JwtAuthGuard)
  deleteNotificationById(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  markNotificationRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  getAddresses(@CurrentUser() user) {
    return this.addressesService.getAddressesByUser(user.id);
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  createAddress(@Body() dto: CreateAddressDto, @CurrentUser() user) {
    return this.addressesService.createAddress({ ...dto, userId: user.id });
  }

  @Put('addresses')
  @UseGuards(JwtAuthGuard)
  updateAddress(@Body() body: { id: string } & UpdateAddressDto) {
    return this.addressesService.updateAddress(body.id, body);
  }

  @Delete('addresses')
  @UseGuards(JwtAuthGuard)
  deleteAddress(@Query('id') id: string) {
    return this.addressesService.removeAddress(id);
  }

  @Get('reviews')
  getReviews(@Query('productId') productId: string) {
    return this.reviewsService.getReviews(productId);
  }

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  createReview(@Body() dto: CreateReviewDto, @CurrentUser() user) {
    return this.reviewsService.createReview(dto, user);
  }

  @Patch('reviews')
  @UseGuards(JwtAuthGuard)
  toggleReviewHelpful(@Body() body: { reviewId?: string }, @CurrentUser() user) {
    if (!body.reviewId) {
      return { success: false, message: 'Review ID is required' };
    }
    return this.reviewsService.toggleHelpful(body.reviewId, user.id);
  }
}
