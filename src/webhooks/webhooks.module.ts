import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhooksRepository } from './webhooks.repository';
import { WebhookUpdate } from './webhook-update.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookUpdate])],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksRepository],
  exports: [WebhooksService],
})
export class WebhooksModule {}
