# Quick Start Guide

Get your Supplier Impact Portal running in 15 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ Azure subscription (for deployment)
- ✅ Access to your supplier database

## 5-Minute Local Setup

### Step 1: Install Dependencies (2 minutes)

**Windows:**
```bash
cd C:\Users\SamiAlexander\supplier-impact-portal
setup.bat
```

**Mac/Linux:**
```bash
cd /path/to/supplier-impact-portal
chmod +x setup.sh
./setup.sh
```

**Or manually:**
```bash
npm install
cd api && npm install && cd ..
```

### Step 2: Configure Environment (3 minutes)

Create `api/local.settings.json` from the template:

**Minimum configuration for local testing:**
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "SESSION_SECRET": "your-random-secret-key-here",
    "COMMUNICATION_SERVICES_CONNECTION_STRING": ""
  }
}
```

**Generate a session secret:**
```bash
# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Mac/Linux
openssl rand -hex 32
```

### Step 3: Run the Application (30 seconds)

```bash
npm run swa:start
```

The app will open at: http://localhost:3000

## First Login (Without Email Setup)

The OTP will be displayed in the terminal output during development:

1. Go to http://localhost:3000
2. Enter any email address (e.g., `test@example.com`)
3. Click "Send Verification Code"
4. Check the terminal/console output for the 6-digit code
5. Enter the code and login

You'll see a demo dashboard with mock data!

## Customize Your Branding (5 minutes)

### Update Colors

Edit `src/styles/index.css`:

```css
:root {
  --primary-color: #YOUR_COLOR;
  --primary-dark: #YOUR_DARK_COLOR;
  --primary-light: #YOUR_LIGHT_COLOR;
}
```

### Add Your Logo

1. Place your logo at `public/logo.png`
2. Refresh the browser

### Update Organization Name

Edit `src/components/Login.tsx`:

```tsx
<h1>Your Organization Name</h1>
<p>Your custom tagline</p>
```

## Connect to Real Data (10 minutes)

See [DATABASE-INTEGRATION.md](DATABASE-INTEGRATION.md) for detailed instructions.

**Quick version:**

1. Install SQL package:
```bash
cd api
npm install mssql
```

2. Update `api/local.settings.json`:
```json
{
  "Values": {
    "DB_SERVER": "your-server.database.windows.net",
    "DB_NAME": "YourDatabase",
    "DB_USER": "username",
    "DB_PASSWORD": "password"
  }
}
```

3. Update the API functions to query your database (see DATABASE-INTEGRATION.md)

## Deploy to Azure (Production)

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

**Quick deployment:**

1. Create Azure Static Web App in Azure Portal
2. Connect to your GitHub repository
3. Azure automatically deploys on push
4. Configure environment variables in Azure Portal

## Common Issues & Solutions

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

### Issue: Azure Functions not starting

**Solution:**
1. Check `api/local.settings.json` exists
2. Verify `FUNCTIONS_WORKER_RUNTIME` is set to "node"
3. Install Azure Functions Core Tools:
```bash
npm install -g azure-functions-core-tools@4
```

### Issue: OTP not displaying

**Solution:**
The OTP is logged to the console when `COMMUNICATION_SERVICES_CONNECTION_STRING` is not configured. Check your terminal output.

### Issue: React app won't compile

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

## Development Workflow

### 1. Start development server
```bash
npm run swa:start
```

### 2. Make changes to code

### 3. Browser automatically reloads

### 4. Check console for errors

### 5. Test authentication flow

## Project Structure Overview

```
supplier-impact-portal/
├── src/
│   ├── components/         # React components
│   │   ├── Login.tsx      # OTP authentication
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   └── PowerBIEmbed.tsx
│   ├── services/          # API client
│   ├── contexts/          # React context (auth)
│   └── styles/            # CSS files
├── api/
│   ├── sendOTP/          # Send OTP email
│   ├── verifyOTP/        # Verify OTP code
│   ├── getSupplierData/  # Get supplier data
│   └── getPowerBIToken/  # Generate PowerBI token
└── public/               # Static files
```

## Testing Checklist

- [ ] Login page loads
- [ ] Can send OTP (check console)
- [ ] Can verify OTP and login
- [ ] Dashboard displays
- [ ] Mock data shows correctly
- [ ] Can logout
- [ ] Can login again
- [ ] Responsive on mobile
- [ ] Colors match branding
- [ ] Logo displays

## Next Steps

Once your local setup is working:

1. ✅ **Connect real database** - See DATABASE-INTEGRATION.md
2. ✅ **Setup Azure Communication Services** - For real emails
3. ✅ **Configure PowerBI** - See POWERBI-RLS-SETUP.md
4. ✅ **Deploy to Azure** - See DEPLOYMENT.md
5. ✅ **Add custom branding** - See BRANDING-GUIDE.md
6. ✅ **Review security** - See SECURITY.md

## Getting Help

1. Check the detailed guides:
   - [DATABASE-INTEGRATION.md](DATABASE-INTEGRATION.md)
   - [POWERBI-RLS-SETUP.md](POWERBI-RLS-SETUP.md)
   - [DEPLOYMENT.md](DEPLOYMENT.md)
   - [SECURITY.md](SECURITY.md)

2. Check browser console for errors (F12)

3. Check terminal output for backend errors

4. Review Azure Function logs in Azure Portal

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server
npm run swa:start

# Build for production
npm run build

# Install API dependencies
cd api && npm install

# Test API function locally
cd api && func start

# Deploy to Azure (with SWA CLI)
swa deploy
```

## You're Ready! 🚀

Your Supplier Impact Portal is now set up! Start customizing it to match your organization's needs.

**Current Status:**
- ✅ Authentication system with OTP
- ✅ Row-level security implemented
- ✅ Dashboard with impact metrics
- ✅ PowerBI embedding ready
- ✅ Responsive design
- ✅ Production-ready architecture

**What's working right now:**
- Complete authentication flow
- Demo data display
- PowerBI placeholder
- All UI components
- Responsive layout

**What needs configuration:**
- Real email sending
- Database connection
- PowerBI credentials
- Your branding
- Production deployment

Enjoy building your supplier portal! 🎉
