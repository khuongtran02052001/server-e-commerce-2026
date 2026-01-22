import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  @Post('stripe')
  stripeCheckout(@Body() body: any) {
    return {
      success: true,
      sessionId: 'mock_session_id',
      url: 'https://checkout.mock/session',
      message: 'Stripe checkout session created (mock)',
      payload: body,
    };
  }

  @Post('clerk')
  clerkCheckout(@Body() body: any) {
    return {
      success: true,
      message: 'Clerk checkout created (mock)',
      payload: body,
    };
  }

  @Post('clerk/complete')
  clerkComplete(@Body() body: any) {
    return {
      success: true,
      message: 'Clerk checkout completed (mock)',
      payload: body,
    };
  }
}
