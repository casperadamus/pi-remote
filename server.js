const express = require('express');
const cors = require('cors');
const { Client } = require('ssh2');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow requests from your GitHub Pages
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Main endpoint to run SSH commands
app.post('/run-script', async (req, res) => {
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
            console.error('SSH Connection Error:', err.message);
            res.status(500).json({ 
                error: 'Failed to connect to Pi: ' + err.message 
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
            readyTimeout: 5000
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
    console.log(`🚀 Pi Remote Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready to accept commands`);
});
