import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TrackEventDto {
  @ApiProperty()
  @IsString()
  eventName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  eventParams?: Record<string, unknown>;
}
