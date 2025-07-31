const db = require('../models/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
        const { username, password, city } = req.body;
        
        // Validate input
        if (!username || !password || !city) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check city exists
        const [cityRows] = await db.query('SELECT city_name FROM zambian_cities WHERE city_name = ?', [city]);
        if (cityRows.length === 0) {
            return res.status(400).json({ error: 'Invalid city selection' });
        }

        // Check user exists
        const [userRows] = await db.query('SELECT id, username, password FROM USERS2 WHERE username = ?', [username]);
        if (userRows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = userRows[0];

        // Verify password
        const passwordMatch = user.password && await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.city = city;

        res.json({ 
            success: true, 
            redirect: '/home',
            userId: user.id // Send user ID to client
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.signup = async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;
        
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query('INSERT INTO USERS2 (username, password) VALUES (?, ?)', [username, hashedPassword]);
        
        res.json({ success: true, redirect: '/auth/login' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, redirect: '/auth/login' });
    });
};