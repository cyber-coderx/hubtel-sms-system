# Hubtel SMS System - Quick Start

Get up and running with the SMS system in 5 minutes!

## Prerequisites

- Node.js 14+ and npm
- Hubtel account with SMS API access
- Client ID and Client Secret

## Quick Setup

### 1. Extract
```bash
unzip hubtel-sms-system.zip
cd hubtel-sms-system
```

### 2. Install
```bash
npm install
```

### 3. Configure
```bash
cp .env.example .env
```

Edit `.env`:
```env
HUBTEL_CLIENT_ID=your_client_id
HUBTEL_CLIENT_SECRET=your_client_secret
HUBTEL_SENDER_ID=MYAPP
PORT=3000
NODE_ENV=development
```

### 4. Run
```bash
npm start
```

### 5. Use
Open http://localhost:3000 in your browser

---

## Features

✅ **Send Single SMS** - Send to one recipient
✅ **Bulk SMS** - Send to multiple recipients
✅ **Check Status** - Query message delivery status
✅ **History** - View all sent messages
✅ **Statistics** - Track SMS statistics
✅ **Web Dashboard** - Easy-to-use interface

---

## API Endpoints

**Send SMS:**
```bash
POST /api/sms/send
Body: { "to": "+233...", "from": "MYAPP", "content": "..." }
```

**Check Status:**
```bash
GET /api/sms/status/:messageId
```

**Bulk Send:**
```bash
POST /api/sms/bulk
Body: { "recipients": [...], "from": "...", "content": "..." }
```

**History:**
```bash
GET /api/sms/history
```

**Statistics:**
```bash
GET /api/sms/stats
```

---

## Phone Number Format

Use **E164 international format**:
```
+[country code][number]
```

Examples:
- Ghana: `+233123456789`
- Nigeria: `+2341234567890`
- Kenya: `+254712345678`

---

## Sender ID

- Max **11 alphanumeric** characters
- Must be **approved by Hubtel**
- Email support@hubtel.com for approval

---

## Troubleshooting

**SMS not sending?**
- Check Client ID and Secret
- Verify Sender ID is approved
- Check phone number format

**Invalid Sender ID error?**
- Max 11 characters
- Only letters and numbers
- Wait for Hubtel approval

**Rate limited?**
- Max 5 requests per minute
- Wait 60 seconds, try again

---

## Next Steps

1. Read `README.md` for full documentation
2. Check `docs/API.md` for API reference
3. Deploy to production when ready

---

**That's it! You're ready to send SMS! 🎉**
