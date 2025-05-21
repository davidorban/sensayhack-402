# TODO – Sensay x402 Integration

---

## ✅ Environment

* [x] Load API key, Org ID, Replica ID from `.env`
* [x] Create `.env.example` and `.env` files
* [x] Add README setup guide for local environment
* [ ] Dockerize backend proxy (optional)
* [ ] Enable deployment to Replit / Vercel / Fly.io (optional)

---

## ✅ Scaffolding

* [x] Express backend proxy with payment enforcement
* [x] HTML frontend with simple input + response flow
* [x] Add support for session tracking (userId, messageId)
* [x] Add logging (requests, payment proofs, errors)
* [ ] Replace in-memory receipt cache with Redis  ⏳ **NEXT TASK**
* [ ] Extract payment verification logic into utility module
* [ ] Modularize Sensay API call function

---

## 🛠 Backend Enhancements

* [ ] QR code rendering (e.g., Base or Lightning invoices)
* [ ] Support multiple price tiers or dynamic pricing (based on content size, priority, etc.)
* [x] Add JWT/session authentication for tracking users
* [x] Add GET `/status` endpoint to check payment + chat state
* [ ] Unit tests for payment enforcement logic
* [ ] Switch to Coinbase CDP SDK for header management
* [x] Graceful fallback handling on payment verification failure
* [ ] Rate limit unpaid retries (optional security feature)

---

## 🎨 Frontend Enhancements

* [x] Add loading spinner / disable button during fetch
* [x] Improve error messages for failed payments
* [x] Add user-friendly payment flow with clear instructions
* [x] Add system message styling and handling
* [x] Implement message count debugging

---

## 🚀 Recently Completed

* Fixed payment verification cache issue (Set → Map)
* Added debug endpoint for message count verification
* Improved error handling in payment flow
* Added system message styling and handling
* Implemented proper CSP headers for security
* Enhanced payment verification with proper error handling
* Added request/response timing and improved error messages
* Implemented graceful shutdown handling
* Fixed all linting issues and improved code organization
* [ ] Auto-resend message after payment completion (polling or retry)
* [ ] Add QR code visualization if available
* [ ] Basic mobile-friendly styling or Tailwind integration
* [ ] LocalStorage or session-based storage of Pay-Proof
* [ ] Add copy-to-clipboard button for payment link
* [ ] Visual confirmation of paid state

---

## 🔄 Integration Testing

* [ ] Simulate expired/invalid proof case
* [ ] Simulate successful payment + Sensay reply
* [ ] Confirm headers passed securely to Sensay API
* [ ] Confirm caching logic avoids double payment
* [ ] Add test script with mocked Coinbase x402 responses
* [ ] Handle Coinbase sandbox vs. production mode

---

## 🧾 Final Packaging

* [ ] Add full README.md
* [ ] Add license file
* [ ] Bundle with Hackathon submission instructions
* [ ] Include architecture diagram or request flow chart
* [ ] Prepare deployment-ready version with API secrets excluded
