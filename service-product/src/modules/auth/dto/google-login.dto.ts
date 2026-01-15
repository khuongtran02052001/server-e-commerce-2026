import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTokenDto {
  @ApiProperty({ required: false })
  @IsString()
  googleIdToken: string;
}
