# TODO – Sensay x402 Integration

---

## ✅ Environment

* [x] Load API key, Org ID, Replica ID from `.env`
* [ ] Create `.env.example` and `.env` files
* [ ] Add README setup guide for local environment
* [ ] Dockerize backend proxy (optional)
* [ ] Enable deployment to Replit / Vercel / Fly.io (optional)

---

## ✅ Scaffolding

* [x] Express backend proxy with payment enforcement
* [x] HTML frontend with simple input + response flow
* [ ] Add support for session tracking (userId, messageId)
* [ ] Add logging (requests, payment proofs, errors)
* [ ] Replace in-memory receipt cache with Redis
* [ ] Extract payment verification logic into utility module
* [ ] Modularize Sensay API call function

---

## 🛠 Backend Enhancements

* [ ] QR code rendering (e.g., Base or Lightning invoices)
* [ ] Support multiple price tiers or dynamic pricing (based on content size, priority, etc.)
* [ ] Add JWT or token authentication for tracking users
* [ ] Add GET `/status` endpoint to check payment + chat state
* [ ] Unit tests for payment enforcement logic
* [ ] Switch to Coinbase CDP SDK for header management
* [ ] Graceful fallback handling on payment verification failure
* [ ] Rate limit unpaid retries (optional security feature)

---

## 🎨 Frontend Enhancements

* [ ] Add loading spinner / disable button during fetch
* [ ] Improve error messages for failed payments
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
