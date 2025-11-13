# Running Backend on the Pi (BEST SOLUTION)

## On Your Pi:

### 1. SSH into Pi:
```bash
ssh casperadamus@100.94.110.127
```

### 2. Install Node.js and npm (if not already installed):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install dependencies:
```bash
cd ~/pi-remote
npm install
```

### 4. Start the server:
```bash
node server.js
```

### 5. In another SSH session, expose via Tailscale Funnel:
```bash
sudo tailscale funnel 3000
```

This will give you: `https://raspberrypi.tailcb64d2.ts.net/`

### 6. Update index.html (on your computer):
Change the API_URL to:
```javascript
const API_URL = 'https://raspberrypi.tailcb64d2.ts.net/run-script';
```

### 7. Make it auto-start on Pi boot:

Create systemd service:
```bash
sudo nano /etc/systemd/system/pi-remote.service
```

Paste:
```ini
[Unit]
Description=Pi Remote Backend
After=network.target

[Service]
Type=simple
User=casperadamus
WorkingDirectory=/home/casperadamus/pi-remote
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable pi-remote
sudo systemctl start pi-remote
```

Enable Tailscale Funnel on boot:
```bash
sudo tailscale funnel --bg 3000
```

## Why This is Better:

✅ Pi is always on anyway  
✅ No need to keep your computer running  
✅ Pi connects to itself via localhost (instant, no network issues)  
✅ Tailscale Funnel makes it accessible from anywhere  
✅ Auto-restarts if it crashes  

## Final Setup:

- **Frontend**: https://casperadamus.github.io/pi-remote/
- **Backend**: https://raspberrypi.tailcb64d2.ts.net/
- **Pi IP in form**: Use `127.0.0.1` or `localhost` (since it's running on the Pi itself!)
