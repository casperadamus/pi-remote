# Run Backend Locally with Tailscale Funnel

## Setup (One-time)

### 1. Install dependencies (already done):
```bash
cd /home/casper/Documents/pi-remote
npm install
```

### 2. Start your backend server:
```bash
node server.js
```

### 3. Expose it via Tailscale Funnel:
In another terminal:
```bash
tailscale funnel 3000
```

This will give you a public URL like:
`https://your-computer.tailcb64d2.ts.net`

### 4. Update index.html:
Replace the API_URL with your Tailscale Funnel URL:
```javascript
const API_URL = 'https://your-computer.tailcb64d2.ts.net/run-script';
```

### 5. Push to GitHub:
```bash
git add index.html
git commit -m "Update to Tailscale Funnel URL"
git push origin main
```

## Usage

1. Keep your computer on with `node server.js` running
2. Keep Tailscale Funnel running: `tailscale funnel 3000`
3. Access from anywhere: https://casperadamus.github.io/pi-remote/

## Why This Works

- Your computer has Tailscale → can reach Pi's Tailscale IP
- Tailscale Funnel exposes your backend to the internet
- GitHub Pages hosts the HTML
- Backend running on your computer connects to Pi via Tailscale

## Alternative: Auto-start on Boot

To make the server start automatically:

### Create systemd service:
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
User=casper
WorkingDirectory=/home/casper/Documents/pi-remote
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable pi-remote
sudo systemctl start pi-remote
```
