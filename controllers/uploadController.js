const fs = require('fs');
const path = require('path');
const db = require('../models/db');

// In uploadController.js - modify the uploadFiles function
exports.uploadFiles = async (req, res) => {
    try {
        console.log('Session in upload:', req.session);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No files uploaded' 
            });
        }

        const userId = req.session.userId;
        if (!userId) {
            console.error('No user ID in session during upload');
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated - please login again' 
            });
        }

        // Create separate upload directories if they don't exist
        const imageUploadDir = path.join(__dirname, '../public/uploads/images');
        const videoUploadDir = path.join(__dirname, '../public/uploads/videos');
        
        if (!fs.existsSync(imageUploadDir)) {
            fs.mkdirSync(imageUploadDir, { recursive: true });
        }
        if (!fs.existsSync(videoUploadDir)) {
            fs.mkdirSync(videoUploadDir, { recursive: true });
        }

        // Count video files to enforce limit
        const videoCount = req.files.filter(file => file.mimetype.startsWith('video/')).length;
        if (videoCount > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 videos allowed per upload'
            });
        }

        // Process each uploaded file
        const uploadResults = await Promise.all(req.files.map(async (file) => {
            try {
                // Determine destination folder based on file type
                const isVideo = file.mimetype.startsWith('video/');
                const uploadDir = isVideo ? videoUploadDir : imageUploadDir;
                const subfolder = isVideo ? 'videos' : 'images';
                
                // Generate unique filename
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                const fileName = uniqueSuffix + ext;
                const filePath = path.join(uploadDir, fileName);
                
                // Move file to permanent location
                fs.renameSync(file.path, filePath);
                
                // Insert metadata into database
                const [result] = await db.query(
                    'INSERT INTO uploaded_media (user_id, file_name, file_type, file_size, file_path) VALUES (?, ?, ?, ?, ?)',
                    [
                        userId,
                        file.originalname,
                        file.mimetype,
                        file.size,
                        `/uploads/${subfolder}/${fileName}`
                    ]
                );

                return {
                    success: true,
                    fileId: result.insertId,
                    fileName: file.originalname,
                    filePath: `/uploads/${subfolder}/${fileName}`
                };
            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
                return {
                    success: false,
                    fileName: file.originalname,
                    error: error.message
                };
            }
        }));

        // Rest of the function remains the same...
        // Check if all uploads succeeded
        const allSuccess = uploadResults.every(result => result.success);
        
        if (allSuccess) {
            res.json({ 
                success: true, 
                message: 'Files uploaded successfully',
                results: uploadResults
            });
        } else {
            res.status(207).json({
                success: false,
                message: 'Some files failed to upload',
                results: uploadResults
            });
        }
    } catch (error) {
        console.error('Upload controller error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const userId = req.session.userId;
        const fileId = req.params.id;

        // First check if file exists
        const [fileRows] = await db.query(
            'SELECT * FROM uploaded_media WHERE id = ?',
            [fileId]
        );

        if (fileRows.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const file = fileRows[0];
        
        // Only allow deletion by owner (or you could add admin check here)
        if (file.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this file' });
        }

        const filePath = file.file_path;
        const fullPath = path.join(__dirname, '../public', filePath);
        
        // Delete from filesystem
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        // Delete from database
        await db.query(
            'DELETE FROM uploaded_media WHERE id = ?',
            [fileId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserMedia = async (req, res) => {
    try {
      const [media] = await db.query(
        'SELECT id, file_name, file_type, file_size, file_path, uploaded_at FROM uploaded_media ORDER BY uploaded_at DESC LIMIT 10'
      );
      
      // Add debug logging:
      console.log('Media files found:', media.map(m => ({
        id: m.id,
        path: m.file_path,
        type: m.file_type
      })));
      
      res.json({ success: true, media });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
};

// Add this new method to uploadController.js
exports.bulkDeleteMedia = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { ids } = req.body;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        // Get files to delete
        const [files] = await db.query(
            'SELECT id, file_path FROM uploaded_media WHERE id IN (?) AND user_id = ?',
            [ids, userId]
        );

        if (files.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No files found for deletion' 
            });
        }

        // Delete from filesystem
        files.forEach(file => {
            const fullPath = path.join(__dirname, '../public', file.file_path);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });

        // Delete from database
        await db.query(
            'DELETE FROM uploaded_media WHERE id IN (?) AND user_id = ?',
            [ids, userId]
        );

        res.json({ 
            success: true, 
            message: `${files.length} file(s) deleted successfully` 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};