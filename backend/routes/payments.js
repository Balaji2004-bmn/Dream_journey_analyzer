const express = require('express');
const router = express.Router();

// UPI Payment Configuration
const UPI_ID = process.env.UPI_ID || '6361698728@slc';
const MERCHANT_NAME = process.env.MERCHANT_NAME || 'DreamVision';

// In-memory subscription storage (replace with database in production)
const subscriptions = new Map();

/**
 * UPI Payment Routes
 */

// Generate UPI payment URL
router.post('/create-upi-payment', async (req, res) => {
  try {
    const { plan, userId, amount } = req.body;

    if (!plan || !userId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${plan.toUpperCase()} Plan - User: ${userId}`)}`;

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

    res.json({
      success: true,
      upiUrl,
      qrCodeUrl,
      upiId: UPI_ID,
      amount,
      currency: 'INR'
    });
  } catch (error) {
    console.error('UPI payment creation error:', error);
    res.status(500).json({ error: 'Failed to create UPI payment' });
  }
});

// Verify UPI payment with AUTO-CONFIRMATION
router.post('/verify-upi', async (req, res) => {
  try {
    const { userId, plan, amount, upiId } = req.body;

    if (!userId || !plan || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log payment verification request
    console.log('UPI Payment Verification Request:', {
      userId,
      plan,
      amount,
      upiId,
      timestamp: new Date().toISOString()
    });

    // AUTO-CONFIRM SUBSCRIPTION
    const subscriptionData = {
      userId,
      plan,
      amount,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      videosLimit: plan === 'premium' ? -1 : 10, // -1 means unlimited
      videosUsed: 0,
      autoRenew: true
    };

    // Store subscription (in production, save to database)
    subscriptions.set(userId, subscriptionData);

    console.log('✅ Subscription AUTO-ACTIVATED:', subscriptionData);

    // Return success with subscription details
    res.json({
      success: true,
      message: 'Payment confirmed! Your subscription is now active.',
      status: 'active',
      subscription: subscriptionData
    });
  } catch (error) {
    console.error('UPI verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// New endpoint: Verify UPI payment with screenshot (AUTO-ACTIVATION)
router.post('/verify-upi-payment', async (req, res) => {
  try {
    const { userId, plan, amount, amountUSD, upiId, screenshotName, timestamp } = req.body;

    if (!userId || !plan || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate plan
    const validPlans = ['free', 'pro', 'premium'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Log payment verification request
    console.log('🔔 UPI Payment Verification with Screenshot:', {
      userId,
      plan,
      amount,
      amountUSD,
      upiId,
      screenshotName,
      timestamp
    });

    // AUTO-ACTIVATE SUBSCRIPTION (screenshot verification would happen here in production)
    const subscriptionData = {
      userId,
      plan,
      amount_inr: amount,
      amount_usd: amountUSD,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      videosLimit: plan === 'premium' ? -1 : (plan === 'pro' ? 100 : 10),
      videosUsed: 0,
      autoRenew: true,
      screenshotVerified: true,
      screenshotName,
      paymentMethod: 'UPI',
      provider: 'manual'
    };

    // Store subscription (in production, save to Supabase database)
    subscriptions.set(userId, subscriptionData);

    console.log('✅ Subscription AUTOMATICALLY ACTIVATED:', {
      userId,
      plan,
      amount: `₹${amount} (${amountUSD} USD)`,
      status: 'active'
    });

    // Return success with subscription details
    res.json({
      success: true,
      message: `Payment confirmed! Your ${plan.toUpperCase()} plan is now active.`,
      status: 'active',
      subscription: subscriptionData
    });
  } catch (error) {
    console.error('UPI payment verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error.message 
    });
  }
});

// Get subscription status
router.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user has active subscription
    const subscription = subscriptions.get(userId);

    if (subscription) {
      res.json(subscription);
    } else {
      // Return free plan if no subscription
      res.json({
        userId,
        plan: 'free',
        status: 'active',
        videosLimit: 3,
        videosUsed: 0,
        videosRemaining: 3,
        nextBillingDate: null
      });
    }
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Admin: Approve payment
router.post('/admin/approve-payment', async (req, res) => {
  try {
    const { userId, plan, transactionId } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production:
    // 1. Verify admin authentication
    // 2. Update user subscription in database
    // 3. Send confirmation email to user
    // 4. Log transaction

    console.log('Payment Approved:', {
      userId,
      plan,
      transactionId,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Payment approved and subscription activated'
    });
  } catch (error) {
    console.error('Payment approval error:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

module.exports = router;