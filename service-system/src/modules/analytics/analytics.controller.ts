import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrackEventDto } from './dto/track.dto';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async track(@Body() dto: TrackEventDto) {
    await this.analyticsService.trackEvent(dto.eventName, dto.eventParams);
    return { success: true };
  }

  @Get('best-sellers')
  getBestSellers(@Query('limit') limit?: string) {
    const take = Number(limit) > 0 ? Number(limit) : 10;
    return this.analyticsService.getBestSellers(take);
  }
}
