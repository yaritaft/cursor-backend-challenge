import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookUpdate } from './webhook-update.entity';

@Injectable()
export class WebhooksRepository {
  constructor(
    @InjectRepository(WebhookUpdate)
    private webhookUpdatesRepository: Repository<WebhookUpdate>,
  ) {}

  async findAll(): Promise<WebhookUpdate[]> {
    return this.webhookUpdatesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<WebhookUpdate> {
    const webhookUpdate = await this.webhookUpdatesRepository.findOne({
      where: { id },
    });
    if (!webhookUpdate) {
      throw new NotFoundException(`Webhook update with ID ${id} not found`);
    }
    return webhookUpdate;
  }

  async create(
    webhookUpdateData: Partial<WebhookUpdate>,
  ): Promise<WebhookUpdate> {
    const webhookUpdate =
      this.webhookUpdatesRepository.create(webhookUpdateData);
    return this.webhookUpdatesRepository.save(webhookUpdate);
  }

  async markAsProcessed(id: number): Promise<WebhookUpdate> {
    const webhookUpdate = await this.findById(id);
    await this.webhookUpdatesRepository.update(id, { processed: true });
    webhookUpdate.processed = true;
    return webhookUpdate;
  }

  async findUnprocessed(): Promise<WebhookUpdate[]> {
    return this.webhookUpdatesRepository.find({
      where: { processed: false },
      order: { createdAt: 'ASC' },
    });
  }
}
