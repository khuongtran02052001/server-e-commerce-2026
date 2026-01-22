import { Injectable } from '@nestjs/common';
import { Category, Prisma } from 'generated/prisma';
import { dataPaginate, PaginatedResult } from 'src/common/utils/data-paginator.util';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private prismaService: PrismaService) {}

  create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prismaService.category.create({ data });
  }

  async findPagination({
    where,
    orderBy,
    page,
    perPage,
  }: {
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
    page?: number | string | undefined;
    perPage?: number | string | undefined;
  }): Promise<PaginatedResult<Category>> {
    return dataPaginate(this.prismaService.category, { where, orderBy }, { page, perPage });
  }

  findOne(id: string): Promise<Category | null> {
    return this.prismaService.category.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prismaService.category.update({
      where: { id },
      data,
    });
  }
  softDelete(id: string): Promise<Category> {
    return this.prismaService.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  remove(id: string): Promise<Category> {
    return this.prismaService.category.delete({ where: { id } });
  }
}
