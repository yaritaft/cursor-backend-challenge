import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookUpdateDto, WebhookUpdateResponseDto } from './dto';

interface WebhookPayload {
  event_type?: string;
  type?: string;
  source?: string;
  [key: string]: any;
}

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all webhook updates' })
  @ApiOkResponse({
    description: 'Returns all webhook updates',
    type: WebhookUpdateResponseDto,
    isArray: true,
  })
  async findAll(): Promise<WebhookUpdateResponseDto[]> {
    const updates = await this.webhooksService.findAll();
    return updates.map((update) => new WebhookUpdateResponseDto(update));
  }

  @Get('unprocessed')
  @ApiOperation({ summary: 'Get all unprocessed webhook updates' })
  @ApiOkResponse({
    description: 'Returns all unprocessed webhook updates',
    type: WebhookUpdateResponseDto,
    isArray: true,
  })
  async findUnprocessed(): Promise<WebhookUpdateResponseDto[]> {
    const updates = await this.webhooksService.findUnprocessed();
    return updates.map((update) => new WebhookUpdateResponseDto(update));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webhook update by ID' })
  @ApiParam({ name: 'id', description: 'The webhook update ID' })
  @ApiOkResponse({
    description: 'Returns the webhook update with the specified ID',
    type: WebhookUpdateResponseDto,
  })
  async findById(@Param('id') id: string): Promise<WebhookUpdateResponseDto> {
    const update = await this.webhooksService.findById(Number(id));
    return new WebhookUpdateResponseDto(update);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new webhook update' })
  @ApiBody({ type: CreateWebhookUpdateDto })
  @ApiCreatedResponse({
    description: 'The webhook update has been successfully created',
    type: WebhookUpdateResponseDto,
  })
  async create(
    @Body() createWebhookUpdateDto: CreateWebhookUpdateDto,
  ): Promise<WebhookUpdateResponseDto> {
    const update = await this.webhooksService.create(createWebhookUpdateDto);
    return new WebhookUpdateResponseDto(update);
  }

  @Post('receive')
  @ApiOperation({ summary: 'Receive a webhook update from external source' })
  @ApiBody({ type: Object, description: 'Any JSON payload' })
  @ApiCreatedResponse({
    description: 'The webhook update has been successfully received',
    type: WebhookUpdateResponseDto,
  })
  async receive(
    @Body() payload: WebhookPayload,
  ): Promise<WebhookUpdateResponseDto> {
    // Determine the type of update based on the payload
    // This logic can be customized based on your specific webhook structure
    const type = payload.event_type || payload.type || 'unknown';
    const source = payload.source || 'external';

    const createDto: CreateWebhookUpdateDto = {
      type,
      source,
      payload,
    };

    const update = await this.webhooksService.create(createDto);
    return new WebhookUpdateResponseDto(update);
  }

  @Put(':id/process')
  @ApiOperation({ summary: 'Mark a webhook update as processed' })
  @ApiParam({ name: 'id', description: 'The webhook update ID' })
  @ApiOkResponse({
    description: 'The webhook update has been marked as processed',
    type: WebhookUpdateResponseDto,
  })
  async markAsProcessed(
    @Param('id') id: string,
  ): Promise<WebhookUpdateResponseDto> {
    const update = await this.webhooksService.markAsProcessed(Number(id));
    return new WebhookUpdateResponseDto(update);
  }
}
