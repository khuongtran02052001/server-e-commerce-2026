import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewsletterDto } from './dto/newsletter.dto';
import { NewsletterService } from './newsletter.service';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() dto: NewsletterDto) {
    await this.newsletterService.subscribe(dto.email);
    return { success: true, message: 'Subscribed successfully' };
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() dto: NewsletterDto) {
    await this.newsletterService.unsubscribe(dto.email);
    return { success: true, message: 'Unsubscribed successfully' };
  }
}
