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
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { User } from 'generated/prisma';
import { PaginateOptionsDTO } from 'src/common/dto/paginate-options.dto';
import { PaginatedResult } from 'src/common/utils/data-paginator.util';
import { AddressesService } from '../addresses/addresses.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InternalTokenGuard } from './guards/internal-token.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly addressesService: AddressesService,
  ) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  findUsersPagination(@Query() query: PaginateOptionsDTO): Promise<PaginatedResult<User>> {
    return this.usersService.findUsersPagination(query);
  }

  @Get(':userId')
  findUser(@Param('userId') userId: string): Promise<Omit<User, 'password'> | null> {
    return this.usersService.findUser(userId);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.updateUser(id, updateUserDto);
  }
  @Delete(':id')
  softDeleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.softDeleteUser(id);
  }
  @Delete(':id/hard')
  removeUser(@Param('id', ParseUUIDPipe) id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.removeUser(id);
  }

  @ApiTags('Internal')
  @ApiHeader({
    name: 'X-Internal-Token',
    description: 'Internal service token',
    required: true,
  })
  @UseGuards(InternalTokenGuard)
  @Post('lite')
  async lite(@Body() body: GetUserDto) {
    const ids = Array.from(new Set(body.ids || [])).filter(Boolean);
    const users = await this.usersService.findLiteByIds(ids);
    return { data: users };
  }
}
