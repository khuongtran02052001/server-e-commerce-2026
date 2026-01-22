import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CurrentUserType } from 'src/common/utils/current-user.util';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepo: ReviewsRepository) {}

  async getReviews(productId: string) {
    console.log('reviews.getReviews productId:', productId);
    const reviews = await this.reviewsRepo.findApprovedByProductId(productId);
    if (!reviews.length) {
      return {
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        },
      };
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / totalReviews;

    const ratingDistribution = {
      fiveStars: reviews.filter((r) => r.rating === 5).length,
      fourStars: reviews.filter((r) => r.rating === 4).length,
      threeStars: reviews.filter((r) => r.rating === 3).length,
      twoStars: reviews.filter((r) => r.rating === 2).length,
      oneStar: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      ratingDistribution,
    };
  }

  async createReview(dto: CreateReviewDto, user: CurrentUserType) {
    const product = await this.reviewsRepo.productExists(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.reviewsRepo.findByUserProduct(dto.productId, user.id);
    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const deliveredOrder = await this.reviewsRepo.hasDeliveredOrder(user.id, dto.productId);
    const review = await this.reviewsRepo.create({
      product: { connect: { id: dto.productId } },
      user: { connect: { id: user.id } },
      rating: dto.rating,
      title: dto.title,
      content: dto.content,
      isVerifiedPurchase: Boolean(deliveredOrder),
      status: 'pending',
      helpful: 0,
    });

    return {
      success: true,
      message: 'Thank you for your review! It will be published after admin approval.',
      reviewId: review.id,
    };
  }

  async toggleHelpful(reviewId: string, userId: string) {
    const review = await this.reviewsRepo.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const alreadyMarked = await this.reviewsRepo.findHelpful(reviewId, userId);
    if (alreadyMarked) {
      const helpful = await this.reviewsRepo.removeHelpful(reviewId, userId);
      return {
        success: true,
        message: 'Review unmarked as helpful',
        helpful,
      };
    }

    const helpful = await this.reviewsRepo.addHelpful(reviewId, userId);
    return {
      success: true,
      message: 'Review marked as helpful',
      helpful,
    };
  }
}
