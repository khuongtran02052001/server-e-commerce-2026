import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  preferences?: Record<string, unknown>;
}
