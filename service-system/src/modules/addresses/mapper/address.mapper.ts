import { Prisma } from 'generated/prisma';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

export const mapCreateAddressDtoToPrisma = (dto: CreateAddressDto): Prisma.AddressCreateInput => {
  return {
    addressName: dto.addressName,
    address: dto.address,
    city: dto.city,
    state: dto.state,
    zip: dto.zip,
    userId: dto.userId,
  } as Prisma.AddressCreateInput;
};

export const mapUpdateAddressDtoToPrisma = (dto: UpdateAddressDto): Prisma.AddressUpdateInput => {
  return {
    addressName: dto.addressName,
    address: dto.address,
    city: dto.city,
    state: dto.state,
    zip: dto.zip,
  } as Prisma.AddressUpdateInput;
};
