const fs = require('fs');
const path = require('path');

class MediaService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  /**
   * Process uploaded files and return media attachment objects
   * @param {Array} files - Array of uploaded files from multer
   * @param {string} baseUrl - Base URL for serving files
   * @returns {Array} Array of media attachment objects
   */
  processUploadedFiles(files, baseUrl) {
    if (!files || files.length === 0) {
      return [];
    }

    return files.map(file => {
      const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
      const relativePath = path.relative(this.uploadsDir, file.path);
      const url = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;

      return {
        type: mediaType,
        filename: file.filename,
        originalName: file.originalname,
        url: url,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date()
      };
    });
  }

  /**
   * Delete media files from filesystem
   * @param {Array} mediaAttachments - Array of media attachment objects
   */
  async deleteMediaFiles(mediaAttachments) {
    if (!mediaAttachments || mediaAttachments.length === 0) {
      return;
    }

    for (const media of mediaAttachments) {
      try {
        const filePath = this.getFilePathFromUrl(media.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted media file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error deleting media file: ${media.url}`, error);
      }
    }
  }

  /**
   * Get file path from URL
   * @param {string} url - File URL
   * @returns {string} File path
   */
  getFilePathFromUrl(url) {
    // Extract relative path from URL (remove base URL part)
    const urlParts = url.split('/uploads/');
    if (urlParts.length < 2) {
      throw new Error('Invalid media URL format');
    }
    
    const relativePath = urlParts[1];
    return path.join(this.uploadsDir, relativePath);
  }

  /**
   * Check if media file exists
   * @param {string} url - File URL
   * @returns {boolean} True if file exists
   */
  mediaFileExists(url) {
    try {
      const filePath = this.getFilePathFromUrl(url);
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get media file info
   * @param {string} url - File URL
   * @returns {Object|null} File info or null if not found
   */
  getMediaFileInfo(url) {
    try {
      const filePath = this.getFilePathFromUrl(url);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      return {
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: ext
      };
    } catch (error) {
      console.error('Error getting media file info:', error);
      return null;
    }
  }

  /**
   * Clean up orphaned media files (files not referenced in database)
   * @param {Array} referencedUrls - Array of URLs that are still referenced
   */
  async cleanupOrphanedFiles(referencedUrls = []) {
    try {
      const referencedPaths = referencedUrls.map(url => {
        try {
          return this.getFilePathFromUrl(url);
        } catch {
          return null;
        }
      }).filter(Boolean);

      const imageDir = path.join(this.uploadsDir, 'images');
      const videoDir = path.join(this.uploadsDir, 'videos');

      for (const dir of [imageDir, videoDir]) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          
          for (const file of files) {
            const filePath = path.join(dir, file);
            
            if (!referencedPaths.includes(filePath)) {
              try {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up orphaned file: ${filePath}`);
              } catch (error) {
                console.error(`Error cleaning up file ${filePath}:`, error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Validate media file
   * @param {Object} file - File object from multer
   * @returns {Object} Validation result
   */
  validateMediaFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Непідтримуваний тип файлу'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Файл занадто великий (максимум 50MB)'
      };
    }

    return { valid: true };
  }
}

module.exports = new MediaService();