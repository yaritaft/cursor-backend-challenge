# Webhook API

A simple API for registering and managing webhooks, with the ability to manually trigger updates for testing purposes.

## Setup and Installation

1. Create a virtual environment (already set up):

   ```
   # To activate the virtual environment:
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Run the API:
   ```
   python app.py
   ```

The API will be available at `http://localhost:8080`.

## API Documentation

The API includes Swagger documentation which is available at:

```
http://localhost:8080/swagger
```

This provides an interactive interface to explore and test all available endpoints.

## API Endpoints

### Register a Webhook

```
POST /webhooks
```

Request body:

```json
{
  "url": "https://your-site.com/webhook-receiver",
  "description": "My webhook endpoint"
}
```

### List All Webhooks

```
GET /webhooks
```

### Get Webhook Details

```
GET /webhooks/{webhook_id}
```

### Update a Webhook

```
PATCH /webhooks/{webhook_id}
```

Request body (all fields optional):

```json
{
  "url": "https://your-new-site.com/webhook-receiver",
  "description": "Updated description",
  "active": true
}
```

### Delete a Webhook

```
DELETE /webhooks/{webhook_id}
```

### Manually Trigger Webhooks

```
POST /trigger
```

Request body (any valid JSON):

```json
{
  "event": "update",
  "data": {
    "item_id": 123,
    "status": "completed"
  }
}
```

Optional query parameter:

- `webhook_id` - To trigger a specific webhook only

### View Event History

```
GET /events
```

Optional query parameters:

- `webhook_id` - Filter by webhook ID
- `status` - Filter by status (pending, success, failed)
- `limit` - Limit number of results (default: 100, max: 1000)

## Testing

You can use tools like curl or Postman to test the API.

For webhook testing, you can use services like:

- [webhook.site](https://webhook.site)
- [requestbin.com](https://requestbin.com)

These provide temporary URLs that show you incoming webhook payloads.

## Example Usage

1. Register a webhook:

   ```
   curl -X POST http://localhost:8080/webhooks \
     -H "Content-Type: application/json" \
     -d '{"url": "https://webhook.site/your-unique-id", "description": "Test webhook"}'
   ```

2. Trigger the webhook:

   ```
   curl -X POST http://localhost:8080/trigger \
     -H "Content-Type: application/json" \
     -d '{"event": "update", "timestamp": "2023-07-15T12:00:00Z"}'
   ```

3. Check event history:
   ```
   curl http://localhost:8080/events
   ```
