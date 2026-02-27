import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ default: 'footer' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ default: 'unknown' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ default: 'unknown' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
