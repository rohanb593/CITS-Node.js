const fs = require('fs');
const path = require('path');
const db = require('../models/db');

exports.uploadFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const userId = req.session.userId;
        const metadataFile = path.join('public', 'uploads', `${userId}_metadata.json`);
        let mediaFiles = [];

        if (fs.existsSync(metadataFile)) {
            mediaFiles = JSON.parse(fs.readFileSync(metadataFile));
        }

        const newFiles = req.files.map(file => ({
            name: file.filename,
            original: file.originalname,
            type: file.mimetype,
            size: file.size,
            uploaded: new Date().toISOString()
        }));

        mediaFiles = [...mediaFiles, ...newFiles].slice(-10); // Keep last 10 files

        fs.writeFileSync(metadataFile, JSON.stringify(mediaFiles));

        res.json({ 
            success: true, 
            message: `${req.files.length} files uploaded successfully`,
            files: newFiles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const userId = req.session.userId;
        const filename = req.params.filename;
        const filePath = path.join('public', 'uploads', filename);
        const metadataFile = path.join('public', 'uploads', `${userId}_metadata.json`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        let mediaFiles = [];
        if (fs.existsSync(metadataFile)) {
            mediaFiles = JSON.parse(fs.readFileSync(metadataFile));
        }

        mediaFiles = mediaFiles.filter(file => file.name !== filename);
        fs.writeFileSync(metadataFile, JSON.stringify(mediaFiles));

        fs.unlinkSync(filePath);

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};