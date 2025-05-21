// Basic Express.js proxy to enforce Coinbase x402 before accessing Sensay API

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for verified payments (use Redis in production)
const receiptCache = new Set();
const pendingPayments = new Map();

// Helper function to generate a payment ID
function generatePaymentId() {
  return `pay_${crypto.randomBytes(8).toString('hex')}`;
}

// Serve static files from the current directory
app.use(express.static(__dirname));
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pay-Proof, X-USER-ID');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Mock payment verification endpoint (in a real app, this would be Coinbase's endpoint)
app.post('/mock-verify-payment', (req, res) => {
  try {
    const { paymentId } = req.body;
    
    if (!paymentId) {
      console.error('No paymentId provided');
      return res.status(400).json({ 
        success: false,
        error: 'Payment ID is required' 
      });
    }
    
    console.log(`Verifying payment: ${paymentId}`);
    
    // Mark payment as verified
    receiptCache.add(paymentId);
    pendingPayments.delete(paymentId);
    
    console.log(`Payment verified: ${paymentId}`);
    
    res.json({ 
      success: true, 
      paymentId,
      timestamp: new Date().toISOString(),
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Error in mock-verify-payment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Endpoint to check payment status
app.get('/payment-status/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  const isPaid = receiptCache.has(paymentId);
  
  res.json({
    paymentId,
    paid: isPaid,
    timestamp: new Date().toISOString()
  });
});

// Load from env or config
const SENSAY_API_KEY = process.env.SENSAY_API_KEY;
const SENSAY_ORG_ID = process.env.SENSAY_ORG_ID;
const SENSAY_REPLICA_ID = process.env.SENSAY_REPLICA_ID;

// In-memory storage for verified payments (use Redis in production)
// receiptCache is already declared at the top of the file

app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const payProof = req.header('Pay-Proof');
  const userId = req.header('X-USER-ID') || 'default';

  // Step 1: Check payment proof cache
  if (!receiptCache.has(payProof)) {
    if (!payProof) {
      // Generate a new payment ID
      const paymentId = generatePaymentId();
      pendingPayments.set(paymentId, { userId, timestamp: Date.now() });
      
      // Mock payment URL (in a real app, this would be Coinbase's payment URL)
      const paymentUrl = `http://localhost:3000/mock-pay.html?paymentId=${encodeURIComponent(paymentId)}`;
      
      // Step 2: Respond with 402 + Pay header
      return res.status(402).set({
        'Pay': paymentUrl,
        'Pay-Token': paymentId,
        'Pay-Params': JSON.stringify({
          amount: '1000',
          asset: 'USDC',
          chain: 'base',
          callback: 'http://localhost:3000/mock-verify-payment'
        })
      }).json({ 
        message: 'Payment required before accessing Sensay.',
        paymentId,
        paymentUrl
      });
    }

    // Step 3: Validate payment proof with Coinbase CDP (simplified)
    try {
      const result = await axios.get(`https://api.cdp.coinbase.com/x402/verify?proof=${encodeURIComponent(payProof)}`);
      if (!result.data?.valid) {
        return res.status(402).json({ message: 'Invalid or expired payment proof.' });
      }
      receiptCache.add(payProof); // Cache on success
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Payment verification failed.' });
    }
  }

  // Step 4: Forward message to Sensay
  try {
    const response = await axios.post(`https://api.sensay.io/v1/experimental/replicas/${SENSAY_REPLICA_ID}/chat/completions`, {
      messages: [
        { role: 'user', content: message },
      ],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': SENSAY_API_KEY,
        'X-ORGANIZATION-SECRET': SENSAY_ORG_ID,
      },
    });

    return res.json({ reply: response.data.choices[0]?.message?.content || '[no reply]' });
  } catch (error) {
    console.error(error?.response?.data || error);
    return res.status(500).json({ message: 'Failed to get response from Sensay.' });
  }
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));