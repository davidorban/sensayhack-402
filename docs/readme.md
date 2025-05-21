Sensay x402 Paywall Demo

This is a hackathon project demonstrating how to integrate the Coinbase x402 protocol with the Sensay API to require crypto payment before an AI Replica responds.

⸻

📂 Project Structure

.
├── backend-proxy.js       # Express server handling x402 + Sensay proxy
├── frontend.html          # Simple frontend to send chat requests
├── .env                   # Environment configuration (secrets)
├── .env.example           # Public example of env structure
├── todo.md                # Development checklist
├── tool-stack.md          # Tooling used in this project
├── 402-prd.md             # Product Requirements Document
└── README.md              # This file


⸻

✅ Getting Started

1. Clone and Install

git clone https://github.com/davidorban/sensayhack-402.git
cd sensayhack-402
npm install

2. Create .env

Copy from .env.example:

SENSAY_API_KEY=your_api_key
SENSAY_ORG_ID=your_org_id
SENSAY_REPLICA_ID=your_replica_uuid
SENSAY_USER_ID=test-user-1
X402_VERIFICATION_URL=https://api.cdp.coinbase.com/x402/verify
X402_PAYMENT_AMOUNT=1000
X402_ASSET=USDC
X402_CHAIN=base

3. Start the Server

node backend-proxy.js

The server will run at http://localhost:3000

⸻

🧪 Testing
	•	Open frontend.html in your browser
	•	Type a message and click Send
	•	If no payment was made, you’ll get a 402 response with a Pay: header
	•	Once payment is simulated (or Pay-Proof is added), the proxy will forward to Sensay and return the Replica response

⸻

🛠 Dev Tools

Install required dependencies:

npm install express dotenv axios

Optional:

npm install qrcode redis winston


⸻

🔁 Reset Notes
	•	Make sure backend-proxy.js is saved before running Windsurf
	•	Windsurf expects backend-proxy.js as the entrypoint

⸻

🧩 TODO
	•	Implement full x402 verification
	•	Replace in-memory proof store with Redis
	•	Add UI payment QR generator
	•	Automatically retry message after payment

⸻

🚀 Publishing to GitHub

1. Commit and Push

git init
git remote add origin https://github.com/davidorban/sensayhack-402.git
git checkout -b main
git add .
git commit -m "Initial commit for Sensay x402 demo"
git push -u origin main

2. GitHub Pages (Frontend Hosting)
	•	Go to Repo Settings > Pages
	•	Select:
	•	Branch: main
	•	Folder: / (root)
	•	The frontend will be hosted at:
	•	https://davidorban.github.io/sensayhack-402/

3. GitHub Actions (CI Workflow)

Create .github/workflows/node.yml:

name: Node.js CI
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node backend-proxy.js --check-only

4. Automate with Windsurf

Use this agent goal:

“Commit all files to GitHub repo https://github.com/davidorban/sensayhack-402. Configure GitHub Pages to serve frontend.html. Push initial commit and create a GitHub Actions workflow for Node.js backend.”

⸻

🤝 Credits

Built for the Sensay Hackathon by David Orban.