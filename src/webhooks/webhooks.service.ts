import { Injectable } from '@nestjs/common';
import { WebhooksRepository } from './webhooks.repository';
import { WebhookUpdate } from './webhook-update.entity';
import { CreateWebhookUpdateDto } from './dto';

@Injectable()
export class WebhooksService {
  constructor(private readonly webhooksRepository: WebhooksRepository) {}

  async findAll(): Promise<WebhookUpdate[]> {
    return this.webhooksRepository.findAll();
  }

  async findById(id: number): Promise<WebhookUpdate> {
    return this.webhooksRepository.findById(id);
  }

  async create(
    createWebhookUpdateDto: CreateWebhookUpdateDto,
  ): Promise<WebhookUpdate> {
    return this.webhooksRepository.create(createWebhookUpdateDto);
  }

  async markAsProcessed(id: number): Promise<WebhookUpdate> {
    return this.webhooksRepository.markAsProcessed(id);
  }

  async findUnprocessed(): Promise<WebhookUpdate[]> {
    return this.webhooksRepository.findUnprocessed();
  }
}
