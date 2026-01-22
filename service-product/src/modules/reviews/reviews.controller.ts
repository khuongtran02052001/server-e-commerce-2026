import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/utils/current-user.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsQueryDto } from './dto/get-reviews.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getReviews(@Query() query: GetReviewsQueryDto) {
    console.log('reviews.getReviews query:', query);
    return this.reviewsService.getReviews(query.productId);
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
