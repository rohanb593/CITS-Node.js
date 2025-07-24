const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'Corporate IT Solutions',
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const inventoryRoutes = require('./routes/inventory');
const homeRoutes = require('./routes/home');

app.get('/', (req, res) => {
    res.redirect('/auth/login');
});
app.use('/auth', authRoutes);
app.use('/home', homeRoutes);
app.use('/upload', uploadRoutes);
app.use('/inventory', inventoryRoutes);

// Session verification middleware
const verifySession = (req, res, next) => {
    console.log('Session Check:', req.session); // Add this
    if (!req.session.userId) {
      console.warn('Unauthorized access attempt to:', req.originalUrl);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }
    next();
};

// Apply to protected routes
app.use('/upload', verifySession);
app.use('/inventory', verifySession);
app.use('/home', verifySession);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});