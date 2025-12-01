const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client } = require('ssh2');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 3000;

// MongoDB Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://user:<1016>@cluster0.fx7gw74.mongodb.net/?appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

let db;
let usersCollection;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        const client = await MongoClient.connect(MONGO_URI);
        db = client.db('pi_remote');
        usersCollection = db.collection('users');
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.log('Server will run without authentication until MongoDB is configured');
    }
}

connectToDatabase();

// Middleware
app.use(cors()); // Allow requests from your GitHub Pages
app.use(express.json());

// Serve static files (index.html)
app.use(express.static(path.join(__dirname)));

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    if (!usersCollection) {
        return res.status(503).json({ error: 'Database not connected. Please configure MongoDB.' });
    }

    try {
        // Find user in database
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { username: user.username, userId: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Verify token endpoint
app.get('/verify-token', authenticateToken, (req, res) => {
    res.json({ valid: true, username: req.user.username });
});

// Register endpoint (optional - for adding new users)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    if (!usersCollection) {
        return res.status(503).json({ error: 'Database not connected. Please configure MongoDB.' });
    }

    try {
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await usersCollection.insertOne({
            username,
            password: hashedPassword,
            createdAt: new Date()
        });

        res.json({
            message: 'User created successfully',
            username
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Main endpoint to run SSH commands (now protected)
app.post('/run-script', authenticateToken, async (req, res) => {
    const { piIp, piUser, piPass, command } = req.body;

    // Validate inputs
    if (!piIp || !piUser || !piPass || !command) {
        return res.status(400).json({ 
            error: 'Missing required fields: piIp, piUser, piPass, command' 
        });
    }

    const conn = new Client();
    let hasResponded = false;

    // Set a timeout for the entire operation
    const timeout = setTimeout(() => {
        if (!hasResponded) {
            hasResponded = true;
            conn.end();
            res.status(504).json({ 
                error: 'Connection timeout. Check if Pi is reachable.' 
            });
        }
    }, 10000); // 10 second timeout

    conn.on('ready', () => {
        console.log('SSH Connection established');
        
        // Run command in background so it doesn't block
        const backgroundCommand = `${command} > /tmp/script.log 2>&1 &`;
        
        conn.exec(backgroundCommand, (err, stream) => {
            if (err) {
                clearTimeout(timeout);
                if (!hasResponded) {
                    hasResponded = true;
                    conn.end();
                    return res.status(500).json({ 
                        error: 'Failed to execute command: ' + err.message 
                    });
                }
                return;
            }

            stream.on('close', (code, signal) => {
                clearTimeout(timeout);
                conn.end();
                
                if (!hasResponded) {
                    hasResponded = true;
                    console.log(`Command executed with exit code: ${code}`);
                    res.json({ 
                        message: 'Command sent to Pi successfully!',
                        command: command,
                        exitCode: code
                    });
                }
            });

            stream.on('data', (data) => {
                console.log('STDOUT: ' + data);
            });

            stream.stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    });

    conn.on('error', (err) => {
        clearTimeout(timeout);
        if (!hasResponded) {
            hasResponded = true;
            console.error('SSH Connection Error:', err);
            const errorMsg = err.message || err.code || err.level || 'Unknown SSH error';
            res.status(500).json({ 
                error: 'Failed to connect to Pi: ' + errorMsg 
            });
        }
    });

    // Connect to the Pi
    try {
        conn.connect({
            host: piIp,
            port: 22,
            username: piUser,
            password: piPass,
            readyTimeout: 5000,
            tryKeyboard: true,
            algorithms: {
                serverHostKey: ['ssh-rsa', 'ssh-dss', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521'],
            }
        });
    } catch (err) {
        clearTimeout(timeout);
        if (!hasResponded) {
            hasResponded = true;
            res.status(500).json({ 
                error: 'Connection failed: ' + err.message 
            });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Pi Remote Server running on http://localhost:${PORT}`);
    console.log(`Ready to accept commands`);
});
