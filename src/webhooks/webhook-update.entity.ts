import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('webhook_updates')
export class WebhookUpdate {
  @ApiProperty({
    description: 'The unique identifier of the webhook update',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The type of update received',
    example: 'user.updated',
  })
  @Column()
  type: string;

  @ApiProperty({
    description: 'The source of the webhook update',
    example: 'payment-system',
  })
  @Column({ nullable: true })
  source: string;

  @ApiProperty({
    description: 'The payload of the webhook update as JSON',
    example: { user_id: 123, action: 'payment_processed' },
  })
  @Column('jsonb')
  payload: Record<string, any>;

  @ApiProperty({
    description: 'Indicates if this update has been processed',
    example: false,
  })
  @Column({ default: false })
  processed: boolean;

  @ApiProperty({
    description: 'Date and time when the update was received',
    example: '2023-07-15T12:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<WebhookUpdate>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
