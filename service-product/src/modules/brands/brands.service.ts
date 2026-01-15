import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandsRepository } from './brands.repository';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepo: BrandsRepository) {}

  create(dto: CreateBrandDto) {
    return this.brandsRepo.create({
      name: dto.name,
      slug: dto.slug,
      imageUrl: dto.imageUrl,
    });
  }

  findAll() {
    return this.brandsRepo.findAll();
  }

  async findOne(id: string) {
    const brand = await this.brandsRepo.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);

    return this.brandsRepo.update(id, {
      name: dto.name,
      slug: dto.slug,
      imageUrl: dto.imageUrl,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.brandsRepo.softDelete(id);
  }
}
