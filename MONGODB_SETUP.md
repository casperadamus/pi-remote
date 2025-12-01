# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for authentication in your Pi Remote Control app.

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account (you can use Google/GitHub login)
3. Complete the registration

## Step 2: Create a Free Cluster

1. Choose **M0 FREE** tier (512MB storage - perfect for this use case)
2. Select a cloud provider and region (choose one closest to you)
3. Name your cluster (default is fine, e.g., "Cluster0")
4. Click **Create Cluster** (takes 3-5 minutes to provision)

## Step 3: Set Up Database Access

1. In the left sidebar, click **Database Access** (under Security)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a username and password (save these!)
   - Example: username: `pi-remote-admin`, password: `[generate a strong password]`
5. Under **Database User Privileges**, select **Read and write to any database**
6. Click **Add User**

## Step 4: Set Up Network Access

1. In the left sidebar, click **Network Access** (under Security)
2. Click **Add IP Address**
3. For testing, you can click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ For production, limit this to your server's IP address
4. Click **Confirm**

## Step 5: Get Your Connection String

1. Go back to **Database** in the left sidebar
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Select **Driver: Node.js** and **Version: 5.5 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` with your database username
7. Replace `<password>` with your database password
8. Add `/pi_remote` before the `?` to specify the database name

**Final connection string example:**
```
mongodb+srv://pi-remote-admin:YourPassword123@cluster0.abc123.mongodb.net/pi_remote?retryWrites=true&w=majority
```

## Step 6: Configure Your Server

1. Open `server.js`
2. Find this line near the top:
   ```javascript
   const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/pi_remote?retryWrites=true&w=majority';
   ```
3. Replace the default connection string with your actual connection string

**Or better yet, use environment variables:**

Create a `.env` file in your project root:
```env
MONGO_URI=mongodb+srv://pi-remote-admin:YourPassword123@cluster0.abc123.mongodb.net/pi_remote?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here-make-it-long-and-random
```

Then install dotenv:
```bash
npm install dotenv
```

And add this to the top of `server.js`:
```javascript
require('dotenv').config();
```

## Step 7: Create Your First User

You have two options:

### Option A: Use MongoDB Atlas UI (Easiest)

1. In MongoDB Atlas, click **Database** → **Browse Collections**
2. If no database exists, click **Add My Own Data**
   - Database name: `pi_remote`
   - Collection name: `users`
3. Click **Insert Document**
4. Switch to **{}** (code view) and paste:
   ```json
   {
     "username": "admin",
     "password": "$2a$10$YourHashedPasswordHere",
     "createdAt": {"$date": "2025-12-01T00:00:00.000Z"}
   }
   ```
   
   **You need to generate a hashed password first!**

### Option B: Use the /register Endpoint (Recommended)

1. Start your server:
   ```bash
   npm start
   ```

2. Make a POST request to create a user (using curl, Postman, or your browser console):
   
   **Using curl:**
   ```bash
   curl -X POST http://localhost:3000/register \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"your-secure-password"}'
   ```
   
   **Using browser console (F12):**
   ```javascript
   fetch('http://localhost:3000/register', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       username: 'admin',
       password: 'your-secure-password'
     })
   })
   .then(r => r.json())
   .then(console.log);
   ```

3. You should see: `{"message":"User created successfully","username":"admin"}`

## Step 8: Test the Login

1. Start your server: `npm start`
2. Open `index.html` in your browser
3. You should see a login form
4. Enter the username and password you created
5. Click Login
6. If successful, you'll see the Pi control panel!

## Troubleshooting

### "Database not connected" error
- Check your connection string is correct
- Make sure you replaced `<username>` and `<password>` with actual values
- Verify your IP address is whitelisted in Network Access
- Check the MongoDB cluster is running (not paused)

### "Invalid username or password" error
- Make sure you created a user (see Step 7)
- Check the username and password are correct
- Usernames are case-sensitive

### Connection timeout
- Check your Network Access settings
- Make sure your internet connection is stable
- Try using "Allow Access from Anywhere" for testing

## Security Notes

⚠️ **Important for Production:**

1. **Never commit** your MongoDB connection string to GitHub
2. Use environment variables (`.env` file)
3. Add `.env` to `.gitignore`
4. Change the default `JWT_SECRET` to something random and secure
5. Restrict Network Access to specific IP addresses
6. Use strong passwords for database users
7. Consider adding rate limiting to prevent brute force attacks

## Optional: Disable Registration Endpoint

Once you've created all the users you need, you can comment out or remove the `/register` endpoint in `server.js` to prevent unauthorized user creation.

---

**You're all set!** Your Pi Remote Control now has MongoDB Atlas authentication. 🎉
