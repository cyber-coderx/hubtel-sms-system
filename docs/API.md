# Hubtel SMS API Reference

Complete API documentation for the SMS system.

## Base URL

```
http://localhost:3000 (development)
https://your-domain.com (production)
```

## Rate Limiting

All endpoints are limited to **5 requests per minute** per IP.

---

## Endpoints

### 1. Send Single SMS

**Endpoint:** `POST /api/sms/send`

**Request:**
```json
{
  "to": "+233123456789",
  "from": "MYAPP",
  "content": "Hello World"
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| to | string | ✅ | Recipient phone (E164 format) |
| from | string | ✅ | Sender ID (max 11 chars) |
| content | string | ✅ | Message content (max 160 chars) |

**Response (Success):**
```json
{
  "success": true,
  "messageId": "c9d729d6-a802-425e-9862-9fe4c0f09d63",
  "status": "Sent",
  "rate": 0.03,
  "message": "SMS sent successfully to +233123456789"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid phone number. Use E164 format: +233123456789"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+233123456789",
    "from": "MYAPP",
    "content": "Hello World"
  }'
```

---

### 2. Send Bulk SMS

**Endpoint:** `POST /api/sms/bulk`

**Request:**
```json
{
  "recipients": [
    "+233123456789",
    "+233987654321",
    "+233555555555"
  ],
  "from": "MYAPP",
  "content": "Bulk message"
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| recipients | array | ✅ | Array of phone numbers (E164) |
| from | string | ✅ | Sender ID (max 11 chars) |
| content | string | ✅ | Message content (max 160 chars) |

**Response:**
```json
{
  "success": true,
  "sent": 3,
  "failed": 0,
  "total": 3,
  "messages": [
    {
      "to": "+233123456789",
      "success": true,
      "messageId": "...",
      "status": "Sent"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/sms/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+233123456789", "+233987654321"],
    "from": "MYAPP",
    "content": "Bulk message"
  }'
```

---

### 3. Check Message Status

**Endpoint:** `GET /api/sms/status/:messageId`

**Response:**
```json
{
  "success": true,
  "messageId": "c9d729d6-a802-425e-9862-9fe4c0f09d63",
  "status": "Delivered",
  "delivered": true,
  "content": "Hello World",
  "to": "+233123456789",
  "from": "MYAPP",
  "sentTime": "2025-04-15T14:08:56.2711269Z",
  "deliveredTime": "2025-04-15T14:09:03",
  "cost": 0.03
}
```

**Status Values:**
- **Delivered** - Message delivered to recipient
- **Sent** - Message sent, pending delivery
- **Pending** - Message queued
- **Failed** - Delivery failed
- **Blacklisted** - Number blacklisted
- **Invalid** - Invalid recipient number

**cURL Example:**
```bash
curl http://localhost:3000/api/sms/status/c9d729d6-a802-425e-9862-9fe4c0f09d63
```

---

### 4. Get Message History

**Endpoint:** `GET /api/sms/history`

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| limit | number | 50 | Records per page (max 500) |
| offset | number | 0 | Starting record |

**Response:**
```json
{
  "success": true,
  "total": 150,
  "limit": 50,
  "offset": 0,
  "messages": [
    {
      "id": "msg-123",
      "to": "+233123456789",
      "from": "MYAPP",
      "content": "Hello World",
      "status": "Delivered",
      "rate": 0.03,
      "timestamp": "2025-04-15T14:08:56Z",
      "statusCode": 0
    }
  ]
}
```

**cURL Example:**
```bash
curl "http://localhost:3000/api/sms/history?limit=50&offset=0"
```

---

### 5. Get Statistics

**Endpoint:** `GET /api/sms/stats`

**Response:**
```json
{
  "success": true,
  "total": 100,
  "sent": 95,
  "delivered": 92,
  "failed": 3,
  "deliveryRate": "92.00%",
  "totalCost": "3.00"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/sms/stats
```

---

### 6. Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-04-15T14:10:00Z",
  "environment": "production",
  "service": "Hubtel SMS System"
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Invalid phone number. Use E164 format: +233123456789"
}
```

### 429 - Rate Limited
```json
{
  "success": false,
  "error": "Rate limit exceeded. Max 5 requests per minute"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Status Codes Reference

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 400 | Bad request (validation error) |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Integration Examples

### JavaScript/Node.js

```javascript
// Send SMS
async function sendSMS() {
  const response = await fetch('/api/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: '+233123456789',
      from: 'MYAPP',
      content: 'Hello World'
    })
  });
  
  const data = await response.json();
  console.log(data);
}

// Check status
async function checkStatus(messageId) {
  const response = await fetch(`/api/sms/status/${messageId}`);
  const data = await response.json();
  console.log(data.status); // Delivered, Sent, Failed, etc.
}
```

### Python

```python
import requests

# Send SMS
response = requests.post('http://localhost:3000/api/sms/send', json={
    'to': '+233123456789',
    'from': 'MYAPP',
    'content': 'Hello World'
})

data = response.json()
print(data['messageId'])

# Check status
status_response = requests.get(
    f'http://localhost:3000/api/sms/status/{data["messageId"]}'
)
print(status_response.json()['status'])
```

### cURL

```bash
# Send SMS
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"to":"+233123456789","from":"MYAPP","content":"Hello"}'

# Get history
curl http://localhost:3000/api/sms/history?limit=10

# Check status
curl http://localhost:3000/api/sms/status/MESSAGE_ID
```

---

## Best Practices

1. **Validate phone numbers** before sending
   - Use E164 format
   - Verify country codes

2. **Handle responses** properly
   - Check `success` flag
   - Handle error messages

3. **Monitor rate limits**
   - Max 5 requests/minute
   - Implement backoff strategy

4. **Keep messages concise**
   - Max 160 characters per SMS
   - Longer messages cost more

5. **Check delivery status**
   - Use status endpoint after sending
   - Implement retry logic for failures

---

## SMS Costs

- Ghana (MTN/Vodafone): $0.03 per SMS
- Nigeria: $0.02 per SMS
- Other networks: Varies

See Hubtel pricing for detailed rates.

---

## Support

- **Hubtel**: support@hubtel.com
- **API Issues**: GitHub Issues
- **Email**: contact@example.com

