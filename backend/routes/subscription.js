const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get available plans
router.get('/plans', authenticateUser, (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        '5 dream analyses per month',
        'Basic dream tracking',
        'Community support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      features: [
        'Unlimited dream analyses',
        'Advanced analytics',
        'Priority support',
        'Export to PDF'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      features: [
        'Everything in Pro',
        '1:1 dream coaching session',
        'Custom dream interpretations',
        'Early access to new features'
      ]
    }
  ];
  
  res.json({ plans });
});

// Change subscription plan
router.post('/change-plan', authenticateUser, async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    if (!['free', 'pro', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Get current subscription
    const { data: currentSub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw subError;
    }

    // Calculate prorated amount or credit if needed
    // This is a simplified example - you'd want to implement actual proration logic
    let amount = 0;
    if (plan === 'pro') amount = 9.99;
    if (plan === 'premium') amount = 19.99;

    // In a real app, you'd integrate with Stripe or another payment processor here
    // to handle the actual subscription change and proration

    // Update or create subscription
    const subscriptionData = {
      user_id: userId,
      plan,
      amount,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    let data, error;
    
    if (currentSub) {
      // Update existing subscription
      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', currentSub.id)
        .select()
        .single();
      
      data = updated;
      error = updateError;
    } else {
      // Create new subscription
      const { data: created, error: createError } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();
      
      data = created;
      error = createError;
    }

    if (error) throw error;

    // In a real app, you might want to send a confirmation email here
    
    res.json({ 
      success: true, 
      message: `Successfully changed to ${plan} plan`,
      subscription: data
    });

  } catch (error) {
    logger.error('Error changing subscription plan:', error);
    res.status(500).json({ 
      error: 'Failed to change subscription plan',
      details: error.message 
    });
  }
});

module.exports = router;
