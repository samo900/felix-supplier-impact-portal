# Supplier Impact Portal

A secure web portal for suppliers to view the impact of their food donations with email-based OTP authentication and row-level security.

## 🚀 Quick Start

**Get running in 15 minutes:**

```bash
# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh && ./setup.sh
```

Then see [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

## ✨ Features

- 🔐 **OTP Authentication**: Email-based one-time password verification
- 🔒 **Row-Level Security**: Data filtered by supplier email/account ID
- 📊 **PowerBI Integration**: Embedded reports with RLS
- 📱 **Responsive Design**: Works on all devices
- ☁️ **Azure Static Web Apps**: Serverless deployment
- 🎨 **Customizable Branding**: Easy color and logo customization
- 📧 **Azure Communication Services**: Professional email delivery

## Project Structure

```📚 Documentation

Comprehensive guides for every aspect of the portal:

| Guide | Description | Time Required |
|-------|-------------|---------------|
| [QUICKSTART.md](QUICKSTART.md) | Get running locally in 15 minutes | ⏱️ 15 min |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploy to Azure production | ⏱️ 2-4 hours |
| [DATABASE-INTEGRATION.md](DATABASE-INTEGRATION.md) | Connect your supplier database | ⏱️ 1-2 hours |
| [POWERBI-RLS-SETUP.md](POWERBI-RLS-SETUP.md) | Configure PowerBI security | ⏱️ 1-2 hours |
| [BRANDING-GUIDE.md](BRANDING-GUIDE.md) | Customize colors, logo, and design | ⏱️ 30 min |
| [SECURITY.md](SECURITY.md) | Security implementation details | ⏱️ 30 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design | ⏱️ 30 min |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions | As needed |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Complete project overview | ⏱️ 15 min |

## 🎯 What You Get

### Complete Authentication System
- ✅ Email-based OTP verification
- ✅ JWT session management
- ✅ Secure token handling
- ✅ Auto-expiration (10 min OTP, 8 hour session)

### Row-Level Security
- ✅ API-level filtering by AccountId
- ✅ Database query filtering
- ✅ PowerBI RLS integration
- ✅ No cross-supplier data leakage

### Beautiful Dashboard
- ✅ Impact statistics (donations, meals, CO₂)
- ✅ Recent donations table
- ✅ PowerBI embedded reports
- ✅ Fully responsive design
- ✅ Mobile-friendly

### Production Ready
- ✅ TypeScript throughout
- ✅ Error handling
- ✅ Loading states
- ✅ Comprehensive docs
- ✅ CI/CD with GitHub Actions
- ✅ Azure deployment configInstall dependencies:
```bash
npm install
cd api && npm install
```

2. Configure environment variables (see `.env.example`)

3. Run locally:
```bash
npm run swa:start
```

4. Deploy to Azure:
```bash
swa deploy
```

## 🛠️ Technology Stack

**Frontend:**
- React 18 + TypeScript
- React Router for navigation
- Axios for API calls
- PowerBI Client React
- CSS Variables for theming

**Backend:**
- Azure Functions (Node.js/TypeScript)
- Azure Communication Services
- JWT authentication
- Row-level security

**Infrastructure:**
- Azure Static Web Apps
- Azure SQL Database
- PowerBI Embedded
- GitHub Actions CI/CD

## ⚡ Quick Commands

```bash
# I🔒 Security Implementation

### Multiple Security Layers
1. **Email Verification** - OTP sent to registered email
2. **JWT Authentication** - Session tokens with expiration
3. **API Authorization** - Token validation on every request
4. **Database RLS** - Queries filtered by AccountId
5. **PowerBI RLS** - Dataset-level security with CustomData

See [SECURITY.md](SECURITY.md) for complete security documentation.

## 🎨 Customization

### Change Brand Colors (2 minutes)

Edit `src/styles/index.css`:

```css
:root {
  --primary-color: #YOUR_COLOR;
  --primary-dark: #YOUR_DARK_COLOR;
  --primary-light: #YOUR_LIGHT_COLOR;
}
```

### Add Your Logo (1 minute)

Replace `public/logo.png` with your organization's logo.

See [BRANDING-GUIDE.md](BRANDING-GUIDE.md) for complete customization options.

## 📊 Current Status

**✅ Complete and Working:**
- Authentication flow with OTP
- JWT session management
- Dashboard UI with mock data
- PowerBI placeholder
- Responsive design
- All security layers
- Comprehensive documentation

**⚙️ Needs Configuration:**
- Azure Communication Services credentials
- Database connection details
- PowerBI service principal
- Your branding assets

**Time to Production: 4-8 hours** (mostly configuration)

## 🆘 Need Help?

1. **Quick issues**: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. **Getting started**: See [QUICKSTART.md](QUICKSTART.md)
3. **Architecture questions**: Read [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Deployment help**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)

## 📝 License

Private - Internal Use Only

---

**Built with ❤️ for food donation impact tracking**
swa deploy

# Test API endpoints
cd api && func start
```

## Security

- OTP codes expire after 10 minutes
- Session tokens expire after 8 hours
- All data queries filter by authenticated supplier email
- PowerBI RLS enforces additional data isolation

## License

Private - Internal Use Only
