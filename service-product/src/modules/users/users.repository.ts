import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { dataPaginate, PaginatedResult } from 'src/common/utils/data-paginator.util';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}
  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data, omit: { password: true } });
  }

  findPagination({
    where,
    orderBy,
    page,
    perPage,
  }: {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResult<User>> {
    return dataPaginate(
      this.prisma.user,
      {
        where,
        orderBy,
        omit: { password: true },
      },
      {
        page,
        perPage,
      },
    );
  }

  findOne(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, omit: { password: true } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: { password: true },
    });
  }
  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      omit: { password: true },
    });
  }
  remove(id: string) {
    return this.prisma.user.delete({ where: { id }, omit: { password: true } });
  }
}
