🔐 x402 Integration – Live Coinbase Implementation Guide

This document outlines the steps to move your x402 payment enforcement logic from mock to production using Coinbase’s official protocol.

⸻

1. 🔍 x402 Protocol Basics

Coinbase x402 enforces payment before a response is returned by requiring:
	•	Pay header (HTTP 402): contains a payment URL or invoice
	•	Pay-Proof header (follow-up): contains the receipt

⸻

2. ✅ Coinbase Developer Setup
	•	Create a Coinbase Cloud developer account
	•	Set up a project in Coinbase CDP Console
	•	Generate an API key
	•	Choose your network:
	•	Testnet (for dev)
	•	Base mainnet (for production)

⸻

3. 🔁 Implement Production Payment Flow

✅ Implementation

On unpaid requests, return:

const paymentLink = await generateCoinbasePaymentUrl(userId, messageId);

res.status(402).set({
  'Pay': paymentLink
}).json({
  status: 'payment_required',
  message: 'Payment required to process this message',
  paymentUrl: paymentLink
});


⸻

4. 🔐 Create Real Payment Links

Use the Coinbase /v1/payments endpoint:

POST https://api.cdp.coinbase.com/v1/payments
Authorization: Bearer <your_api_key>
Content-Type: application/json

{
  "chain": "base",
  "asset": "usdc",
  "amount": "0.01",
  "metadata": {
    "user_id": "davidorban-hackathon",
    "message_id": "abc123"
  }
}

Store the invoice_id for later verification.

⸻

5. 🔍 Verify Proofs

Use the Coinbase x402 verify endpoint:

GET https://api.cdp.coinbase.com/x402/verify?proof=<pay-proof>

Response:

{
  "valid": true,
  "invoice_id": "abc123",
  "amount": "0.01",
  "asset": "usdc"
}

Only forward the chat request if valid: true.

⸻

6. 🧠 Cache Proofs and Prevent Reuse
	•	Use Redis or in-memory store to track pay-proof
	•	Tie to user ID or message ID
	•	Set expiration (e.g., 1 hour)
	•	Prevent duplicate use of the same proof

⸻

7. 💬 Frontend Integration
	•	Handle 402 response with Pay: header
	•	Display QR or link for payment
	•	Let user submit proof in follow-up call
	•	Retry /chat with Pay-Proof header

⸻

🔧 Optional Helpers

generateCoinbasePaymentUrl()

Wraps the /v1/payments call

verifyPayProof()

Wraps the x402 /verify call

⸻

🧾 Example .env Keys

COINBASE_API_KEY=your_coinbase_key
COINBASE_API_URL=https://api.cdp.coinbase.com
X402_ASSET=usdc
X402_CHAIN=base
X402_AMOUNT=0.01


⸻

✅ Summary

Implementing x402 fully with Coinbase will allow you to charge crypto payments before Sensay replies — turning your replica into a metered, monetized AI API.