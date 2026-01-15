// user.mapper.ts
import { Prisma } from 'generated/prisma';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export function mapCreateProductDtoToPrisma(dto: CreateProductDto): Prisma.ProductCreateInput {
  return {
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    price: dto.price,
    discount: dto.discount,
    category: { connect: { id: dto.CategoryId } },
    stock: dto.stock,
    status: dto.status,
    isFeatured: dto.isFeatured,
    averageRating: dto.averageRating,
    totalReviews: dto.totalReviews,
    user: { connect: { id: dto.userId } },
  };
}
export function mapUpdateProductDtoToPrisma(dto: UpdateProductDto): Prisma.ProductUpdateInput {
  return {
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    price: dto.price,
    discount: dto.discount,
    category: { connect: { id: dto.CategoryId } },
    stock: dto.stock,
    status: dto.status,
    isFeatured: dto.isFeatured,
    averageRating: dto.averageRating,
    totalReviews: dto.totalReviews,

    user: { connect: { id: dto.userId } },
  };
}
