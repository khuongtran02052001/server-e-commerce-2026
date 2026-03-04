import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

const EMPLOYEE_ROLES = ['CALL_CENTER', 'PACKER', 'DELIVERY_MAN', 'INCHARGE', 'ACCOUNTS'] as const;

export class AssignEmployeeRoleDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: EMPLOYEE_ROLES })
  @IsString()
  @IsIn(EMPLOYEE_ROLES)
  role: (typeof EMPLOYEE_ROLES)[number];
}

export class SuspendEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class EmployeeQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: ['active', 'suspended'] })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'suspended'])
  status?: 'active' | 'suspended';

  @ApiPropertyOptional({ enum: EMPLOYEE_ROLES })
  @IsOptional()
  @IsString()
  @IsIn(EMPLOYEE_ROLES)
  role?: (typeof EMPLOYEE_ROLES)[number];
}

export class ManageEmployeeByEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: EMPLOYEE_ROLES })
  @IsString()
  @IsIn(EMPLOYEE_ROLES)
  role: (typeof EMPLOYEE_ROLES)[number];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
