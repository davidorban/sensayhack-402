# Windsurf Tool Stack for Sensay x402 Integration

This file outlines the complete tool stack configuration to support development of the Coinbase x402 + Sensay integration demo in the Windsurf agentic environment.

---

## 🧠 Core Services

### 1. **Sensay API**

* Base URL: `https://api.sensay.io/v1/`
* Endpoint Used: `POST /experimental/replicas/{replicaUUID}/chat/completions`
* Auth Headers:

  * `X-API-KEY`
  * `X-ORGANIZATION-SECRET`

### 2. **Coinbase x402 Protocol**

* x402 Docs: [https://docs.cdp.coinbase.com/x402](https://docs.cdp.coinbase.com/x402)
* Required Headers:

  * `Pay`
  * `Pay-Proof`
* Verification Endpoint:

  * `GET https://api.cdp.coinbase.com/x402/verify?proof=...`

---

## 🧰 Windsurf-Integrated Tools

| Tool                 | Purpose                            | Integration                          |
| -------------------- | ---------------------------------- | ------------------------------------ |
| `fetch`              | HTTP calls (to Sensay + Coinbase)  | Global, native in Windsurf           |
| `express`            | REST API backend                   | Used to create `/chat` endpoint      |
| `dotenv`             | Environment variable loader        | Loads API keys from `.env`           |
| `axios`              | External HTTP client               | Used for proxying and external calls |
| `crypto`             | Secure token generation (optional) | Node.js standard library             |
| `qrcode`             | QR code generator                  | Optional for rendering Pay URLs      |
| `redis`              | Receipt cache (optional)           | Replace in-memory store              |
| `chalk` or `winston` | Console logging                    | Optional for dev debug               |

---

## 🧪 Development Helpers

* **Nodemon**: Auto-reloads server on file changes
* **Postman** or **Insomnia**: For local API testing
* **VS Code `.env` plugin**: Helps manage secrets during dev

---

## 📦 Deployment (Optional)

| Platform | Notes                                            |
| -------- | ------------------------------------------------ |
| Replit   | Great for quick demos with UI + server           |
| Vercel   | Needs separate backend function for API proxy    |
| Fly.io   | Full backend support, ideal for quick deployment |

---

## 🔐 Environment Variables (`.env`)

```env
SENSAY_API_KEY=your_sensay_key
SENSAY_ORG_ID=your_org_id
SENSAY_REPLICA_ID=your_replica_uuid
```

Add to `.gitignore`:

```
.env
```

