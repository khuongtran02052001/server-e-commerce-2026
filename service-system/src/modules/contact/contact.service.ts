import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(name: string, email: string, subject: string | undefined, message: string) {
    return this.prisma.contactMessage.create({
      data: { name, email, subject, message },
    });
  }
}
