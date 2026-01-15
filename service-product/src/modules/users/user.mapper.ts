// user.mapper.ts
import { Prisma } from 'generated/prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export function mapCreateUserDtoToPrisma(dto: CreateUserDto): Prisma.UserCreateInput {
  return {
    email: dto.email,
    password: dto.password,
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    dateOfBirth: dto.dateOfBirth,
    profileImage: dto.profileImage,
    walletBalance: dto.walletBalance,
  };
}
export function mapUpdateUserDtoToPrisma(dto: UpdateUserDto): Prisma.UserUpdateInput {
  return {
    email: dto.email,
    password: dto.password,
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    dateOfBirth: dto.dateOfBirth,
    profileImage: dto.profileImage,
    walletBalance: dto.walletBalance,
  };
}
