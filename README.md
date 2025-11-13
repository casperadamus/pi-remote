# Pi Remote Control

Simple HTML interface to run scripts on your Raspberry Pi via SSH.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 3. Open the HTML Interface

Simply open `index.html` in your browser, or host it on GitHub Pages.

## How It Works

- **Frontend**: Simple HTML page with JavaScript that sends requests to the backend
- **Backend**: Node.js server that handles SSH connections to your Pi
- The backend runs the command in the background on your Pi so the response is instant

## Deployment Options

### Option 1: Run Locally (Easiest)

1. Run `npm start` on your computer
2. Open `index.html` in your browser
3. Click the button to control your Pi

### Option 2: GitHub Pages + Local Server

1. Push `index.html` to a GitHub repository
2. Enable GitHub Pages for that repo
3. Run `npm start` on your computer
4. Access the GitHub Pages URL
5. **Note**: You'll need to update the `API_URL` in `index.html` to `http://localhost:3000/run-script`

### Option 3: Deploy Backend to Cloud (Advanced)

Deploy the backend to services like:
- **Railway.app** (free tier available)
- **Render.com** (free tier available)
- **Heroku**
- **Your own server**

Then update the `API_URL` in `index.html` to your deployed backend URL.

## Configuration

Edit the default values in `index.html` or change them in the interface:

- **Pi IP Address**: Your Raspberry Pi's IP (e.g., `100.94.110.127`)
- **Username**: Your Pi username (e.g., `casperadamus`)
- **Password**: Your Pi password
- **Command**: The command to run (e.g., `python3 lighton.py`)

## Security Notes

⚠️ **Important**: This sends credentials in plain text. Only use on trusted networks or deploy with HTTPS.

For better security:
- Use SSH keys instead of passwords
- Deploy the backend with HTTPS
- Don't hardcode credentials in the HTML

## Troubleshooting

**"Error connecting to server"**
- Make sure the Node.js server is running (`npm start`)
- Check that the `API_URL` in `index.html` matches your server address

**"Failed to connect to Pi"**
- Verify the Pi's IP address is correct
- Check that SSH is enabled on your Pi
- Ensure your Pi is on the same network (or use Tailscale if you're using that)

**"Connection timeout"**
- Your Pi might be offline or unreachable
- Check firewall settings
