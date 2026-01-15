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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginateOptionsDTO } from '../../common/dto/paginate-options.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('addresses')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  createAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.createAddress(createAddressDto);
  }

  @Get()
  findAddressesPagination(@Query() query: PaginateOptionsDTO) {
    return this.addressesService.findAddressesPagination(query);
  }

  @Get(':id')
  findAddress(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressesService.findAddress(id);
  }

  @Patch(':id')
  updateAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.updateAddress(id, updateAddressDto);
  }

  @Delete(':id')
  softDeleteAddress(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressesService.softDeleteAddress(id);
  }

  @Delete(':id/hard')
  removeAddress(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressesService.removeAddress(id);
  }
}
