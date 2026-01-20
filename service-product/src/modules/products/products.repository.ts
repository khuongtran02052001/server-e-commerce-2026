import { Injectable } from '@nestjs/common';
import { Prisma, Product } from 'generated/prisma';
import { dataPaginate, PaginatedResult } from 'src/common/utils/data-paginator.util';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private prismaService: PrismaService) {}
  create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prismaService.product.create({
      data: data,
    });
  }

  async findPagination({
    where,
    orderBy,
    include,
    page,
    perPage,
  }: {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    include?: Prisma.ProductInclude;
    page?: number | string | undefined;
    perPage?: number | string | undefined;
  }): Promise<PaginatedResult<Product>> {
    return dataPaginate(
      this.prismaService.product,
      {
        where,
        orderBy,
        include,
      },
      { page, perPage },
    );
  }

  findOne(slug: string): Promise<Product | null> {
    return this.prismaService.product.findFirst({
      where: { slug },
      include: {
        categories: true,
      },
    });
  }

  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prismaService.product.update({
      where: { id },
      data: data,
    });
  }
  softDelete(id: string): Promise<Product> {
    return this.prismaService.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  remove(id: string): Promise<Product> {
    return this.prismaService.product.delete({
      where: { id },
    });
  }

  async searchPagination({
    where,
    orderBy,
    include,
    page,
    perPage,
  }: {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    include?: Prisma.ProductInclude;
    page?: number | string | undefined;
    perPage?: number | string | undefined;
  }): Promise<PaginatedResult<Product>> {
    return dataPaginate(
      this.prismaService.product,
      {
        where,
        orderBy,
        include,
      },
      { page, perPage },
    );
  }

  findRelatedProducts(params: {
    categoryIds: string[];
    currentSlug?: string;
    limit: number;
  }): Promise<Product[]> {
    const { categoryIds, currentSlug, limit } = params;
    if (categoryIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prismaService.product.findMany({
      where: {
        categories: { some: { id: { in: categoryIds } } },
        ...(currentSlug ? { slug: { not: currentSlug } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: true,
        brand: true,
        images: true,
        ratingDistribution: true,
      },
    });
  }
}
