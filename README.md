# Sensay x402 Paywall Demo

A proof-of-concept implementation of the [Coinbase x402 protocol](https://docs.cdp.coinbase.com/x402/overview) for paywalling AI chat interactions using Sensay's API.

## 🚀 Overview

This project demonstrates how to integrate the Coinbase x402 protocol with the Sensay API to require cryptocurrency payment before an AI Replica responds to user messages. The first two messages are free, and payment is required starting from the third message. This serves as a reference implementation for developers looking to monetize AI chat interfaces.

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

## 🛠️ Technical Architecture

### Backend Architecture

The backend follows a modular architecture designed with the following components:

#### Core Structure
- **app.js**: Main Express application setup with middleware and route registration
- **server.js**: Server entry point with graceful shutdown handling

#### Controllers
- **chat-controller.js**: Handles chat message processing, payment requirements, and API integration
- **payment-controller.js**: Manages payment processing, verification, and receipt generation
- **debug-controller.js**: Provides debugging endpoints for session and payment information

#### Services
- **sensay-service.js**: Integrates with Sensay's API for sending and receiving chat messages
- **payment-service.js**: Handles payment creation, verification, and status checking
- **session-store.js**: In-memory storage for sessions, pending payments, and payment receipts

#### Middleware
- **security.js**: Implements security headers and CSP configuration
- **session.js**: Manages user sessions and authentication
- **error-handler.js**: Global error handling middleware

#### Routes
- **api.js**: Routes for chat and message processing
- **payment.js**: Routes for payment processing and verification
- **debug.js**: Debug endpoints for monitoring system state

#### Utils
- **config.js**: Application configuration and environment variables
- **id-generator.js**: Utility for generating unique IDs
- **logger.js**: Logging utility for application events

### Frontend Architecture

The frontend follows a component-based architecture:

#### HTML Structure
- **index.html**: Main chat interface
- **payment.html**: Payment processing interface

#### CSS
- **styles.css**: All styling for the application

#### JavaScript Modules
- **app.js**: Main application initialization and event setup
- **chat.js**: Chat functionality and message handling
- **payment.js**: Payment processing and verification 
- **session.js**: Session management and user identification
- **utils.js**: Utility functions for the frontend

### Data Flow

1. User sends a message via the frontend interface
2. The message is sent to the backend API via the chat endpoint
3. Backend checks if payment is required based on message count
4. If payment is required:
   - A payment request is generated
   - A 402 Payment Required response is returned
   - Frontend displays payment UI and redirects to payment page
5. After payment:
   - Payment is verified by the payment service
   - Receipt is stored in the session store
   - Message is processed and sent to Sensay API
6. Response from Sensay API is returned to the frontend
7. Frontend displays the AI's response to the user

### Session Management

The application uses an in-memory session store that tracks:
- Active user sessions
- Pending payments
- Verified payment receipts

Each user session includes:
- Unique user ID
- Message count
- Payment history
- Last active timestamp

## 🔄 Payment Flow Details

### 1. Initial Request
```http
POST /api/chat
Content-Type: application/json

{"message": "Hello, how are you?"}
```

### 2. Payment Required Response (402)
```http
HTTP/1.1 402 Payment Required
Pay: http://localhost:3000/payment.html?paymentId=pay_abc123
Pay-Token: pay_abc123
Pay-Params: {"amount":"0.01","currency":"USD","callback":"http://localhost:3000/payment/verify"}

{
  "status": "payment_required",
  "error": "Payment required to process this message",
  "paymentId": "pay_abc123",
  "amount": 0.01,
  "currency": "USD",
  "paymentUrl": "/payment.html?paymentId=pay_abc123&userId=user123",
  "message": "Please complete the payment to continue chatting."
}
```

### 3. Payment Verification
After payment, the frontend includes the payment proof in subsequent requests:
```http
POST /api/chat
Content-Type: application/json
X-Session-ID: user123

{"message": "Hello, how are you?"}
```

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

3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   SESSION_SECRET=your-session-secret
   SENSAY_API_KEY=your-sensay-api-key
   SENSAY_ORG_ID=your-sensay-org-id
   SENSAY_REPLICA_ID=your-sensay-replica-id
   ```

4. Start the server:
   ```bash
   node src/backend/server.js
   ```

5. Open `http://localhost:3000` in your browser

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