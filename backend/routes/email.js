const express = require('express');
const nodemailer = require('nodemailer');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Configure email transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file.');
  }

  // Check if using demo/placeholder values
  if (process.env.EMAIL_USER === 'your_gmail_address@gmail.com' || 
      process.env.EMAIL_PASSWORD === 'your_app_specific_password' ||
      process.env.EMAIL_USER === 'demo@gmail.com' || 
      process.env.EMAIL_PASSWORD === 'demo-password') {
    throw new Error('Please replace demo email credentials with real Gmail credentials in .env file.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send dream video via email
router.post('/send-dream-video', authenticateUser, async (req, res) => {
  try {
    const { email, dreamTitle, dreamContent, videoUrl, thumbnailUrl, analysis } = req.body;

    if (!dreamTitle || !dreamContent) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Dream title and content are required.'
      });
    }

    // Use the authenticated user's email if no email provided
    const targetEmail = email || req.user.email;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address.'
      });
    }
    
    if (!targetEmail) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'No email address provided and user email not found.'
      });
    }

    // Check if email is configured, if not, simulate success for demo
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'demo@gmail.com' || 
        process.env.EMAIL_PASSWORD === 'demo-password') {
      
      // For demo mode, simulate successful email sending
      logger.info(`Demo mode: Simulating email send to ${targetEmail} for dream: ${dreamTitle} (user: ${req.user.id})`);
      
      return res.json({
        success: true,
        message: `✅ Demo mode: Dream video email sent to ${targetEmail}! Check your email for the beautiful dream analysis and video link.`,
        dreamTitle,
        demo: true,
        email_sent: true,
        instructions: 'To enable real email sending, configure EMAIL_USER and EMAIL_PASSWORD in your backend .env file'
      });
    }

    const transporter = createTransporter();

    // Generate email content
    const keywords = analysis?.keywords?.join(', ') || 'N/A';
    const emotions = analysis?.emotions?.map(e => `${e.emotion} (${e.intensity}%)`).join(', ') || 'N/A';
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your Dream Video - ${dreamTitle}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #6366f1;
                margin: 0;
                font-size: 28px;
            }
            .dream-card {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .dream-title {
                font-size: 22px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            .dream-content {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 20px;
            }
            .analysis-section {
                background: #f8fafc;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .analysis-title {
                color: #4f46e5;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            .keywords, .emotions {
                margin: 10px 0;
            }
            .video-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
            }
            .video-link {
                display: inline-block;
                background: #10b981;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                margin: 15px 0;
                transition: all 0.3s ease;
            }
            .video-link:hover {
                background: #059669;
                transform: translateY(-2px);
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #6b7280;
                font-size: 14px;
            }
            .thumbnail {
                max-width: 100%;
                border-radius: 10px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌙 Your Dream Video is Ready! ✨</h1>
                <p>Your personalized dream analysis and video from Dream Journey Analyzer</p>
            </div>

            <div class="dream-card">
                <div class="dream-title">${dreamTitle}</div>
                <div class="dream-content">${dreamContent}</div>
            </div>

            ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="Dream Thumbnail" class="thumbnail">` : ''}

            <div class="analysis-section">
                <div class="analysis-title">🧠 Dream Analysis</div>
                <div class="keywords"><strong>Keywords:</strong> ${keywords}</div>
                <div class="emotions"><strong>Emotions:</strong> ${emotions}</div>
            </div>

            <div class="video-section">
                <h2>🎬 Your Dream Video</h2>
                <p>Click the button below to watch your personalized dream video:</p>
                ${videoUrl ? `<a href="${videoUrl}" class="video-link">🎥 Watch Dream Video</a>` : '<p>Video will be available once processing is complete.</p>'}
                <p><small>This video was generated using AI based on your dream content and emotions.</small></p>
            </div>

            <div class="footer">
                <p>Generated by Dream Journey Analyzer</p>
                <p>Transform your dreams into insights with AI-powered analysis</p>
                <p><em>Keep dreaming! 🌟</em></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: targetEmail,
      subject: `🌙 Your Dream Video: ${dreamTitle}`,
      html: htmlContent,
      attachments: thumbnailUrl ? [{
        filename: 'dream-thumbnail.jpg',
        path: thumbnailUrl,
        cid: 'thumbnail'
      }] : []
    };

    await transporter.sendMail(mailOptions);

    logger.info(`Dream video email sent to ${targetEmail} for user ${req.user.id}`);

    res.json({
      success: true,
      message: `Dream video sent successfully to ${targetEmail}`,
      dreamTitle
    });

  } catch (error) {
    logger.error('Email sending error:', error);
    
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        error: 'Email Configuration Error',
        message: 'Email service is not properly configured. Please contact support.'
      });
    }

    res.status(500).json({
      error: 'Email Failed',
      message: 'Failed to send dream video email. Please try again.'
    });
  }
});

// Send dream analysis summary via email
router.post('/send-analysis', authenticateUser, async (req, res) => {
  try {
    const { email, dreamTitle, analysis } = req.body;

    if (!email || !dreamTitle || !analysis) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, dream title, and analysis are required.'
      });
    }

    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Dream Analysis - ${dreamTitle}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #6366f1; margin-bottom: 30px; }
            .section { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
            .keywords { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
            .keyword { background: #6366f1; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; }
            .emotion-bar { background: #e5e7eb; height: 20px; border-radius: 10px; margin: 5px 0; overflow: hidden; }
            .emotion-fill { height: 100%; background: linear-gradient(90deg, #f093fb, #f5576c); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧠 Dream Analysis Report</h1>
                <h2>${dreamTitle}</h2>
            </div>
            
            <div class="section">
                <h3>📝 Summary</h3>
                <p>${analysis.summary || 'No summary available'}</p>
            </div>

            <div class="section">
                <h3>🔑 Keywords</h3>
                <div class="keywords">
                    ${analysis.keywords?.map(keyword => `<span class="keyword">${keyword}</span>`).join('') || 'No keywords found'}
                </div>
            </div>

            <div class="section">
                <h3>💭 Emotions</h3>
                ${analysis.emotions?.map(emotion => `
                    <div style="margin: 10px 0;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>${emotion.emotion}</span>
                            <span>${emotion.intensity}%</span>
                        </div>
                        <div class="emotion-bar">
                            <div class="emotion-fill" style="width: ${emotion.intensity}%;"></div>
                        </div>
                    </div>
                `).join('') || 'No emotions analyzed'}
            </div>

            <div style="text-align: center; margin-top: 30px; color: #6b7280;">
                <p>Generated by Dream Journey Analyzer</p>
                <p><em>Sweet dreams! 🌙</em></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🧠 Dream Analysis: ${dreamTitle}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Dream analysis sent successfully to ${email}`
    });

  } catch (error) {
    logger.error('Analysis email error:', error);
    res.status(500).json({
      error: 'Email Failed',
      message: 'Failed to send dream analysis email.'
    });
  }
});

// Send email confirmation - PUBLIC ENDPOINT
 router.post('/send-confirmation', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email', message: 'Email address is required.' });
  }

  try {
    // This will throw an error if not configured, which is caught below.
    const transporter = createTransporter();

    const confirmLink = `${process.env.BACKEND_PUBLIC_URL || 'http://localhost:3001'}/api/email/confirm-email?email=${encodeURIComponent(email)}`;
    const htmlContent = `
      <div style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1 style="color: #333;">Welcome to Dream Journey Analyzer!</h1>
        <p>Please confirm your email address by clicking the button below.</p>
        <a href="${confirmLink}" style="background-color: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Confirm Email</a>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">If you cannot click the button, please copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #777;">${confirmLink}</p>
      </div>
    `;

    const mailOptions = {
      from: `"Dream Journey Analyzer" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Please confirm your email - Dream Journey Analyzer',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email confirmation sent', {
      to: email,
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected
    });
    return res.json({
      success: true,
      message: `Verification email sent to ${email}. Please check your inbox.`,
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected
    });
  } catch (error) {
    logger.error('Email confirmation error:', { message: error.message, stack: error.stack });
    if (error.message && (error.message.includes('Email credentials not configured') || error.message.includes('demo email credentials'))) {
      return res.status(500).json({
        error: 'Email Service Not Configured',
        message: 'The email service is not configured. Please set up EMAIL_USER and EMAIL_PASSWORD in the backend .env file.'
      });
    }
    if (error.code === 'EAUTH' || (typeof error.message === 'string' && error.message.includes('Invalid login'))) {
      return res.status(500).json({
        error: 'Invalid Email Credentials',
        message: 'The email service credentials are not valid. Please check EMAIL_USER and EMAIL_PASSWORD in the backend .env file.'
      });
    }
    return res.status(500).json({ error: 'Email Failed', message: 'Failed to send email confirmation. Please try again.' });
  }
});

// Confirm email (resolve by email address) - PUBLIC ENDPOINT (POST)
router.post('/confirm-email', async (req, res) => {
  try {
    const { email } = req.body;
    const targetEmail = (email || '').trim().toLowerCase();

    if (!targetEmail) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email address is required.'
      });
    }

    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

      // If we have an authenticated user (rare in signup flow), confirm directly
      if (req.user && req.user.id) {
        await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
          email_confirmed_at: new Date().toISOString(),
        });
        logger.info(`Email confirmation updated for authenticated user ${req.user.id} (${targetEmail})`);
      } else {
        // Find the user by email via admin API and update confirmation
        const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (listError) {
          throw listError;
        }
        const users = authData?.users || [];
        const user = users.find(u => (u.email || '').toLowerCase() === targetEmail);
        
        // Check demo users if not found in Supabase
        if (!user) {
          const { demoUsers } = require('../routes/auth');
          const demoUser = demoUsers.get(targetEmail);
          if (demoUser && !demoUser.email_confirmed_at) {
            demoUser.email_confirmed_at = new Date().toISOString();
            logger.info(`Demo user email confirmed: ${targetEmail}`);
            return res.json({
              success: true,
              message: 'Email confirmed successfully! You can now sign in.',
              confirmed: true,
              demo: true
            });
          }
          logger.warn(`Email confirmation requested but user not found for email: ${targetEmail}`);
          return res.status(404).json({
            error: 'User Not Found',
            message: 'No user exists for the provided email address.'
          });
        }

        try {
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            email_confirmed_at: new Date().toISOString(),
          });
          logger.info(`Email confirmation updated via email for user ${user.id} (${targetEmail})`);
        } catch (updateError) {
          logger.error('Failed to update email confirmation status:', updateError);
          return res.status(500).json({
            error: 'Confirmation Failed',
            message: 'Failed to update confirmation status: ' + (updateError.message || 'Unknown error')
          });
        }
      }

      return res.json({
        success: true,
        message: 'Email confirmed successfully! You can now sign in.',
        confirmed: true,
      });
    } catch (updateError) {
      logger.error('Email confirmation update error:', updateError);
      return res.status(500).json({
        error: 'Confirmation Failed',
        message: 'Failed to confirm email. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Email confirmation error:', error);
    res.status(500).json({
      error: 'Confirmation Failed',
      message: 'Failed to confirm email. Please try again.'
    });
  }
});

// Confirm email via GET link (for emails)
router.get('/confirm-email', async (req, res) => {
  try {
    const email = (req.query.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Missing email', message: 'Email is required' });
    }
    
    // Check demo users first (for fallback mode)
    const { demoUsers } = require('../routes/auth');
    const demoUser = demoUsers.get(email);
    if (demoUser && !demoUser.email_confirmed_at) {
      demoUser.email_confirmed_at = new Date().toISOString();
      logger.info(`Demo user email confirmed: ${email}`);
      const redirect = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?verified=1`;
      return res.redirect(302, redirect);
    }
    
    // Try Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = (authData?.users || []).find(u => (u.email || '').toLowerCase() === email);
    if (!user) {
      // If neither demo nor Supabase user found
      if (!demoUser) {
        return res.status(404).send('User not found for provided email');
      }
      // Demo user already confirmed above
      const redirect = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?verified=1`;
      return res.redirect(302, redirect);
    }

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirmed_at: new Date().toISOString(),
    });

    logger.info(`Supabase user email confirmed: ${email}`);
    // Redirect to frontend sign-in page with success message
    const redirect = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?verified=1`;
    return res.redirect(302, redirect);
  } catch (error) {
    logger.error('GET confirm email error:', error);
    return res.status(500).send('Failed to confirm email. Please try again later.');
  }
});

// In-memory storage for security codes (in production, use Redis or database)
const securityCodes = new Map();

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of securityCodes.entries()) {
    if (now > data.expiresAt) {
      securityCodes.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Send security code for private dream access
router.post('/send-private-dream-code', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'User email not found.'
      });
    }

    // Generate a 6-digit security code
    const securityCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes

    // Store the code
    securityCodes.set(`${userId}_private_access`, {
      code: securityCode,
      email: userEmail,
      expiresAt,
      createdAt: Date.now()
    });

    // Fallback for development: if email service is not configured, return the code in response
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD &&
      !['your_gmail_address@gmail.com', 'demo@gmail.com'].includes(process.env.EMAIL_USER) &&
      !['your_app_specific_password', 'demo-password'].includes(process.env.EMAIL_PASSWORD);

    if (!emailConfigured) {
      logger.warn('Email service not configured. Returning security code in response for demo/dev use.');
      return res.json({
        success: true,
        message: `Demo mode: security code generated for ${userEmail}. Use this code to unlock private dreams.`,
        code: securityCode,
        demo: true,
        expiresIn: 15 * 60
      });
    }

    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Private Dream Access Code - Dream Journey Analyzer</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                  background: white;
                  border-radius: 15px;
                  padding: 30px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                  text-align: center;
              }
              .header {
                  margin-bottom: 30px;
              }
              .header h1 {
                  color: #6366f1;
                  margin: 0;
                  font-size: 28px;
              }
              .security-code {
                  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                  color: white;
                  font-size: 36px;
                  font-weight: bold;
                  padding: 20px;
                  border-radius: 10px;
                  margin: 20px 0;
                  letter-spacing: 5px;
                  display: inline-block;
              }
              .warning {
                  background: #fef3c7;
                  color: #92400e;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #f59e0b;
              }
              .footer {
                  margin-top: 30px;
                  color: #6b7280;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🔒 Private Dream Access</h1>
                  <p>Your security code for accessing private dreams</p>
              </div>

              <div class="security-code">${securityCode}</div>

              <div class="warning">
                  <strong>⚠️ Security Notice:</strong><br>
                  This code expires in 15 minutes and can only be used once.<br>
                  Never share this code with anyone.
              </div>

              <p>This code was requested for accessing your private dreams on Dream Journey Analyzer.</p>
              <p>If you didn't request this code, please ignore this email.</p>

              <div class="footer">
                  <p>Generated by Dream Journey Analyzer</p>
                  <p><em>Your privacy and security are our top priority 🌟</em></p>
              </div>
          </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Dream Journey Analyzer" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔒 Your Private Dream Access Code',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    logger.info(`Security code sent to ${userEmail} for user ${userId}`);

    res.json({
      success: true,
      message: `Security code sent to ${userEmail}. Please check your email.`,
      expiresIn: 15 * 60 // 15 minutes in seconds
    });

  } catch (error) {
    logger.error('Security code sending error:', error);
    res.status(500).json({
      error: 'Email Failed',
      message: 'Failed to send security code. Please try again.'
    });
  }
});

// Verify security code for private dream access
router.post('/verify-private-dream-code', authenticateUser, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        error: 'Missing code',
        message: 'Security code is required.'
      });
    }

    const key = `${userId}_private_access`;
    const storedData = securityCodes.get(key);

    if (!storedData) {
      return res.status(400).json({
        error: 'No code found',
        message: 'No security code found. Please request a new one.'
      });
    }

    if (Date.now() > storedData.expiresAt) {
      securityCodes.delete(key);
      return res.status(400).json({
        error: 'Code expired',
        message: 'Security code has expired. Please request a new one.'
      });
    }

    if (storedData.code !== code.trim()) {
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Security code is incorrect. Please try again.'
      });
    }

    // Code is valid - grant access and delete the code (one-time use)
    securityCodes.delete(key);

    // Store access grant in session/memory (in production, use Redis/database)
    const accessKey = `${userId}_private_granted`;
    securityCodes.set(accessKey, {
      granted: true,
      grantedAt: Date.now(),
      expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour access
    });

    logger.info(`Private dream access granted to user ${userId}`);

    res.json({
      success: true,
      message: 'Security code verified. You now have access to private dreams.',
      accessGranted: true,
      expiresIn: 60 * 60 // 1 hour in seconds
    });

  } catch (error) {
    logger.error('Security code verification error:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: 'Failed to verify security code. Please try again.'
    });
  }
});

// Check if user has private dream access
router.get('/private-dream-access', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const accessKey = `${userId}_private_granted`;
    const accessData = securityCodes.get(accessKey);

    if (!accessData || !accessData.granted || Date.now() > accessData.expiresAt) {
      return res.json({
        hasAccess: false,
        message: 'Private dream access not granted or expired.'
      });
    }

    res.json({
      hasAccess: true,
      grantedAt: accessData.grantedAt,
      expiresAt: accessData.expiresAt,
      timeRemaining: Math.max(0, Math.floor((accessData.expiresAt - Date.now()) / 1000))
    });

  } catch (error) {
    logger.error('Private dream access check error:', error);
    res.status(500).json({
      error: 'Access Check Failed',
      message: 'Failed to check private dream access.'
    });
  }
});

module.exports = router;