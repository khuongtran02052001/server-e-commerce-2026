import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Category } from 'generated/prisma';
import { PaginateOptionsDTO } from 'src/common/dto/paginate-options.dto';
import { PaginatedResult } from 'src/common/utils/data-paginator.util';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  findCategoriesPagination(@Query() query: PaginateOptionsDTO): Promise<PaginatedResult<Category>> {
    return this.categoriesService.findCategoriesPagination(query);
  }

  @Get(':id')
  findCategory(@Param('id', ParseUUIDPipe) id: string): Promise<Category | null> {
    return this.categoriesService.findCategory(id);
  }

  @Patch(':id')
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }
  @Delete(':id')
  softDeleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return this.categoriesService.softDeleteCategory(id);
  }
  @Delete(':id/hard')
  removeCategory(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return this.categoriesService.removeCategory(id);
  }
}
