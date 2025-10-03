// Adaptive Dream Journey Analyzer - Demo Backend (Port 4000)
// This is an isolated demo server so it won't interfere with your existing backend.
// Features:
// - POST /upload-screenshot: accepts multipart form-data (screenshot + fields)
// - Saves screenshot via multer to /backend/uploads
// - Stores subscriptions in-memory and auto-approves PRO/PREMIUM after upload based on amount
// - Serves /uploads statically for viewing uploaded files
// - CORS enabled for easy local testing (including file:// origins)

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000; // As required by the demo spec
// Demo pricing (overrideable via env). Default USD->INR conversion for demo only.
const USD_TO_INR = Number(process.env.DEMO_USD_TO_INR || 83);
const PRO_USD = Number(process.env.DEMO_PRO_USD || 5);
const PREMIUM_USD = Number(process.env.DEMO_PREMIUM_USD || 10);
const PRO_INR = Number(process.env.DEMO_PRO_INR || Math.round(PRO_USD * USD_TO_INR));
const PREMIUM_INR = Number(process.env.DEMO_PREMIUM_INR || Math.round(PREMIUM_USD * USD_TO_INR));
const AMOUNT_TOLERANCE = Number(process.env.DEMO_AMOUNT_TOLERANCE || 3); // INR tolerance

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple permissive CORS for demo (allows null origins like file://)
app.use(cors());

// Parse JSON/urlencoded for any non-file form data
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Multer storage configuration to keep original extension and tag files by user
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const userId = (req.body.userId || 'anonymous').toString();
    const ext = path.extname(file.originalname || '');
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeUserId}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// In-memory store for demo subscriptions and users
// Map<userId, { plan: 'FREE'|'PRO'|'PREMIUM', amount?: number, txnNote?: string, status?: string, screenshotFilename?: string, updatedAt: string }>
const subscriptions = new Map();

// Helper: get current subscription for a user, default FREE
function getOrInitSub(userId) {
  if (!subscriptions.has(userId)) {
    subscriptions.set(userId, { plan: 'FREE', updatedAt: new Date().toISOString() });
  }
  return subscriptions.get(userId);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'demo-backend', port: PORT, timestamp: new Date().toISOString() });
});

// Optional: Check subscription status for a user
app.get('/subscription/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const sub = getOrInitSub(userId);
  res.json({ userId, subscription: sub });
});

// Pricing info for frontend to render exact amounts
app.get('/prices', (_req, res) => {
  res.json({
    currency: 'INR',
    pro_inr: PRO_INR,
    premium_inr: PREMIUM_INR,
    usd_to_inr: USD_TO_INR,
    tolerance: AMOUNT_TOLERANCE
  });
});

// Required: Upload screenshot and auto-approve based on amount
// Expects multipart/form-data with fields: userId, plan (optional), amount, txnNote and file field name "screenshot"
app.post('/upload-screenshot', upload.single('screenshot'), (req, res) => {
  try {
    const { userId, plan, amount, txnNote } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'screenshot file is required' });
    }

    // Determine plan from amount (with tolerance)
    const amt = Number(amount) || 0;
    let finalPlan = 'PRO';
    if (amt >= (PREMIUM_INR - AMOUNT_TOLERANCE)) finalPlan = 'PREMIUM';
    else if (amt >= (PRO_INR - AMOUNT_TOLERANCE)) finalPlan = 'PRO';
    const sub = getOrInitSub(userId);

    sub.plan = finalPlan; // Upgrade automatically
    sub.amount = amt || undefined;
    sub.txnNote = txnNote || undefined;
    sub.status = 'approved';
    sub.screenshotFilename = req.file.filename;
    sub.updatedAt = new Date().toISOString();

    subscriptions.set(userId, sub);

    const subscription_id = `demo-${finalPlan.toLowerCase()}-${userId}-${Date.now()}`;
    return res.json({
      message: `Payment verified, plan upgraded to ${finalPlan}`,
      userId,
      subscription: { ...sub, subscription_id },
      upload: {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

app.listen(PORT, () => {
  console.log(`Demo backend running on http://localhost:${PORT}`);
  console.log(`Prices: PRO ₹${PRO_INR}, PREMIUM ₹${PREMIUM_INR} (USD->INR=${USD_TO_INR})`);
  console.log('POST /upload-screenshot to auto-upgrade users based on amount');
});
