const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Verify hCaptcha token with the hCaptcha API.
 * @param {string} token - The hCaptcha token from client.
 * @param {string} remoteip - Optional client IP address.
 * @returns {Promise<{ok: boolean, message?: string, data?: any}>}
 */
async function verifyHCaptcha(token, remoteip) {
  try {
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret) {
      logger.warn('HCAPTCHA_SECRET is not set; captcha verification cannot proceed');
      return { ok: false, message: 'Captcha not configured on server' };
    }
    if (!token) {
      return { ok: false, message: 'Missing hCaptcha token' };
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    if (remoteip) params.append('remoteip', remoteip);

    const res = await axios.post('https://hcaptcha.com/siteverify', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = res.data || {};
    if (data.success) {
      return { ok: true, data };
    }

    logger.warn('hCaptcha verification failed', { error_codes: data['error-codes'], hostname: data.hostname });
    return { ok: false, message: 'hCaptcha verification failed', data };
  } catch (error) {
    logger.error('hCaptcha verification error:', error?.response?.data || error?.message || error);
    return { ok: false, message: 'Captcha verification error' };
  }
}

module.exports = { verifyHCaptcha };
