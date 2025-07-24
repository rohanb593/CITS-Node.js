const express = require('express');
const path = require('path'); 
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const multer = require('multer');

// Configure multer for temporary storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp_uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// In upload.js - modify the multer configuration
const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'), false);
        }
    }
});

// Change the upload route to remove the file count limit for images
router.post('/', upload.array('mediaFiles'), uploadController.uploadFiles);

// Serve the upload page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/upload.html'));
});

// Get user's media
router.get('/media', uploadController.getUserMedia);

// Handle file upload
router.post('/', upload.array('mediaFiles', 5), uploadController.uploadFiles);

// Handle file deletion
router.delete('/:id', uploadController.deleteFile);

module.exports = router;