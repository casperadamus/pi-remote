# Deploy Pi Remote to Railway + GitHub Pages

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (it's free)

### 1.2 Deploy Your Backend
1. Install Railway CLI (optional but easier):
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize and deploy:
   ```bash
   cd /home/casper/Documents/pi-remote
   railway init
   railway up
   ```

   OR use the Railway website:
   - Go to https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your pi-remote repository
   - Railway will automatically detect and deploy your Node.js app

### 1.3 Get Your Railway URL
After deployment, Railway will give you a URL like:
`https://pi-remote-production-xxxx.up.railway.app`

**Copy this URL!** You'll need it for the next step.

## Step 2: Update HTML with Railway URL

1. Open `index.html`
2. Find this line (around line 175):
   ```javascript
   const API_URL = 'http://localhost:3000/run-script';
   ```
3. Replace it with your Railway URL:
   ```javascript
   const API_URL = 'https://your-railway-app.up.railway.app/run-script';
   ```

## Step 3: Deploy Frontend to GitHub Pages

### 3.1 Create GitHub Repository
```bash
cd /home/casper/Documents/pi-remote
git init
git add index.html
git commit -m "Add Pi Remote interface"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pi-remote.git
git push -u origin main
```

### 3.2 Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **main** branch
4. Click **Save**
5. Your site will be live at: `https://YOUR_USERNAME.github.io/pi-remote/`

## Step 4: Test It!

1. Visit your GitHub Pages URL
2. The form should already have your Pi details pre-filled
3. Click "Run Script on Pi"
4. It should connect through Railway to your Pi!

## Important Notes

### Railway Free Tier
- 500 hours/month of runtime (plenty for this)
- Your app will sleep after 15 minutes of inactivity
- First request after sleep might take 10-20 seconds to wake up

### Keep Server Awake (Optional)
If you want instant responses, you can ping your Railway server every 10 minutes:
- Use a service like Uptime Robot (free)
- Ping your Railway URL: `https://your-app.up.railway.app`

### Security
Your password is sent to Railway's server, then to your Pi. This is reasonably secure because:
- Railway uses HTTPS
- Data is encrypted in transit
- For even better security, consider using SSH keys instead of passwords

## Troubleshooting

**"Server is running" but button doesn't work**
- Make sure you updated the `API_URL` in `index.html` with your Railway URL
- Check Railway logs: `railway logs`

**CORS errors in browser console**
- The `server.js` already has CORS enabled
- If you still see errors, check Railway environment variables

**Railway deployment fails**
- Make sure `package.json` has a `start` script
- Railway needs Node.js 18+ (it should auto-detect)

## Cost
Both Railway and GitHub Pages are **100% FREE** for this use case! 🎉
