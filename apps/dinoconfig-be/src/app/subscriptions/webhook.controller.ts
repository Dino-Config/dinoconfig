import { Controller, Post, Req, Headers, HttpCode, HttpStatus, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private stripeService: StripeService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ) {
    console.log('Webhook received, signature:', signature);
    console.log('Raw body exists:', !!request.rawBody);
    console.log('Raw body length:', request.rawBody?.length || 0);

    const payload = request.rawBody;

    if (!payload) {
      console.error('No payload received in webhook');
      throw new Error('No payload received');
    }

    if (!signature) {
      console.error('No signature received in webhook');
      throw new Error('No signature received');
    }

    try {
      await this.stripeService.handleWebhook(payload, signature);
      console.log('Webhook processed successfully');
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw error;
    }

    return { received: true };
  }
}

