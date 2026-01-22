import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApplyBusinessDto {
  @ApiProperty()
  @IsString()
  email: string;
}
