import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookUpdateDto {
  @ApiProperty({
    description: 'The type of update received',
    example: 'user.updated',
    required: true,
  })
  type: string;

  @ApiProperty({
    description: 'The source of the webhook update',
    example: 'payment-system',
    required: false,
  })
  source?: string;

  @ApiProperty({
    description: 'The payload of the webhook update',
    example: { user_id: 123, action: 'payment_processed' },
    required: true,
  })
  payload: Record<string, any>;
}
