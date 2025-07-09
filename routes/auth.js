// routes/auth.js
const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');

// Add these routes
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views/login.html'));
});

router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views/signup.html'));
});

// Keep your existing routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);

module.exports = router;