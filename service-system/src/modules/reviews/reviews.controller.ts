import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/utils/current-user.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsQueryDto } from './dto/get-reviews.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getReviews(@Query() query: GetReviewsQueryDto) {
    return this.reviewsService.getReviews(query.productId);
  }

  @Get('can-review')
  @UseGuards(JwtAuthGuard)
  canReview(@Query('productId') productId: string, @CurrentUser() user) {
    return this.reviewsService.canUserReviewProduct(productId, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createReview(@Body() dto: CreateReviewDto, @CurrentUser() user) {
    return this.reviewsService.createReview(dto, user);
  }

  @Patch(':id/helpful')
  @UseGuards(JwtAuthGuard)
  toggleHelpful(@Param('id') id: string, @CurrentUser() user) {
    return this.reviewsService.toggleHelpful(id, user.id);
  }
}
