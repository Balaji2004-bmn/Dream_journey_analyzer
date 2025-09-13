const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow images and audio files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'), false);
    }
  }
});

// Upload dream attachment (image or audio)
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No File',
        message: 'No file was uploaded'
      });
    }

    const { dreamId } = req.body;
    let processedFilePath = req.file.path;

    // Process image files
    if (req.file.mimetype.startsWith('image/')) {
      const processedFileName = `processed-${req.file.filename}`;
      processedFilePath = path.join(uploadsDir, processedFileName);

      // Resize and optimize image
      await sharp(req.file.path)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(processedFilePath);

      // Remove original file
      fs.unlinkSync(req.file.path);
    }

    // Upload to Supabase Storage
    const fileName = `${req.user.id}/${Date.now()}-${path.basename(processedFilePath)}`;
    const fileBuffer = fs.readFileSync(processedFilePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dream-attachments')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      logger.error('Supabase upload error:', uploadError);
      return res.status(500).json({
        error: 'Upload Failed',
        message: 'Failed to upload file to storage'
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('dream-attachments')
      .getPublicUrl(fileName);

    // Update dream with attachment URL if dreamId provided
    if (dreamId) {
      const updateField = req.file.mimetype.startsWith('image/') ? 'thumbnail_url' : 'audio_url';
      await supabase
        .from('dreams')
        .update({ [updateField]: publicUrl })
        .eq('id', dreamId)
        .eq('user_id', req.user.id);
    }

    // Clean up local file
    fs.unlinkSync(processedFilePath);

    logger.info(`File uploaded for user ${req.user.id}: ${fileName}`);

    res.json({
      success: true,
      file: {
        url: publicUrl,
        type: req.file.mimetype,
        size: req.file.size,
        filename: fileName
      }
    });

  } catch (error) {
    logger.error('File upload error:', error);
    
    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Upload Failed',
      message: error.message || 'Failed to upload file'
    });
  }
});

// Get user's uploaded files
router.get('/my-files', authenticateUser, async (req, res) => {
  try {
    const { data: files, error } = await supabase.storage
      .from('dream-attachments')
      .list(req.user.id, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      logger.error('Error fetching user files:', error);
      return res.status(500).json({
        error: 'Fetch Failed',
        message: 'Failed to fetch user files'
      });
    }

    const filesWithUrls = files.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('dream-attachments')
        .getPublicUrl(`${req.user.id}/${file.name}`);

      return {
        ...file,
        url: publicUrl
      };
    });

    res.json({
      success: true,
      files: filesWithUrls
    });

  } catch (error) {
    logger.error('Files fetch error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch files'
    });
  }
});

// Delete uploaded file
router.delete('/:fileName', authenticateUser, async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = `${req.user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from('dream-attachments')
      .remove([filePath]);

    if (error) {
      logger.error('Error deleting file:', error);
      return res.status(500).json({
        error: 'Delete Failed',
        message: 'Failed to delete file'
      });
    }

    logger.info(`File deleted for user ${req.user.id}: ${fileName}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    logger.error('File deletion error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: 'Failed to delete file'
    });
  }
});

module.exports = router;
