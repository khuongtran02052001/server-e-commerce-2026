import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginateOptionsDTO } from 'src/common/dto/paginate-options.dto';
import { CurrentUser } from 'src/common/utils/current-user.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminUpdateOrderDto } from '../orders/dto/admin-update-order.dto';
import { AdminService } from './admin.service';
import {
  AssignEmployeeRoleDto,
  EmployeeQueryDto,
  ManageEmployeeByEmailDto,
  SuspendEmployeeDto,
} from './dto/employee.dto';
import { AssignDeliveryDto, MarkDeliveredDto, WorkflowNoteDto } from './dto/order-workflow.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('account-requests')
  getAccountRequests(@Query() pagination: PaginateOptionsDTO, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getAccountRequests(pagination);
  }

  @Get('account-requests-summary')
  getAccountRequestsSummary(@CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getAccountRequestsSummary();
  }

  @Post('approve-account')
  approveAccount(
    @Body() body: { userId: string; type: 'premium' | 'business' },
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.approveAccount(body.userId, body.type, user.id);
  }

  @Post('reject-account')
  rejectAccount(
    @Body() body: { userId: string; type: 'premium' | 'business'; reason: string },
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.rejectAccount(body.userId, body.type, body.reason);
  }

  @Post('cancel-account')
  cancelAccount(
    @Body() body: { accountId: string; type: 'premium' | 'business'; reason: string },
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.cancelAccount(body.accountId, body.type, body.reason);
  }

  @Get('business-accounts')
  listBusinessAccounts(@Query() pagination: PaginateOptionsDTO, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.listBusinessAccounts(pagination);
  }

  @Post('business-accounts/approve')
  approveBusinessAccount(
    @Body() body: { accountId: string; approve: boolean; adminEmail: string; reason?: string },
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.updateBusinessAccount(
      body.accountId,
      body.approve,
      body.adminEmail,
      body.reason,
    );
  }

  @Get('premium-accounts')
  listPremiumAccounts(@Query() pagination: PaginateOptionsDTO, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.listPremiumAccounts(pagination);
  }

  @Post('premium-accounts/approve')
  approvePremiumAccount(
    @Body() body: { accountId: string; approve: boolean; adminEmail: string; reason?: string },
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.updatePremiumAccount(
      body.accountId,
      body.approve,
      body.adminEmail,
      body.reason,
    );
  }

  @Get('users')
  listUsers(
    @Query() pagination: PaginateOptionsDTO,
    @Query('query') query = '',
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.listUsers(pagination, query || undefined);
  }

  @Delete('users')
  deleteUsers(@Body() body: { userIds: string[] }, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.deleteUsers(body.userIds || [], user.id);
  }

  @Get('users/combined')
  listUsersCombined(
    @Query() pagination: PaginateOptionsDTO,
    @Query('query') query = '',
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.listUsers(pagination, query || undefined);
  }

  @Post('users/:userId/activate')
  activateUser(
    @Param('userId') userId: string,
    @Body() body: { action: 'activate' | 'deactivate' },
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.updateUserActivation(userId, body.action, user.email || user.id);
  }

  @Post('users/:userId/delete-sanity')
  deleteUser(@Param('userId') userId: string, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.deleteUsers([userId], user.id);
  }

  @Post('users/sync-to-sanity')
  syncUsers(@CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return { success: true, message: 'Sync disabled in REST mode' };
  }

  @Get('employees')
  listEmployees(
    @Query() pagination: PaginateOptionsDTO,
    @Query() filters: EmployeeQueryDto,
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.listEmployees(pagination, filters);
  }

  @Post('employees/assign-role')
  assignEmployeeRole(@Body() body: AssignEmployeeRoleDto, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.assignEmployeeRole(body, user.id);
  }

  @Patch('employees/:userId/suspend')
  suspendEmployee(
    @Param('userId') userId: string,
    @Body() body: SuspendEmployeeDto,
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.suspendEmployee(userId, body.reason, user.id);
  }

  @Patch('employees/:userId/activate')
  activateEmployee(@Param('userId') userId: string, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.activateEmployee(userId, user.id);
  }

  @Delete('employees/:userId/role')
  removeEmployeeRole(@Param('userId') userId: string, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.removeEmployeeRole(userId, user.id);
  }

  @Post('employees/manage-user')
  manageEmployeeByEmail(@Body() body: ManageEmployeeByEmailDto, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.manageEmployeeByEmail(body, user.id);
  }

  @Get('employees/me/metrics')
  getEmployeeMetrics(@CurrentUser() user) {
    return this.adminService.getEmployeeMetrics(user);
  }

  @Get('analytics')
  getAnalytics(@Query('period') period: string, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getAnalytics(period);
  }

  @Get('stats')
  getStats(@CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getStats();
  }

  @Get('products')
  getProducts(@Query() pagination: PaginateOptionsDTO, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getProducts(pagination);
  }

  @Get('orders')
  getOrders(@Query() pagination: PaginateOptionsDTO, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getOrders(pagination);
  }

  @Get('orders/:id')
  getOrderById(@Param('id') id: string, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getOrderById(id);
  }

  @Patch('orders/:id')
  updateOrder(@Param('id') id: string, @Body() body: AdminUpdateOrderDto, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.updateOrder(id, body);
  }

  @Patch('orders/:id/address-confirm')
  confirmAddress(@Param('id') id: string, @Body() body: WorkflowNoteDto, @CurrentUser() user) {
    return this.adminService.confirmAddress(id, user, body);
  }

  @Patch('orders/:id/order-confirm')
  confirmOrder(@Param('id') id: string, @Body() body: WorkflowNoteDto, @CurrentUser() user) {
    return this.adminService.confirmOrder(id, user, body);
  }

  @Patch('orders/:id/pack')
  markPacked(@Param('id') id: string, @Body() body: WorkflowNoteDto, @CurrentUser() user) {
    return this.adminService.markPacked(id, user, body);
  }

  @Patch('orders/:id/assign-deliveryman')
  assignDeliveryman(@Param('id') id: string, @Body() body: AssignDeliveryDto, @CurrentUser() user) {
    return this.adminService.assignDeliveryman(id, user, body);
  }

  @Patch('orders/:id/deliver')
  markDelivered(@Param('id') id: string, @Body() body: MarkDeliveredDto, @CurrentUser() user) {
    return this.adminService.markDelivered(id, user, body);
  }

  @Patch('orders/:id/receive-payment')
  receivePayment(@Param('id') id: string, @Body() body: WorkflowNoteDto, @CurrentUser() user) {
    return this.adminService.receivePayment(id, user, body);
  }

  @Get('orders/:id/workflow')
  getOrderWorkflow(@Param('id') id: string, @CurrentUser() user) {
    this.adminService.ensureEmployee(user);
    return this.adminService.getOrderWorkflow(id);
  }

  @Get('notifications')
  getNotifications(@Query() pagination: PaginateOptionsDTO, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getSentNotifications(pagination);
  }

  @Post('notifications/send')
  sendNotifications(
    @Body()
    body: {
      title: string;
      message: string;
      type?: string;
      priority?: string;
      actionUrl?: string;
      recipients: string[];
      sentBy?: string;
    },
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.sendNotifications(body.recipients || [], body);
  }

  @Get('notifications/sent')
  getSentNotifications(@Query() pagination: PaginateOptionsDTO, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getSentNotifications(pagination);
  }

  @Get('notifications/:id')
  getNotification(@Param('id') id: string, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getNotificationById(id);
  }

  @Get('subscriptions')
  getSubscriptions(@Query() pagination: PaginateOptionsDTO, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getSubscriptions(pagination);
  }

  @Get('subscriptions/:id')
  getSubscription(@Param('id') id: string, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return this.adminService.getSubscriptionById(id);
  }

  @Post('subscriptions/cleanup-duplicates')
  cleanupSubscriptions(@CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    return { success: true, removed: 0 };
  }

  @Get('reviews')
  getReviews(
    @Query() pagination: PaginateOptionsDTO,
    @Query('status') status = 'pending',
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    const normalized = ['pending', 'approved', 'rejected'].includes(status)
      ? (status as any)
      : 'pending';
    return this.adminService.getReviewsByStatus(normalized, pagination);
  }

  @Patch('reviews')
  updateReview(
    @Body() body: { reviewId: string; action: 'approve' | 'reject'; adminNotes?: string },
    @CurrentUser() user,
  ) {
    this.adminService.ensureAdmin(user);
    return this.adminService.updateReviewStatus(
      body.reviewId,
      body.action,
      user.id,
      body.adminNotes,
    );
  }

  @Post('manage-user')
  manageUser(@Body() body: { email: string; setPremium?: boolean }, @CurrentUser() user) {
    this.adminService.ensureAdmin(user);
    if (!body.email) {
      return { success: false, message: 'Email is required' };
    }
    return this.adminService.manageUserByEmail(
      body.email,
      Boolean(body.setPremium),
      user.email || user.id,
    );
  }
}
