import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  @Post()
  handle(@Body() body: any) {
    return { received: true, payload: body };
  }
}
