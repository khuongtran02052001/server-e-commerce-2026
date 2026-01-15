import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import * as currentUserUtil from 'src/common/utils/current-user.util';
import { AuthService } from './auth.service';
import { CreateTokenDto } from './dto/google-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google-login')
  async googleLogin(@Body() body: CreateTokenDto) {
    return this.authService.loginWithGoogle(body);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  getMe(@currentUserUtil.CurrentUser() user: currentUserUtil.CurrentUserType) {
    return this.authService.getMe(user.id);
  }
}
