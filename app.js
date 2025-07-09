const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const inventoryRoutes = require('./routes/inventory');
const homeRoutes = require('./routes/home');

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/inventory', inventoryRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});