const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// Mock payment endpoint for testing
// POST /api/create-payment
// Body: { amount?: number, currency?: string }
// Returns: Random success or failure response
router.post('/create-payment', async (req, res) => {
  try {
    const { amount = 500, currency = 'INR' } = req.body;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Random success/failure (70% success rate)
    const isSuccess = Math.random() < 0.7;

    if (isSuccess) {
      // Success response
      const paymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = {
        status: 'success',
        payment_id: paymentId,
        amount: amount,
        currency: currency,
        message: 'Payment successful (mocked)',
        timestamp: new Date().toISOString()
      };

      logger.info('Mock payment success:', { paymentId, amount, currency });
      return res.json(response);
    } else {
      // Failure response
      const response = {
        status: 'failed',
        error_code: 'MOCK_ERR',
        message: 'Payment failed (mocked)',
        timestamp: new Date().toISOString()
      };

      logger.warn('Mock payment failure:', response);
      return res.status(400).json(response);
    }

  } catch (error) {
    logger.error('Mock payment error:', error);
    return res.status(500).json({
      status: 'error',
      error_code: 'INTERNAL_ERROR',
      message: 'Internal server error during mock payment',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/mock-payment/status/:paymentId
// Check mock payment status (always returns success for demo)
router.get('/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For mock payments, always return success
    const response = {
      status: 'success',
      payment_id: paymentId,
      payment_status: 'completed',
      message: 'Payment verified (mocked)',
      timestamp: new Date().toISOString()
    };

    logger.info('Mock payment status check:', { paymentId });
    return res.json(response);

  } catch (error) {
    logger.error('Mock payment status error:', error);
    return res.status(500).json({
      status: 'error',
      error_code: 'INTERNAL_ERROR',
      message: 'Internal server error during status check',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;