import { ApiProperty } from '@nestjs/swagger';
import { WebhookUpdate } from '../webhook-update.entity';

export class WebhookUpdateResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the webhook update',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The type of update received',
    example: 'user.updated',
  })
  type: string;

  @ApiProperty({
    description: 'The source of the webhook update',
    example: 'payment-system',
  })
  source: string;

  @ApiProperty({
    description: 'The payload of the webhook update',
    example: { user_id: 123, action: 'payment_processed' },
  })
  payload: Record<string, any>;

  @ApiProperty({
    description: 'Indicates if this update has been processed',
    example: false,
  })
  processed: boolean;

  @ApiProperty({
    description: 'Date and time when the update was received',
    example: '2023-07-15T12:00:00Z',
  })
  createdAt: Date;

  constructor(webhookUpdate: WebhookUpdate) {
    this.id = webhookUpdate.id;
    this.type = webhookUpdate.type;
    this.source = webhookUpdate.source;
    this.payload = webhookUpdate.payload;
    this.processed = webhookUpdate.processed;
    this.createdAt = webhookUpdate.createdAt;
  }
}
