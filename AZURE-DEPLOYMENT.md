# Azure Deployment Guide - The Felix Project

## Quick Deployment Steps

### Prerequisites
✅ Azure CLI installed: `az --version`
✅ Node.js 18+ installed: `node --version`
✅ Logged into Azure: `az login`
✅ Resource group exists: `felix-allocations-rg`

### Step 1: Initial Deployment (5 minutes)

**Windows:**
```powershell
cd C:\Users\SamiAlexander\supplier-impact-portal
.\deploy-azure.bat
```

**Mac/Linux:**
```bash
cd /path/to/supplier-impact-portal
chmod +x deploy-azure.sh
./deploy-azure.sh
```

This will:
- ✅ Create Azure Static Web App: `felix-supplier-impact`
- ✅ Build frontend and API
- ✅ Deploy to Azure
- ✅ Give you the app URL

### Step 2: Configure Environment Variables (10 minutes)

**Option A: Interactive PowerShell Script (Recommended)**
```powershell
.\configure-azure.ps1
```

**Option B: Manual Configuration**

Set each variable individually:

```bash
# Set resource variables
RESOURCE_GROUP="felix-allocations-rg"
APP_NAME="felix-supplier-impact"

# Communication Services (for OTP emails)
az staticwebapp appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --setting-names \
        COMMUNICATION_SERVICES_CONNECTION_STRING="your-connection-string" \
        SENDER_EMAIL="noreply@felixproject.org"

# Session security
az staticwebapp appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --setting-names \
        SESSION_SECRET="$(openssl rand -hex 32)" \
        FUNCTIONS_WORKER_RUNTIME="node"

# Database
az staticwebapp appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --setting-names \
        DB_SERVER="yourserver.database.windows.net" \
        DB_NAME="SupplierDB" \
        DB_USER="admin" \
        DB_PASSWORD="your-password"

# PowerBI (optional)
az staticwebapp appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --setting-names \
        POWERBI_CLIENT_ID="your-client-id" \
        POWERBI_CLIENT_SECRET="your-client-secret" \
        POWERBI_TENANT_ID="your-tenant-id" \
        POWERBI_WORKSPACE_ID="your-workspace-id" \
        POWERBI_REPORT_ID="your-report-id" \
        POWERBI_DATASET_ID="your-dataset-id"
```

### Step 3: Verify Deployment

Check your app at: `https://felix-supplier-impact.azurestaticapps.net`

Or get the URL:
```bash
az staticwebapp show \
    --name felix-supplier-impact \
    --resource-group felix-allocations-rg \
    --query "defaultHostname" -o tsv
```

### Step 4: Set Up Custom Domain (Optional)

1. In Azure Portal → Static Web Apps → Custom domains
2. Add your domain (e.g., `suppliers.felixproject.org`)
3. Update DNS records as instructed
4. SSL certificate auto-generated

## Update Frontend (Git Push)

### Option 1: GitHub Actions (Automated)

1. Initialize Git repository:
```bash
cd C:\Users\SamiAlexander\supplier-impact-portal
git init
git add .
git commit -m "Initial commit - Felix Project Supplier Portal"
```

2. Create GitHub repository and push:
```bash
git remote add origin https://github.com/yourusername/felix-supplier-portal.git
git branch -M main
git push -u origin main
```

3. Configure GitHub Actions:
   - In Azure Portal → Static Web App → Deployment tokens
   - Copy the token
   - In GitHub → Settings → Secrets → Add `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Push to `main` branch auto-deploys!

### Option 2: Manual Deployment

```bash
# After making frontend changes
npm run build
npx @azure/static-web-apps-cli deploy \
    --app-location ./build \
    --api-location ./api \
    --deployment-token $(az staticwebapp secrets list --name felix-supplier-impact --resource-group felix-allocations-rg --query "properties.apiKey" -o tsv)
```

## Update Backend (Azure CLI)

### Deploy API Changes Only

```bash
# Build API
cd api
npm run build
cd ..

# Deploy
az staticwebapp functions deploy \
    --name felix-supplier-impact \
    --resource-group felix-allocations-rg \
    --function-name api
```

### Deploy Everything

```bash
# Build both
npm run build
cd api && npm run build && cd ..

# Deploy
.\deploy-azure.bat
```

## Monitoring & Management

### View Logs
```bash
az staticwebapp show \
    --name felix-supplier-impact \
    --resource-group felix-allocations-rg
```

### Stream Function Logs
```bash
az staticwebapp functions log \
    --name felix-supplier-impact \
    --resource-group felix-allocations-rg
```

### Restart App
```bash
# Update any setting to trigger restart
az staticwebapp appsettings set \
    --name felix-supplier-impact \
    --resource-group felix-allocations-rg \
    --setting-names RESTART="$(date +%s)"
```

## Quick Commands Reference

```bash
# Check deployment status
az staticwebapp show -n felix-supplier-impact -g felix-allocations-rg

# List all settings
az staticwebapp appsettings list -n felix-supplier-impact -g felix-allocations-rg

# Delete a setting
az staticwebapp appsettings delete -n felix-supplier-impact -g felix-allocations-rg --setting-names KEY_NAME

# Get deployment token
az staticwebapp secrets list -n felix-supplier-impact -g felix-allocations-rg --query "properties.apiKey" -o tsv

# Delete app (if needed)
az staticwebapp delete -n felix-supplier-impact -g felix-allocations-rg
```

## Troubleshooting

### Deployment fails
```bash
# Check Azure CLI is logged in
az account show

# Verify resource group exists
az group show -n felix-allocations-rg

# Check Static Web App exists
az staticwebapp show -n felix-supplier-impact -g felix-allocations-rg
```

### App not updating
```bash
# Clear cache and redeploy
npm run build
rm -rf build/.cache
.\deploy-azure.bat
```

### Functions not working
```bash
# Verify functions are deployed
az staticwebapp functions list -n felix-supplier-impact -g felix-allocations-rg

# Check environment variables are set
az staticwebapp appsettings list -n felix-supplier-impact -g felix-allocations-rg
```

## Cost Estimate

- Azure Static Web App Standard: **£7/month**
- Azure Functions (Consumption): **~£15/month**
- Database queries: **Included in SQL DB**
- **Total: ~£22/month**

## Production Checklist

- [ ] Deploy app: `.\deploy-azure.bat`
- [ ] Configure environment variables: `.\configure-azure.ps1`
- [ ] Set up Communication Services for emails
- [ ] Configure database connection
- [ ] Set up PowerBI (if using)
- [ ] Add custom domain (optional)
- [ ] Test OTP flow
- [ ] Test data access
- [ ] Configure monitoring/alerts
- [ ] Set up backup strategy
- [ ] Document access credentials

## Support

Check deployment logs in Azure Portal:
1. Go to Azure Portal
2. Navigate to Static Web Apps → felix-supplier-impact
3. Click "Deployment history" or "Environment variables"
4. View logs and configure settings

---

**Your app will be live at:** `https://felix-supplier-impact.azurestaticapps.net`

**Resource Group:** `felix-allocations-rg`
**Region:** UK South
