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
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
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

  @Get(':id')
  findProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findProduct(id);
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
