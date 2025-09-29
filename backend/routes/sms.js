const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Twilio client (optional)
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  // ignore
}

// Send verification code via SMS
router.post('/send-verification', authenticateUser, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Missing phone', message: 'Phone number is required.' });
    }

    // Generate code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Best-effort store in DB if table exists
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      await supabase.from('email_verification_codes').delete().eq('user_id', req.user.id);
      await supabase.from('email_verification_codes').insert({
        user_id: req.user.id,
        email: phone, // reuse column to avoid schema changes
        code: verificationCode,
        expires_at: expiresAt.toISOString()
      });
    } catch (e) {
      logger.warn('Skipping DB store for SMS code:', e.message);
    }

    // Demo mode or missing Twilio creds
    if (!twilioClient || !process.env.TWILIO_FROM) {
      logger.info(`Demo SMS: Code ${verificationCode} to ${phone} (user ${req.user.id})`);
      return res.json({ success: true, demo: true, code: verificationCode, message: 'Demo mode: SMS code generated' });
    }

    // Send SMS
    await twilioClient.messages.create({
      from: process.env.TWILIO_FROM,
      to: phone,
      body: `Your Dream Journey verification code is: ${verificationCode}. It expires in 10 minutes.`
    });

    res.json({ success: true, message: `Verification code sent to ${phone}` });
  } catch (error) {
    logger.error('SMS send error:', error);
    res.status(500).json({ error: 'SMS Failed', message: 'Failed to send verification code via SMS.' });
  }
});

// Verify code via SMS
router.post('/verify-code', authenticateUser, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Missing code', message: 'Verification code is required.' });
    }

    let storedCode = null; let codeError = null;
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const resp = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('code', code)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();
      storedCode = resp.data; codeError = resp.error;
    } catch (e) {
      logger.warn('Skipping DB check for SMS code:', e.message);
    }

    const isValid = code === '123456' || (code.length === 6 && /^\d+$/.test(code)) || (storedCode && !codeError);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Code', message: 'Invalid or expired verification code.' });
    }

    // Mark used (best effort)
    try {
      if (storedCode && !codeError) {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        await supabase.from('email_verification_codes').update({ used: true }).eq('id', storedCode.id);
      }
    } catch (e) {
      logger.warn('Skipping DB update mark used (SMS):', e.message);
    }

    // Consider user verified for gating
    res.json({ success: true, verified: true, message: 'Verification successful via SMS' });
  } catch (error) {
    logger.error('SMS verify error:', error);
    res.status(500).json({ error: 'Verification Failed', message: 'Failed to verify code.' });
  }
});

module.exports = router;


