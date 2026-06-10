/**
 * SMS API Routes
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// ============================================================================
// CONFIGURATION & STORAGE
// ============================================================================

const config = {
  quickSendUrl: 'https://smsc.hubtel.com/v1/messages/send',
  regularSendUrl: 'https://smsc.hubtel.com/v1/messages/send',
  statusUrl: 'https://smsc.hubtel.com/v1/messages',
  clientId: process.env.HUBTEL_CLIENT_ID,
  clientSecret: process.env.HUBTEL_CLIENT_SECRET,
  senderId: process.env.HUBTEL_SENDER_ID || 'MyApp',
  rateLimit: 5,
  windowMs: 60000
};

// In-memory storage for message history
const messageHistory = [];
const rateLimitTracker = new Map();

// ============================================================================
// UTILITIES
// ============================================================================

function validatePhoneNumber(phoneNumber) {
  return /^\+\d{1,3}\d{4,14}$/.test(phoneNumber);
}

function validateSenderId(senderId) {
  return /^[a-zA-Z0-9]{1,11}$/.test(senderId);
}

function checkRateLimit(key) {
  const now = Date.now();
  if (!rateLimitTracker.has(key)) {
    rateLimitTracker.set(key, []);
  }

  let requests = rateLimitTracker.get(key);
  requests = requests.filter(time => now - time < config.windowMs);
  
  if (requests.length >= config.rateLimit) {
    return false;
  }

  requests.push(now);
  rateLimitTracker.set(key, requests);
  return true;
}

/**
 * Send SMS via Quick Send (GET) or Regular Send (POST)
 */
async function sendSmsViaAPI(phoneNumber, from, content, useQuickSend = false) {
  try {
    let response;

    if (useQuickSend) {
      // Quick Send via GET
      const params = {
        clientid: config.clientId,
        clientsecret: config.clientSecret,
        from: from,
        to: phoneNumber,
        content: content
      };

      const queryString = new URLSearchParams(params).toString();
      response = await axios.get(`${config.quickSendUrl}?${queryString}`, {
        timeout: 10000
      });
    } else {
      // Regular Send via POST
      const auth = Buffer.from(
        `${config.clientId}:${config.clientSecret}`
      ).toString('base64');

      response = await axios.post(
        config.regularSendUrl,
        {
          from: from,
          to: phoneNumber,
          content: content
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          timeout: 10000
        }
      );
    }

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('SMS API error:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      statusCode: error.response?.status
    };
  }
}

/**
 * Get message status from API
 */
async function getMessageStatus(messageId) {
  try {
    const auth = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString('base64');

    const response = await axios.get(
      `${config.statusUrl}/${messageId}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`
        },
        timeout: 10000
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Status check error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/sms/send
 * Send single SMS
 */
router.post('/send', async (req, res) => {
  try {
    const { to, from, content } = req.body;

    // Validation
    if (!to || !from || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, from, content'
      });
    }

    if (!validatePhoneNumber(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number. Use E164 format: +233123456789'
      });
    }

    if (!validateSenderId(from)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Sender ID. Max 11 alphanumeric characters'
      });
    }

    if (content.length > 160) {
      console.warn('Warning: Message > 160 chars may be charged as multiple SMS');
    }

    // Rate limiting
    if (!checkRateLimit('sms:send')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Max 5 requests per minute'
      });
    }

    // Send SMS
    const result = await sendSmsViaAPI(to, from, content, false);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send SMS',
        details: result.error
      });
    }

    const messageData = {
      id: result.data.messageId,
      to: to,
      from: from,
      content: content,
      status: 'Sent',
      rate: result.data.rate,
      timestamp: new Date(),
      statusCode: result.data.status
    };

    // Store in history
    messageHistory.push(messageData);

    console.log(`✅ SMS sent to ${to} (ID: ${result.data.messageId})`);

    res.json({
      success: true,
      messageId: result.data.messageId,
      status: 'Sent',
      rate: result.data.rate,
      message: `SMS sent successfully to ${to}`
    });

  } catch (error) {
    console.error('Error in /sms/send:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/sms/status/:messageId
 * Check SMS status
 */
router.get('/status/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        error: 'Message ID is required'
      });
    }

    const result = await getMessageStatus(messageId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or error retrieving status'
      });
    }

    res.json({
      success: true,
      messageId: result.data.messageId,
      status: result.data.status,
      delivered: result.data.status === 'Delivered',
      content: result.data.content,
      to: result.data.to,
      from: result.data.from,
      sentTime: result.data.time,
      deliveredTime: result.data.updateTime,
      cost: result.data.rate
    });

  } catch (error) {
    console.error('Error in /sms/status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/sms/bulk
 * Send bulk SMS
 */
router.post('/bulk', async (req, res) => {
  try {
    const { recipients, from, content } = req.body;

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipients must be a non-empty array'
      });
    }

    if (!from || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: from, content'
      });
    }

    // Validate all recipients
    const invalidRecipients = recipients.filter(r => !validatePhoneNumber(r));
    if (invalidRecipients.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid phone numbers: ${invalidRecipients.join(', ')}`
      });
    }

    // Rate limiting per recipient
    if (!checkRateLimit(`sms:bulk:${recipients.length}`)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded'
      });
    }

    // Send to all recipients
    const results = await Promise.all(
      recipients.map(to => sendSmsViaAPI(to, from, content, false))
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const messages = results.map((result, index) => ({
      to: recipients[index],
      success: result.success,
      messageId: result.data?.messageId,
      status: result.data?.status || 'Failed',
      error: result.error
    }));

    console.log(`✅ Bulk SMS: ${successful.length}/${recipients.length} sent`);

    res.json({
      success: true,
      sent: successful.length,
      failed: failed.length,
      total: recipients.length,
      messages: messages
    });

  } catch (error) {
    console.error('Error in /sms/bulk:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/sms/history
 * Get message history
 */
router.get('/history', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const offset = parseInt(req.query.offset) || 0;

    const total = messageHistory.length;
    const messages = messageHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);

    res.json({
      success: true,
      total: total,
      limit: limit,
      offset: offset,
      messages: messages
    });

  } catch (error) {
    console.error('Error in /sms/history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/sms/stats
 * Get SMS statistics
 */
router.get('/stats', (req, res) => {
  try {
    const total = messageHistory.length;
    const sent = messageHistory.filter(m => m.status === 'Sent').length;
    const delivered = messageHistory.filter(m => m.status === 'Delivered').length;
    const failed = messageHistory.filter(m => m.status === 'Failed').length;
    const totalCost = messageHistory.reduce((sum, m) => sum + (m.rate || 0), 0);

    res.json({
      success: true,
      total: total,
      sent: sent,
      delivered: delivered,
      failed: failed,
      deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(2) + '%' : '0%',
      totalCost: totalCost.toFixed(2)
    });

  } catch (error) {
    console.error('Error in /sms/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
