const fs = require('fs');
const path = require('path');
const db = require('../models/db');

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

        // Process each uploaded file
        const uploadResults = await Promise.all(req.files.map(async (file) => {
            try {
                // Read the file data
                const fileData = fs.readFileSync(file.path);
                
                // Insert into database
                const [result] = await db.query(
                    'INSERT INTO uploaded_media (user_id, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?)',
                    [
                        userId,
                        file.originalname,
                        file.mimetype,
                        file.size,
                        fileData
                    ]
                );

                // Delete the temporary file
                fs.unlinkSync(file.path);

                return {
                    success: true,
                    fileId: result.insertId,
                    fileName: file.originalname
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

        // Check if all uploads succeeded
        const allSuccess = uploadResults.every(result => result.success);
        
        if (allSuccess) {
            res.json({ 
                success: true, 
                message: 'Files uploaded successfully',
                results: uploadResults
            });
        } else {
            res.status(207).json({ // 207 Multi-Status
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

// ... rest of your existing code ...

exports.deleteFile = async (req, res) => {
    try {
        const userId = req.session.userId;
        const fileId = req.params.id;

        // Delete from database
        const [result] = await db.query(
            'DELETE FROM uploaded_media WHERE id = ? AND user_id = ?',
            [fileId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'File not found or not authorized' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserMedia = async (req, res) => {
    try {
        const userId = req.session.userId;
        
        const [media] = await db.query(
            'SELECT id, file_name, file_type, file_size, uploaded_at FROM uploaded_media WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 10',
            [userId]
        );

        res.json({ success: true, media });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMediaFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        
        const [rows] = await db.query(
            'SELECT file_type, file_data FROM uploaded_media WHERE id = ?',
            [fileId]
        );

        if (rows.length === 0) {
            return res.status(404).send('File not found');
        }

        const file = rows[0];
        res.set('Content-Type', file.file_type);
        res.send(file.file_data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};