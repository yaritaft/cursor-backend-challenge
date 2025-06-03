# Cursor Backend Challenge

You have to build a microservice that exposes a REST api with two different
tables, users and states. Both tables should be open to creation, deletion,
or update. Every request must only accept this `Content-type: application/json`.

## Deployed App Running on HEROKU

- [SWAGGER](https://blooming-garden-01349-26f398f01a3b.herokuapp.com/api)

### Badges

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/yaritaft/cursor-backend-challenge/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/yaritaft/cursor-backend-challenge/tree/master)

[![Coverage Status](https://coveralls.io/repos/github/yaritaft/cursor-backend-challenge/badge.svg)](https://coveralls.io/github/yaritaft/cursor-backend-challenge)

### How to run locally coveralls

```
COVERALLS_REPO_TOKEN=gLskLgZ58OYgHYPem2MLSnox65zICVe8t npm run test:cov
```

### Features

- Create new Users with their Pokemon Ids
- Get Users list
- Get User by Id and also gathering Pokemon Names from Poke API
- Update User
- Delete User

## Pre-Requisites

- Docker installed without SUDO Permission
- Docker compose installed without SUDO
- Ports free: 3000 and 5432

## How to run the APP

```
chmod 711 ./up_dev.sh
./up_dev.sh
```

## How to run the tests

```
chmod 711 ./up_test.sh
./up_test.sh
```

## Areas to improve

- Data should be moved from tests to an external file
- Generic method should be used to mock endpoints
- Error handling could be improved (I.E handle already existing user error)
- A Seed migration would be useful to have an already working app with data
- The ORM is being used with Synchronize instead of migrations. Migrations would be the best option
- Deployment could be done

## Errors to be fixed

- Docker app is not running properly

## Techs

- Nest: 11
- Node: Node20.11.1
- TypeORM
- Postgres

## Decisions made

- Clean Architecture: To be able to handle further changes in the future in a proper way.
- TypeORM: Because it is the already integrated ORM in the Nest Framework and it is the most popular ORM so it is easy to find fixes and people that know how to use it
- Docker: To make portable
- Jest/Testing/E2E: Jest is the most used testing framework of JS. Same argument as above. E2E testing was done because it is useless to always test every single part. That's why if the controller provide the proper answer the test has passed.

## Route

- Local: [API Swagger](http://localhost:3000/api)

## Env vars should be defined

To find an example of the values you can use .env.example

# Webhook API

A simple API for registering and managing webhooks, with the ability to manually trigger updates for testing purposes.

## Setup and Installation

1. Create a virtual environment (optional but recommended):

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Run the API:
   ```
   python webhook_api.py
   ```

The API will be available at `http://localhost:5000`.

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
   curl -X POST http://localhost:5000/webhooks \
     -H "Content-Type: application/json" \
     -d '{"url": "https://webhook.site/your-unique-id", "description": "Test webhook"}'
   ```

2. Trigger the webhook:

   ```
   curl -X POST http://localhost:5000/trigger \
     -H "Content-Type: application/json" \
     -d '{"event": "update", "timestamp": "2023-07-15T12:00:00Z"}'
   ```

3. Check event history:
   ```
   curl http://localhost:5000/events
   ```
