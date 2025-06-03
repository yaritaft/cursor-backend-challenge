import os
import json
import uuid
import time
import threading
import requests
from flask import Flask, request, jsonify
from typing import Dict, List, Optional, Any

app = Flask(__name__)

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

@app.route('/webhooks', methods=['POST'])
def register_webhook():
    """Register a new webhook endpoint"""
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
        
    webhook_id = str(uuid.uuid4())
    webhook = {
        'id': webhook_id,
        'url': data['url'],
        'description': data.get('description', ''),
        'created_at': time.time(),
        'active': True
    }
    
    webhooks[webhook_id] = webhook
    return jsonify(webhook), 201

@app.route('/webhooks/<webhook_id>', methods=['GET'])
def get_webhook(webhook_id):
    """Get webhook details"""
    if webhook_id not in webhooks:
        return jsonify({'error': 'Webhook not found'}), 404
        
    return jsonify(webhooks[webhook_id])

@app.route('/webhooks', methods=['GET'])
def list_webhooks():
    """List all registered webhooks"""
    return jsonify(list(webhooks.values()))

@app.route('/webhooks/<webhook_id>', methods=['DELETE'])
def delete_webhook(webhook_id):
    """Delete a webhook"""
    if webhook_id not in webhooks:
        return jsonify({'error': 'Webhook not found'}), 404
        
    del webhooks[webhook_id]
    return jsonify({'success': True})

@app.route('/webhooks/<webhook_id>', methods=['PATCH'])
def update_webhook(webhook_id):
    """Update webhook details"""
    if webhook_id not in webhooks:
        return jsonify({'error': 'Webhook not found'}), 404
        
    data = request.json
    webhook = webhooks[webhook_id]
    
    if 'url' in data:
        webhook['url'] = data['url']
    if 'description' in data:
        webhook['description'] = data['description']
    if 'active' in data:
        webhook['active'] = bool(data['active'])
        
    return jsonify(webhook)

@app.route('/trigger', methods=['POST'])
def trigger():
    """Manually trigger webhooks with custom payload"""
    data = request.json
    
    if not data:
        return jsonify({'error': 'Payload is required'}), 400
        
    webhook_id = request.args.get('webhook_id')
    
    if webhook_id and webhook_id not in webhooks:
        return jsonify({'error': 'Webhook not found'}), 404
        
    trigger_webhooks(data, webhook_id)
    return jsonify({'success': True, 'message': 'Webhooks triggered'})

@app.route('/events', methods=['GET'])
def list_events():
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
    
    return jsonify(filtered_events)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 