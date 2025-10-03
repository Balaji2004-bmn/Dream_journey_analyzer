# Adaptive Dream Journey Analyzer — Demo

A lightweight, isolated demo that showcases upgrading a user to PRO via UPI QR and payment screenshot verification. No admin approval required. Uses a separate demo backend on port 4000 so it won’t interfere with your existing app.

## What’s Included
- Demo backend: `backend/demo-server.js` (Express + CORS + Multer)
- Static demo UI: `demo/index.html` (QR generation via QRCode.js)
- Auto-activation: Upload screenshot -> subscription becomes PRO
- In-memory storage: users/subscriptions in a runtime Map

## Prerequisites
- Node.js 18+

## Install (backend only)
The backend already has required dependencies (`express`, `cors`, `multer`) in `backend/package.json`.

```bash
# From project root
cd backend
npm install
```

## Run the demo backend (port 4000)
```bash
# From project root
cd backend
npm run demo
# or auto-reload
npm run demo:dev
```

You should see:
```
Demo backend running on http://localhost:4000
POST /upload-screenshot to auto-upgrade users to PRO
```

## Open the Demo UI
1. Open `demo/index.html` in your browser (double-click or drag-drop).
2. The page shows your current plan (FREE by default).
3. Click "Upgrade to PRO" → QR is generated with your UPI ID and demo price.
4. Scan & pay in your UPI app.
5. Upload the payment screenshot → you’ll get an alert and your plan becomes PRO.
6. Click "Generate Dream" to create a placeholder dream story.

## Configuration
- UPI ID is set to `6361698728@slc` in the front-end for this demo. You can change the `UPI_ID` constant in `demo/index.html` if needed.
- Demo price is `PRO_PRICE = 199` (INR).
- Transaction note format: `ADJ_<userId>_<timestamp>` for uniqueness.

## API Contract
- `POST http://localhost:4000/upload-screenshot`
  - Form fields: `userId`, `plan` ("PRO"), `amount` (number), `txnNote` (string)
  - File: `screenshot` (image)
  - Response: `{ message, userId, subscription, upload: { filename, url, ... } }`
- `GET http://localhost:4000/subscription/:userId` (optional helper)

## Uploads
Files are saved to `backend/uploads/` and served statically at `http://localhost:4000/uploads/<filename>`.

## Notes
- This is a demo-only flow that auto-approves immediately after screenshot upload.
- Data is stored in-memory and will reset when the server restarts.
- The demo UI is separate from your main app to avoid conflicts with the existing React/Vite setup.
