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
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDTO } from './dto/find-products.dto';
import { SearchProductsQueryDTO } from './dto/search-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  findProductsPagination(@Query() query: FindProductsQueryDTO) {
    return this.productsService.findProductsPagination(query);
  }

  @Get('/search')
  searchProductsPagination(@Query() query: SearchProductsQueryDTO) {
    return this.productsService.searchProductsPagination(query);
  }

  @Get('/featured')
  featuredProductsPagination(@Query() query: FindProductsQueryDTO) {
    return this.productsService.findProductsFeatured(query);
  }

  @Get(':slug')
  findProduct(@Param('slug') slug: string) {
    return this.productsService.findProduct(slug);
  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }
  @Delete(':id')
  softDeleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDeleteProduct(id);
  }
  @Delete(':id/hard')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.removeProduct(id);
  }
}
