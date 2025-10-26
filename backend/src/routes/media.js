const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadMiddleware, handleUploadError } = require('../middleware/upload');
const mediaService = require('../services/mediaService');
const { verifyToken } = require('../controllers/authController');

// Upload media files
router.post('/upload', verifyToken, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Файли не були завантажені'
        });
      }

      // Process uploaded files
      const baseUrl = `${req.protocol}://${req.get('host')}/api`;
      const mediaAttachments = mediaService.processUploadedFiles(req.files, baseUrl);

      res.json({
        success: true,
        message: 'Файли успішно завантажені',
        data: {
          mediaAttachments,
          count: mediaAttachments.length
        }
      });

    } catch (error) {
      console.error('Error processing uploaded files:', error);
      res.status(500).json({
        success: false,
        message: 'Помилка обробки завантажених файлів'
      });
    }
  });
});

// Serve uploaded files
router.get('/uploads/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Validate type
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Невірний тип медіафайлу'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', type, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Файл не знайдено'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (type === 'images') {
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
      }
    } else if (type === 'videos') {
      switch (ext) {
        case '.mp4':
          contentType = 'video/mp4';
          break;
        case '.avi':
          contentType = 'video/avi';
          break;
        case '.mov':
          contentType = 'video/quicktime';
          break;
        case '.wmv':
          contentType = 'video/x-ms-wmv';
          break;
        case '.webm':
          contentType = 'video/webm';
          break;
      }
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Handle range requests for video streaming
    const range = req.headers.range;
    if (range && type === 'videos') {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunksize);
      
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Send entire file
      res.sendFile(filePath);
    }

  } catch (error) {
    console.error('Error serving media file:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка завантаження файлу'
    });
  }
});

// Delete media file
router.delete('/delete/:type/:filename', verifyToken, (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Validate type
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Невірний тип медіафайлу'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', type, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Файл не знайдено'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Файл успішно видалено'
    });

  } catch (error) {
    console.error('Error deleting media file:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення файлу'
    });
  }
});

// Get media file info
router.get('/info/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Validate type
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Невірний тип медіафайлу'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/api`;
    const url = `${baseUrl}/media/uploads/${type}/${filename}`;
    
    const fileInfo = mediaService.getMediaFileInfo(url);
    
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'Файл не знайдено'
      });
    }

    res.json({
      success: true,
      data: {
        filename,
        type,
        url,
        size: fileInfo.size,
        created: fileInfo.created,
        modified: fileInfo.modified,
        extension: fileInfo.extension
      }
    });

  } catch (error) {
    console.error('Error getting media file info:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання інформації про файл'
    });
  }
});

module.exports = router;