import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactDto } from './dto/contact.dto';
import { ContactService } from './contact.service';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() dto: ContactDto) {
    await this.contactService.create(dto.name, dto.email, dto.subject, dto.message);
    return { success: true, message: 'Contact message received' };
  }
}
