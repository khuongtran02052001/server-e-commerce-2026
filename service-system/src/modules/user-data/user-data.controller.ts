import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/utils/current-user.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDataService } from './user-data.service';

@ApiTags('UserData')
@Controller('user-data')
@UseGuards(JwtAuthGuard)
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Get()
  getUserData(@Query('email') email: string, @CurrentUser() user) {
    const targetEmail = email || user.email;
    return this.userDataService.getByEmail(targetEmail);
  }
}
