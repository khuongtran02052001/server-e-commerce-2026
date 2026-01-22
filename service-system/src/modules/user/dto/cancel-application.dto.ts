import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class CancelApplicationDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ enum: ['premium', 'business'] })
  @IsIn(['premium', 'business'])
  applicationType: 'premium' | 'business';
}
