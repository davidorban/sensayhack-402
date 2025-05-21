# Sensay x402 Paywall Demo

A proof-of-concept implementation of the [Coinbase x402 protocol](https://docs.cdp.coinbase.com/x402/overview) for paywalling AI chat interactions using Sensay's API.

## 🚀 Overview

This project demonstrates how to integrate the Coinbase x402 protocol with the Sensay API to require cryptocurrency payment before an AI Replica responds to user messages. It serves as a reference implementation for developers looking to monetize AI chat interfaces.

## 💡 How It Works

### Payment Flow

1. **Initial Request**:
   - User sends a message through the frontend
   - Backend checks for a valid payment proof
   - If no proof exists, returns a 402 Payment Required response with payment details

2. **Payment Processing**:
   - Frontend receives 402 response and displays payment instructions
   - User is redirected to a payment page (mock implementation included)
   - After payment, the payment processor verifies the transaction

3. **Verification**:
   - Backend verifies the payment proof with the payment processor
   - Valid proofs are cached for future requests
   - Invalid or expired proofs are rejected

4. **AI Interaction**:
   - Once payment is verified, the message is forwarded to Sensay's API
   - The AI's response is returned to the user

## 🛠️ Technical Implementation

### Backend (`backend-proxy.js`)

- **Express.js** server handling the x402 protocol
- **In-memory storage** for verified payments (replace with Redis in production)
- **Mock payment verification** endpoint for testing
- **Sensay API integration** for AI chat completions

### Frontend (`frontend.html`)
- Simple HTML/CSS/JS interface
- Handles payment flow and error states
- Manages payment verification tokens

### Mock Payment Page (`mock-pay.html`)
- Simulates a payment processor
- Provides a testing interface for the payment flow
- Verifies payments with the backend

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Sensay API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sensayhack-402.git
   cd sensayhack-402
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`

4. Start the server:
   ```bash
   node backend-proxy.js
   ```

5. Open `http://localhost:3000/frontend.html` in your browser

## 🔄 Payment Flow Details

### 1. Initial Request
```http
POST /chat
Content-Type: application/json

{"message": "Hello, how are you?"}
```

### 2. Payment Required Response (402)
```http
HTTP/1.1 402 Payment Required
Pay: http://localhost:3000/mock-pay.html?paymentId=pay_abc123
Pay-Token: pay_abc123
Pay-Params: {"amount":"1000","asset":"USDC","chain":"base","callback":"http://localhost:3000/mock-verify-payment"}

{
  "message": "Payment required before accessing Sensay.",
  "paymentId": "pay_abc123",
  "paymentUrl": "http://localhost:3000/mock-pay.html?paymentId=pay_abc123"
}
```

### 3. Payment Verification
After payment, the frontend includes the payment proof in subsequent requests:
```http
POST /chat
Content-Type: application/json
Pay-Proof: pay_abc123

{"message": "Hello, how are you?"}
```

## 🔒 Security Considerations

- **Production Use**: Replace the in-memory storage with a persistent database (e.g., Redis)
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **HTTPS**: Always use HTTPS in production
- **Payment Verification**: In production, verify payments with the payment processor's API

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙌 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue in the repository.
