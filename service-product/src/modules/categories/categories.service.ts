import { Injectable } from '@nestjs/common';
import { Category } from 'generated/prisma';
import { PaginateOptionsDTO } from 'src/common/dto/paginate-options.dto';
import { PaginatedResult } from 'src/common/utils/data-paginator.util';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  mapCreateCategoryDtoToPrisma,
  mapUpdateCategoryDtoToPrisma,
} from './mapper/category.mapper';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const data = mapCreateCategoryDtoToPrisma(createCategoryDto);
    return this.categoriesRepository.create(data);
  }

  findCategoriesPagination(
    paginateOptionsDTO: PaginateOptionsDTO,
  ): Promise<PaginatedResult<Category>> {
    const { page, perPage } = paginateOptionsDTO;
    return this.categoriesRepository.findPagination({
      page,
      perPage,
    });
  }

  findCategory(id: string): Promise<Category | null> {
    return this.categoriesRepository.findOne(id);
  }

  updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const data = mapUpdateCategoryDtoToPrisma(updateCategoryDto);
    return this.categoriesRepository.update(id, data);
  }
  softDeleteCategory(id: string): Promise<Category> {
    return this.categoriesRepository.softDelete(id);
  }
  removeCategory(id: string): Promise<Category> {
    return this.categoriesRepository.remove(id);
  }
}
