import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PaginateOptionsDTO } from 'src/common/dto/paginate-options.dto';
import { PaginatedResult } from 'src/common/utils/data-paginator.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}
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
}
