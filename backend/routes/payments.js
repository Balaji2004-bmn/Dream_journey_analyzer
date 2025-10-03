const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');
const Razorpay = require('razorpay');

const router = express.Router();

// Service-role client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Razorpay client
let razorpayClient = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  logger.info('Razorpay client initialized');
}

const PLAN_PRICES = {
  pro: { amount_usd: 5, amount_inr: 450, currency: 'INR' },
  premium: { amount_usd: 10, amount_inr: 900, currency: 'INR' }
};

// Razorpay plan IDs (you need to create these in your Razorpay dashboard)
const RAZORPAY_PLANS = {
  pro: process.env.RAZORPAY_PLAN_PRO,
  premium: process.env.RAZORPAY_PLAN_PREMIUM
};

// Create checkout session with Razorpay or local fallback
router.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    const { plan, user_id } = req.body || {};

    if (!plan || !['pro', 'premium'].includes(String(plan))) {
      return res.status(400).json({ error: 'Invalid plan', message: 'Plan must be pro or premium' });
    }

    if (!user_id || user_id !== req.user.id) {
      return res.status(400).json({ error: 'Invalid user', message: 'user_id missing or does not match session user' });
    }

    const price = PLAN_PRICES[plan];

    // Try Razorpay first if configured
    if (razorpayClient && RAZORPAY_PLANS[plan]) {
      try {
        logger.info(`Creating Razorpay subscription for plan: ${plan}`);

        const subscriptionData = {
          plan_id: RAZORPAY_PLANS[plan],
          customer_notify: 1,
          quantity: 1,
          total_count: 12, // 12 months
          notes: {
            user_id: user_id,
            plan: plan
          }
        };

        const subscription = await razorpayClient.subscriptions.create(subscriptionData);

        logger.info(`Razorpay subscription created: ${subscription.id}`);

        return res.json({
          provider: 'razorpay',
          subscription_id: subscription.id,
          key_id: process.env.RAZORPAY_KEY_ID,
          plan,
          price_inr: price.amount_inr
        });
      } catch (razorpayError) {
        logger.error('Razorpay subscription creation failed:', razorpayError);
        // Fall back to mock payment
      }
    }

    // Use mock payment system for testing (instead of immediate local activation)
    logger.info(`Using mock payment system for plan: ${plan}`);

    // Call the mock payment endpoint
    try {
      const axios = require('axios');
      const mockResponse = await axios.post('http://localhost:3001/api/create-payment', {
        amount: price.amount_inr,
        currency: price.currency
      });

      if (mockResponse.data.status === 'success') {
        // Mock payment successful - now activate subscription
        const now = new Date().toISOString();

        // Insert into subscriptions table
        let inserted = null;
        try {
          const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: user_id,
              plan,
              status: 'active',
              currency: price.currency,
              amount: price.amount_inr,
              start_date: now,
              provider: 'mock'
            })
            .select()
            .single();

          if (error) throw error;
          inserted = data;
        } catch (dbErr) {
          logger.warn('Subscriptions insert failed, will rely on auth metadata fallback:', dbErr.message || dbErr);
        }

        // Mirror to auth user_metadata as fallback
        try {
          const { data: current } = await supabaseAdmin.auth.admin.getUserById(user_id);
          const currentMeta = current?.user?.user_metadata || {};
          await supabaseAdmin.auth.admin.updateUserById(user_id, {
            user_metadata: { ...currentMeta, plan, subscription_status: 'active' }
          });
        } catch (metaErr) {
          logger.warn('Failed to update user_metadata with plan info:', metaErr.message || metaErr);
        }

        const subscription_id = inserted?.id || `mock-${user_id}-${Date.now()}`;
        return res.json({
          provider: 'mock',
          subscription_id,
          plan,
          price_inr: price.amount_inr,
          mock_payment_id: mockResponse.data.payment_id
        });
      } else {
        // Mock payment failed
        return res.status(400).json({
          error: 'Mock Payment Failed',
          message: mockResponse.data.message || 'Payment was declined by mock system'
        });
      }
    } catch (mockError) {
      logger.error('Mock payment call failed:', mockError.message);
      return res.status(500).json({
        error: 'Mock Payment Error',
        message: 'Failed to process mock payment'
      });
    }

    // 1) Insert into subscriptions table
    let inserted = null;
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user_id,
          plan,
          status: 'active',
          currency: price.currency,
          amount: price.amount_inr,
          start_date: now,
          provider: 'local'
        })
        .select()
        .single();

      if (error) throw error;
      inserted = data;
    } catch (dbErr) {
      logger.warn('Subscriptions insert failed, will rely on auth metadata fallback:', dbErr.message || dbErr);
    }

    // 2) Mirror to auth user_metadata as fallback so gating works even if table is missing
    try {
      const { data: current } = await supabaseAdmin.auth.admin.getUserById(user_id);
      const currentMeta = current?.user?.user_metadata || {};
      await supabaseAdmin.auth.admin.updateUserById(user_id, {
        user_metadata: { ...currentMeta, plan, subscription_status: 'active' }
      });
    } catch (metaErr) {
      logger.warn('Failed to update user_metadata with plan info:', metaErr.message || metaErr);
    }

    // 3) Respond with a local provider response; frontend will redirect to success page
    const subscription_id = inserted?.id || `local-${user_id}-${Date.now()}`;
    return res.json({
      provider: 'local',
      subscription_id,
      plan,
      price_inr: price.amount_inr
    });
  } catch (error) {
    logger.error('Create checkout session error:', error);
    return res.status(500).json({ error: 'Payment Error', message: 'Failed to start checkout' });
  }
});

module.exports = router;
