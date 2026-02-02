import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTokenDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async loginWithGoogle(body: CreateTokenDto) {
    if (!body.googleIdToken) {
      throw new UnauthorizedException('Missing Google ID Token');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: body.googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const firstName = payload?.given_name || '';
    const lastName = payload?.family_name || '';

    if (!email) throw new UnauthorizedException('Invalid Google token');

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          profileImage: payload?.picture || null,
        },
      });
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      { expiresIn: '7d' },
    );
    return { data: { accessToken } };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
