// user.mapper.ts
import { Prisma } from 'generated/prisma';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

export function mapCreateCategoryDtoToPrisma(dto: CreateCategoryDto): Prisma.CategoryCreateInput {
  return {
    title: dto.title,
    slug: dto.slug,
    description: dto.description,
    range: dto.range,
    featured: dto.featured,
    imageUrl: dto.imageUrl,
  };
}
export function mapUpdateCategoryDtoToPrisma(dto: UpdateCategoryDto): Prisma.CategoryUpdateInput {
  return {
    title: dto.title,
    slug: dto.slug,
    description: dto.description,
    range: dto.range,
    featured: dto.featured,
    imageUrl: dto.imageUrl,
  };
}
