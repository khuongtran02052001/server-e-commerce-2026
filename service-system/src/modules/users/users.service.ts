import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PaginateOptionsDTO } from 'src/common/dto/paginate-options.dto';
import { PaginatedResult } from 'src/common/utils/data-paginator.util';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private prisma: PrismaService,
  ) {}
  createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    return this.usersRepository.create(createUserDto);
  }

  findUsersPagination(paginateOptionsDTO: PaginateOptionsDTO): Promise<PaginatedResult<User>> {
    const { page, perPage } = paginateOptionsDTO;
    return this.usersRepository.findPagination({ page, perPage });
  }

  findUser(id: string): Promise<Omit<User, 'password'> | null> {
    return this.usersRepository.findOne(id);
  }

  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    return this.usersRepository.update(id, updateUserDto);
  }
  softDeleteUser(id: string): Promise<Omit<User, 'password'>> {
    return this.usersRepository.softDelete(id);
  }
  removeUser(id: string): Promise<Omit<User, 'password'>> {
    return this.usersRepository.remove(id);
  }
  findLiteByIds(ids: string[]): Promise<{ id: string; email: string }[]> {
    return this.usersRepository.findLiteByIds(ids);
  }

  async getWishlist(userId: string) {
    const result = await this.usersRepository.getWishlist(userId);
    if (!result) throw new NotFoundException('User not found');
    return { data: result.wishlist ?? [] };
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const updated = await this.usersRepository.addWishlistItem(userId, productId);
    return { data: updated.wishlist ?? [] };
  }

  async removeFromWishlist(userId: string, productId: string) {
    const updated = await this.usersRepository.removeWishlistItem(userId, productId);
    return { data: updated.wishlist ?? [] };
  }
}
