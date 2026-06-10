# Hubtel SMS System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)

A complete, production-ready SMS messaging system using Hubtel's SMS API. Send, track, and manage SMS messages with ease.

## ✨ Features

- 📱 **SMS Sending** - Send SMS via two methods (Quick Send GET, Regular Send POST)
- 📊 **Message Tracking** - Query message status and delivery receipts
- 🔒 **Security** - Authorization headers, rate limiting, input validation
- 🎨 **Dashboard** - Web interface to send and manage messages
- 📈 **History** - Track all sent messages with status
- 🔄 **Bulk SMS** - Send to multiple recipients
- ⚡ **Fast Delivery** - Optimized for speed
- 📡 **Status Codes** - Comprehensive delivery status tracking
- 🧪 **Production Ready** - Error handling, logging, best practices
- 📚 **Well Documented** - Complete guides and API reference

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm
- Hubtel merchant account with SMS API access
- Hubtel Client ID and Client Secret

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hubtel-sms-system.git
cd hubtel-sms-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your Hubtel credentials:
```env
HUBTEL_CLIENT_ID=your_client_id
HUBTEL_CLIENT_SECRET=your_client_secret
HUBTEL_SENDER_ID=MYAPP
PORT=3000
NODE_ENV=development
```

4. **Start the server**
```bash
npm start
```

The server will run on `http://localhost:3000`

## 📖 Usage

### Web Dashboard

Open http://localhost:3000 in your browser to access the SMS dashboard.

Features:
- Send SMS to single or multiple recipients
- View message history
- Check delivery status
- Track message costs

### API Integration

#### Send SMS (Quick Send)
```bash
curl "https://smsc.hubtel.com/v1/messages/send?clientid=YOUR_ID&clientsecret=YOUR_SECRET&from=MYAPP&to=%2B233123456789&content=Hello"
```

#### Send SMS (Regular Send)
```bash
POST /api/sms/send
Content-Type: application/json

{
  "to": "+233123456789",
  "from": "MYAPP",
  "content": "Hello World"
}
```

#### Check Message Status
```bash
GET /api/sms/status/:messageId
```

#### Bulk Send
```bash
POST /api/sms/bulk
Content-Type: application/json

{
  "recipients": ["+233123456789", "+233987654321"],
  "from": "MYAPP",
  "content": "Bulk message"
}
```

## 📋 API Endpoints

### Send SMS
- **URL:** `POST /api/sms/send`
- **Body:** `{ to, from, content }`
- **Response:** `{ success, messageId, status, rate }`

### Check Status
- **URL:** `GET /api/sms/status/:messageId`
- **Response:** `{ status, delivered, failed, pending }`

### Bulk Send
- **URL:** `POST /api/sms/bulk`
- **Body:** `{ recipients[], from, content }`
- **Response:** `{ success, messages[] }`

### Message History
- **URL:** `GET /api/sms/history`
- **Query:** `?limit=50&offset=0`
- **Response:** `{ messages[], total }`

## 🏗️ Project Structure

```
hubtel-sms-system/
├── src/
│   ├── routes/
│   │   ├── sms.js              # SMS API routes
│   │   └── health.js           # Health check
│   ├── utils/
│   │   ├── hubtel-client.js    # Hubtel API client
│   │   ├── validation.js       # Input validation
│   │   └── rate-limiter.js     # Rate limiting
│   └── index.js                # Main app
├── public/
│   ├── index.html              # SMS dashboard
│   ├── dashboard.js            # Frontend logic
│   └── styles.css              # Styling
├── .env.example                # Environment template
├── package.json                # Dependencies
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## 📊 SMS Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| Delivered | Successfully delivered | None - Complete |
| Sent | Forwarded to network | Wait for delivery |
| Pending | In queue | Wait for processing |
| Failed | Delivery failed | Retry or check number |
| Blacklisted | Number blacklisted | Use different number |
| Undeliverable | Could not deliver | Verify number format |
| Invalid Destination | Bad phone number | Check E164 format |
| Invalid Source | Bad sender ID | Max 11 characters |

## 🔐 Security Features

- ✅ **Rate Limiting** - Max 5 requests per minute (Hubtel limit)
- ✅ **Input Validation** - Phone number format validation
- ✅ **Authorization** - API key authentication
- ✅ **HTTPS Only** - All production traffic encrypted
- ✅ **Credentials Protection** - Environment variables
- ✅ **Error Handling** - Comprehensive error messages

## 🚢 Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set HUBTEL_CLIENT_ID=your_id
heroku config:set HUBTEL_CLIENT_SECRET=your_secret
git push heroku main
```

### Docker
```bash
docker build -t hubtel-sms .
docker run -p 3000:3000 \
  -e HUBTEL_CLIENT_ID=your_id \
  -e HUBTEL_CLIENT_SECRET=your_secret \
  hubtel-sms
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test API
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"to":"+233123456789","from":"TEST","content":"Hello"}'
```

## 📚 Documentation

- `README.md` - This file
- `docs/API.md` - Complete API reference
- `docs/QUICKSTART.md` - 5-minute setup guide
- `docs/IMPLEMENTATION.md` - Integration examples

## 🆘 Troubleshooting

### SMS Not Sent
1. Check Client ID and Secret
2. Verify Sender ID is approved
3. Check phone number format (E164)
4. Verify account has SMS credits

### Invalid Destination
- Use E164 format: +[country code][number]
- Example: +233123456789

### Rate Limit Exceeded
- Maximum 5 requests per minute
- Wait 60 seconds before retrying

## 📞 Support

- **Hubtel Support:** support@hubtel.com
- **Issues:** GitHub Issues
- **Email:** contact@example.com

## 📈 Roadmap

- [ ] Message templates
- [ ] Scheduled messages
- [ ] Contact groups
- [ ] Analytics dashboard
- [ ] Webhook callbacks
- [ ] Two-way SMS
- [ ] WhatsApp integration
- [ ] Advanced reporting

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Hubtel for SMS API
- Express.js community
- Node.js developers

---

**Made with ❤️ for developers**

Last updated: June 2026
"hubtel-otp-sytem" 
