import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class UnsubscribeNewsletterDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
