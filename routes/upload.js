const express = require('express');
const path = require('path'); 
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const multer = require('multer');

// Configure multer for temporary storage
const upload = multer({ 
    dest: 'temp_uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Serve the upload page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/upload.html'));
});

// Get user's media
router.get('/media', uploadController.getUserMedia);

// Get specific media file
router.get('/media/:id', uploadController.getMediaFile);

// Handle file upload
router.post('/', upload.array('mediaFiles', 5), uploadController.uploadFiles);

// Handle file deletion
router.delete('/:id', uploadController.deleteFile);

module.exports = router;