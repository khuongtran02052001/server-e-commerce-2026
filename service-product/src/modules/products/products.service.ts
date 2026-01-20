import { Injectable } from '@nestjs/common';
import { Prisma, Product } from 'generated/prisma';
import { PaginatedResult } from 'src/common/utils/data-paginator.util';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDTO } from './dto/find-products.dto';
import { SearchProductsQueryDTO } from './dto/search-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { mapCreateProductDtoToPrisma, mapUpdateProductDtoToPrisma } from './mapper/product.mapper';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {}
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const data = mapCreateProductDtoToPrisma(createProductDto);
    return this.productsRepository.create(data);
  }

  findProductsPagination(query: FindProductsQueryDTO): Promise<PaginatedResult<Product>> {
    const {
      page,
      perPage,
      category,
      variant,
      sort = 'name',
      order = 'asc',
      brand,
      maxPrice,
      minPrice,
    } = query;
    const where: Prisma.ProductWhereInput = {};
    if (category) where.category = { slug: category };
    if (variant) where.status = variant;
    if (brand) {
      where.brand = { slug: brand };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        gte: minPrice ?? undefined,
        lte: maxPrice ?? undefined,
      };
    }

    const finalWhere = Object.keys(where).length ? where : undefined;

    const allowedSortFields: Array<keyof Product> = ['name', 'price', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'name';

    return this.productsRepository.findPagination({
      page,
      perPage,
      where: finalWhere,
      orderBy: {
        [sortField]: order,
      },
      include: {
        category: true,
        brand: true,
        images: true,
        ratingDistribution: true,
      },
    });
  }

  findProduct(slug: string): Promise<Product | null> {
    return this.productsRepository.findOne(slug);
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const data = mapUpdateProductDtoToPrisma(updateProductDto);
    return this.productsRepository.update(id, data);
  }

  async softDeleteProduct(id: string): Promise<Product> {
    return this.productsRepository.softDelete(id);
  }

  async removeProduct(id: string): Promise<Product> {
    return this.productsRepository.remove(id);
  }

  searchProductsPagination(query: SearchProductsQueryDTO): Promise<PaginatedResult<Product>> {
    const { page, perPage, search } = query;
    const searchTerm = (search ?? '').trim();

    return this.productsRepository.searchPagination({
      page,
      perPage,
      where: searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { slug: { contains: searchTerm, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        brand: true,
        images: true,
        ratingDistribution: true,
      },
    });
  }

  findProductsFeatured(query: FindProductsQueryDTO): Promise<PaginatedResult<Product>> {
    const { page, perPage } = query;

    return this.productsRepository.findPagination({
      page,
      perPage,
      where: {
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        brand: true,
        images: true,
        ratingDistribution: true,
      },
    });
  }
}
