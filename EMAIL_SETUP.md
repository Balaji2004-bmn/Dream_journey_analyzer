# Email Configuration Setup

## 1. Create Backend Environment File

Create a file named `.env` in the `backend` folder with these settings:

```bash
# Copy from .env.example and add email configuration
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

## 2. Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate an app password for "Mail"
5. Use this app password (not your regular Gmail password)

## 3. Example Configuration

```bash
# Email Configuration
EMAIL_USER=dreamjourney.app@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

## 4. Test Email Functionality

Once configured, users can:
- View private dreams in Gallery → "My Private Dreams" filter
- Click the mail icon (📧) on their dream videos
- Receive beautiful HTML emails with dream analysis and video links

## 5. Email Features

✅ Rich HTML email templates with cosmic design
✅ Dream thumbnails and analysis included
✅ Direct video links for easy access
✅ Mobile-responsive design
✅ Professional branding

## 6. Troubleshooting

- Ensure Gmail 2FA is enabled
- Use app-specific password, not regular password
- Check spam folder for test emails
- Verify EMAIL_USER and EMAIL_PASSWORD in .env file
