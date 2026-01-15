import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { NotificationPriority, NotificationType } from 'generated/prisma';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @IsOptional()
  @IsDateString()
  readAt?: string;

  @IsOptional()
  @IsString()
  sentBy?: string;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;
}
