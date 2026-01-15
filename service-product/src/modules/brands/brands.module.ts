import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandsController } from './brands.controller';
import { BrandsRepository } from './brands.repository';
import { BrandsService } from './brands.service';

@Module({
  imports: [PrismaModule],
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository],
})
export class BrandsModule {}
