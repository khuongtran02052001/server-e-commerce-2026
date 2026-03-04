import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class WorkflowNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignDeliveryDto extends WorkflowNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  deliverymanId?: string;
}

export class MarkDeliveredDto extends WorkflowNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  cashCollectedAmount?: number;
}
