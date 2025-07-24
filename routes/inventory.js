// routes/inventory.js
const express = require('express');
const path = require('path');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Serve the inventory page


// routes/inventory.js
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/inventory.html'));
});

// API endpoints
router.get('/api', inventoryController.getInventory);
router.get('/api/sse', inventoryController.sseInventory);
// Add this to your existing inventory.js routes
router.get('/api/sse', inventoryController.sseInventoryUpdates);

module.exports = router;