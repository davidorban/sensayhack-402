# Sensay x402 Chat Application

## Overview
This application demonstrates a modern internet-native approach to monetizing AI replicas using Coinbase's x402 payment protocol. It provides a seamless cryptocurrency payment system for AI chat interactions.

## Features

### Monetization for AI Replicas
The application offers a complete solution for AI replica creators to monetize their services:

1. **Home Page** (`index.html`) - Introduces the monetization approach and provides access to both test and live environments.
2. **Test Environment** (`test.html`) - A dedicated page for testing with mock responses and simulated payments.
3. **Live Environment** (`live.html`) - A production-ready page that processes real cryptocurrency payments.
4. **Payment Processing** (`payment.html`) - Handles the cryptocurrency payment flow using Coinbase's x402 protocol.

### Key Benefits
- Seamless integration with Coinbase x402 payment protocol
- Direct monetization opportunities for AI replica creators
- Frictionless cryptocurrency payments
- Clear separation between test and production environments
- Modern internet-native payment approach

## How to Use

1. Start by opening `index.html`
2. Choose between the Test or Live environment
3. In the Test environment, you can experiment without making real payments
4. In the Live environment, real cryptocurrency transactions will occur
5. Interact with the AI replica through the chat interface

## Technical Details

- The application uses a dedicated page approach for different environments
- Test environment (`test.html`) and Live environment (`live.html`) are completely separate pages
- The `page-mode.js` script automatically detects which page is being used and applies the appropriate settings
- No manual toggling is required - simply navigate to the appropriate page for your needs
- The test environment uses test API endpoints for development and testing
- The live environment uses production API endpoints for both AI responses and payments
- Coinbase x402 protocol handles the payment processing
- Browser cache control ensures users always get the latest version of the application

## Development

To run the application locally:

```bash
npx http-server /path/to/sensayhack-402/src/frontend -p 3000 --cors
```

Then open `http://localhost:3000` in your browser.
