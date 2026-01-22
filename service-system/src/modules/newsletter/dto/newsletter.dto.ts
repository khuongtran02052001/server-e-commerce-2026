import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class NewsletterDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
