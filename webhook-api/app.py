import os
import json
import uuid
import time
import threading
import requests
from flask import Flask, request, jsonify
from flask_restx import Api, Resource, fields, Namespace
from typing import Dict, List, Optional, Any

app = Flask(__name__)
api = Api(
    app,
    version='1.0',
    title='Webhook API',
    description='A simple API for managing webhooks and triggering updates',
    doc='/swagger'
)

# Create namespaces for our API endpoints
webhook_ns = Namespace('webhooks', description='Webhook operations')
event_ns = Namespace('events', description='Event history operations')
trigger_ns = Namespace('trigger', description='Webhook trigger operations')

api.add_namespace(webhook_ns)
api.add_namespace(event_ns)
api.add_namespace(trigger_ns, path='/')

# Define models for Swagger documentation
webhook_model = api.model('Webhook', {
    'url': fields.String(required=True, description='The webhook endpoint URL'),
    'description': fields.String(description='Description of the webhook purpose'),
    'active': fields.Boolean(description='Whether the webhook is active')
})

webhook_response = api.model('WebhookResponse', {
    'id': fields.String(description='Unique identifier for the webhook'),
    'url': fields.String(description='The webhook endpoint URL'),
    'description': fields.String(description='Description of the webhook purpose'),
    'created_at': fields.Float(description='Timestamp of creation'),
    'active': fields.Boolean(description='Whether the webhook is active')
})

trigger_model = api.model('TriggerPayload', {
    'event': fields.String(example='update', description='Event type'),
    'data': fields.Raw(description='Event data payload')
})

event_model = api.model('Event', {
    'id': fields.String(description='Unique identifier for the event'),
    'webhook_id': fields.String(description='ID of the webhook that was triggered'),
    'timestamp': fields.Float(description='Timestamp when the event was triggered'),
    'payload': fields.Raw(description='The payload that was sent'),
    'status': fields.String(description='Status of the webhook delivery (pending, success, failed)'),
    'response_code': fields.Integer(description='HTTP response code from the webhook endpoint'),
    'response': fields.String(description='Response from the webhook endpoint')
})

# In-memory storage for registered webhooks
# In a production environment, use a database
webhooks: Dict[str, Dict[str, Any]] = {}

# Simple in-memory event log
event_log: List[Dict[str, Any]] = []

def trigger_webhooks(payload: Dict[str, Any], specific_id: Optional[str] = None):
    """
    Trigger webhooks with the provided payload.
    If specific_id is provided, only trigger that webhook.
    """
    targets = [webhooks[specific_id]] if specific_id else webhooks.values()
    
    for webhook in targets:
        if not webhook.get('active', True):
            continue
            
        webhook_id = webhook['id']
        url = webhook['url']
        
        # Log the event attempt
        event = {
            'id': str(uuid.uuid4()),
            'webhook_id': webhook_id,
            'timestamp': time.time(),
            'payload': payload,
            'status': 'pending'
        }
        event_log.append(event)
        
        # Send the webhook in a separate thread to not block the request
        def send_webhook(url, payload, event):
            try:
                headers = {'Content-Type': 'application/json'}
                response = requests.post(url, json=payload, headers=headers, timeout=5)
                event['status'] = 'success' if response.status_code < 400 else 'failed'
                event['response_code'] = response.status_code
                event['response'] = response.text[:200]  # Truncate long responses
            except Exception as e:
                event['status'] = 'failed'
                event['error'] = str(e)
        
        thread = threading.Thread(target=send_webhook, args=(url, payload, event))
        thread.daemon = True
        thread.start()

@webhook_ns.route('')
class WebhookList(Resource):
    @webhook_ns.doc('list_webhooks')
    @webhook_ns.marshal_list_with(webhook_response)
    def get(self):
        """List all registered webhooks"""
        return list(webhooks.values())
    
    @webhook_ns.doc('create_webhook')
    @webhook_ns.expect(webhook_model)
    @webhook_ns.marshal_with(webhook_response, code=201)
    def post(self):
        """Register a new webhook endpoint"""
        data = request.json
        
        if not data or 'url' not in data:
            api.abort(400, "URL is required")
            
        webhook_id = str(uuid.uuid4())
        webhook = {
            'id': webhook_id,
            'url': data['url'],
            'description': data.get('description', ''),
            'created_at': time.time(),
            'active': True
        }
        
        webhooks[webhook_id] = webhook
        return webhook, 201

@webhook_ns.route('/<webhook_id>')
@webhook_ns.param('webhook_id', 'The webhook identifier')
@webhook_ns.response(404, 'Webhook not found')
class Webhook(Resource):
    @webhook_ns.doc('get_webhook')
    @webhook_ns.marshal_with(webhook_response)
    def get(self, webhook_id):
        """Get webhook details"""
        if webhook_id not in webhooks:
            api.abort(404, "Webhook not found")
            
        return webhooks[webhook_id]
    
    @webhook_ns.doc('delete_webhook')
    @webhook_ns.response(204, 'Webhook deleted')
    def delete(self, webhook_id):
        """Delete a webhook"""
        if webhook_id not in webhooks:
            api.abort(404, "Webhook not found")
            
        del webhooks[webhook_id]
        return '', 204
    
    @webhook_ns.doc('update_webhook')
    @webhook_ns.expect(webhook_model)
    @webhook_ns.marshal_with(webhook_response)
    def patch(self, webhook_id):
        """Update webhook details"""
        if webhook_id not in webhooks:
            api.abort(404, "Webhook not found")
            
        data = request.json
        webhook = webhooks[webhook_id]
        
        if 'url' in data:
            webhook['url'] = data['url']
        if 'description' in data:
            webhook['description'] = data['description']
        if 'active' in data:
            webhook['active'] = bool(data['active'])
            
        return webhook

@trigger_ns.route('/trigger')
class TriggerWebhook(Resource):
    @trigger_ns.doc('trigger_webhooks')
    @trigger_ns.expect(trigger_model)
    @trigger_ns.param('webhook_id', 'Specific webhook ID to trigger (optional)')
    def post(self):
        """Manually trigger webhooks with custom payload"""
        data = request.json
        
        if not data:
            api.abort(400, "Payload is required")
            
        webhook_id = request.args.get('webhook_id')
        
        if webhook_id and webhook_id not in webhooks:
            api.abort(404, "Webhook not found")
            
        trigger_webhooks(data, webhook_id)
        return {'success': True, 'message': 'Webhooks triggered'}

@event_ns.route('')
class EventList(Resource):
    @event_ns.doc('list_events')
    @event_ns.param('webhook_id', 'Filter by webhook ID (optional)')
    @event_ns.param('status', 'Filter by status: pending, success, failed (optional)')
    @event_ns.param('limit', 'Limit number of results (default: 100, max: 1000)')
    @event_ns.marshal_list_with(event_model)
    def get(self):
        """List webhook events with optional filtering"""
        webhook_id = request.args.get('webhook_id')
        status = request.args.get('status')
        
        filtered_events = event_log
        
        if webhook_id:
            filtered_events = [e for e in filtered_events if e['webhook_id'] == webhook_id]
        if status:
            filtered_events = [e for e in filtered_events if e['status'] == status]
            
        # Sort by timestamp descending (newest first)
        filtered_events = sorted(filtered_events, key=lambda e: e['timestamp'], reverse=True)
        
        # Limit results
        limit = min(int(request.args.get('limit', 100)), 1000)
        filtered_events = filtered_events[:limit]
        
        return filtered_events

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True) 