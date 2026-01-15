import { Injectable } from '@nestjs/common';
import { Address, Prisma } from 'generated/prisma';
import { dataPaginate, PaginatedResult } from 'src/common/utils/data-paginator.util';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AddressesRepository {
  constructor(private prismaService: PrismaService) {}

  create(data: Prisma.AddressCreateInput): Promise<Address> {
    return this.prismaService.address.create({ data });
  }

  async findPagination({
    where,
    orderBy,
    page,
    perPage,
  }: {
    where?: Prisma.AddressWhereInput;
    orderBy?: Prisma.AddressOrderByWithRelationInput;
    page?: number | string | undefined;
    perPage?: number | string | undefined;
  }): Promise<PaginatedResult<Address>> {
    return dataPaginate(this.prismaService.address, { where, orderBy }, { page, perPage });
  }

  findOne(id: string): Promise<Address | null> {
    return this.prismaService.address.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.AddressUpdateInput): Promise<Address> {
    return this.prismaService.address.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<Address> {
    return this.prismaService.address.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  remove(id: string): Promise<Address> {
    return this.prismaService.address.delete({ where: { id } });
  }

  // helper to get addresses by user
  findByUserId(userId: string) {
    return this.prismaService.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
