import { Injectable } from '@nestjs/common';
import { Address } from 'generated/prisma';
import { PaginateOptionsDTO } from 'src/common/dto/paginate-options.dto';
import { PaginatedResult } from 'src/common/utils/data-paginator.util';
import { AddressesRepository } from './addresses.repository';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { mapCreateAddressDtoToPrisma, mapUpdateAddressDtoToPrisma } from './mapper/address.mapper';

@Injectable()
export class AddressesService {
  constructor(private addressesRepository: AddressesRepository) {}

  createAddress(createAddressDto: CreateAddressDto): Promise<Address> {
    const data = mapCreateAddressDtoToPrisma(createAddressDto);
    return this.addressesRepository.create(data);
  }

  findAddressesPagination(
    paginateOptionsDTO: PaginateOptionsDTO,
  ): Promise<PaginatedResult<Address>> {
    const { page, perPage } = paginateOptionsDTO;
    return this.addressesRepository.findPagination({
      page,
      perPage,
    });
  }

  findAddress(id: string): Promise<Address | null> {
    return this.addressesRepository.findOne(id);
  }

  updateAddress(id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const data = mapUpdateAddressDtoToPrisma(updateAddressDto);
    return this.addressesRepository.update(id, data);
  }

  softDeleteAddress(id: string): Promise<Address> {
    return this.addressesRepository.softDelete(id);
  }

  removeAddress(id: string): Promise<Address> {
    return this.addressesRepository.remove(id);
  }

  getAddressesByUser(userId: string) {
    return this.addressesRepository.findByUserId(userId);
  }
}
