import { Prisma } from 'generated/prisma';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

export const mapCreateAddressDtoToPrisma = (dto: CreateAddressDto): Prisma.AddressCreateInput => {
  return {
    address: dto.address,
    userId: dto.userId,
  } as Prisma.AddressCreateInput;
};

export const mapUpdateAddressDtoToPrisma = (dto: UpdateAddressDto): Prisma.AddressUpdateInput => {
  return {
    address: dto.address,
  } as Prisma.AddressUpdateInput;
};
