import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() data: Prisma.NotificationCreateInput) {
    return this.notificationsService.create(data);
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.notificationsService.findAllByUser(userId);
  }

  @Get('/unread')
  findByUserUnRead(@Query('userId') userId: string) {
    return this.notificationsService.findAllUnReadByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  @Delete()
  deleteAllForUser(@Query('userId') userId: string) {
    return this.notificationsService.deleteAllForUser(userId);
  }
}
