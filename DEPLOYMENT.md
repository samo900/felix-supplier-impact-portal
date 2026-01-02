# Deployment Guide

## Prerequisites

1. **Azure Account** with access to:
   - Azure Static Web Apps
   - Azure Functions
   - Azure Communication Services
   - PowerBI Premium/Embedded capacity

2. **PowerBI Setup**:
   - Report created with supplier data
   - Row-Level Security (RLS) configured
   - Service Principal with report access

3. **Database**:
   - Supplier table with email and accountId columns
   - Donations/impact data tables

## Step 1: Azure Communication Services Setup

1. Create an Azure Communication Services resource
2. Get a verified email domain or use Azure Managed Domain
3. Copy the connection string
4. Add to `local.settings.json`: `COMMUNICATION_SERVICES_CONNECTION_STRING`

## Step 2: PowerBI Configuration

### Create Service Principal

```bash
# Create Azure AD App Registration
az ad app create --display-name "supplier-portal-powerbi"

# Create service principal
az ad sp create --id <app-id>

# Create client secret
az ad app credential reset --id <app-id>
```

### Configure PowerBI RLS

In your PowerBI dataset, create a role called "Supplier":

```dax
[AccountId] = USERPRINCIPALNAME()
```

Or if using custom data:

```dax
[AccountId] = CUSTOMDATA()
```

### Grant PowerBI Access

1. Go to PowerBI workspace settings
2. Add the service principal with "Contributor" role
3. Enable service principal access in PowerBI admin portal

## Step 3: Database Integration

Update the following files with your database queries:

### `api/sendOTP/index.ts`

Replace `getAccountIdForEmail()` function:

```typescript
async function getAccountIdForEmail(email: string): Promise<string | null> {
  const pool = await sql.connect(process.env.DATABASE_CONNECTION_STRING!);
  const result = await pool.request()
    .input('email', sql.VarChar, email)
    .query('SELECT accountId FROM suppliers WHERE email = @email');
  
  return result.recordset[0]?.accountId || null;
}
```

### `api/getSupplierData/index.ts`

Replace `fetchSupplierData()` function with actual queries to your database.

## Step 4: Local Development

1. Install dependencies:

```bash
npm install
cd api && npm install && cd ..
```

2. Create `api/local.settings.json` from template

3. Install Azure Static Web Apps CLI:

```bash
npm install -g @azure/static-web-apps-cli
```

4. Run locally:

```bash
npm run swa:start
```

## Step 5: Deploy to Azure

### Option A: GitHub Actions (Recommended)

1. Create GitHub repository
2. Push code to GitHub
3. Create Azure Static Web App from Azure Portal
4. Link to GitHub repository
5. Azure creates automatic deployment workflow

### Option B: Azure CLI

```bash
# Build the project
npm run build
cd api && npm run build && cd ..

# Deploy using SWA CLI
swa deploy --app-location ./build --api-location ./api
```

## Step 6: Configure Environment Variables in Azure

In Azure Portal → Static Web App → Configuration:

Add all variables from `local.settings.json` as application settings.

## Step 7: Configure Custom Domain (Optional)

1. In Azure Portal → Static Web App → Custom domains
2. Add your domain
3. Update DNS records
4. Enable SSL

## Security Checklist

- [ ] Remove `dev_otp` from production sendOTP response
- [ ] Configure SESSION_SECRET with strong random string
- [ ] Enable Azure AD authentication in production (optional)
- [ ] Set up Application Insights for monitoring
- [ ] Configure CORS policies
- [ ] Enable Azure Static Web App authentication (optional)
- [ ] Review and update CSP headers in staticwebapp.config.json
- [ ] Implement rate limiting on OTP endpoints
- [ ] Set up alert rules for failed authentication attempts

## Monitoring

1. Enable Application Insights
2. Monitor OTP send/verify success rates
3. Track PowerBI token generation
4. Monitor API response times
5. Set up alerts for errors

## Troubleshooting

### OTP emails not sending

- Check Communication Services connection string
- Verify email domain is verified
- Check sender email is from verified domain

### PowerBI not loading

- Verify service principal has workspace access
- Check RLS configuration
- Ensure embed tokens are being generated
- Verify report and workspace IDs

### Authentication failing

- Check SESSION_SECRET is consistent
- Verify JWT token expiration settings
- Check browser localStorage for tokens

## Production Considerations

1. **Storage**: Replace in-memory OTP store with Redis or Azure Table Storage
2. **Database**: Add connection pooling and error handling
3. **Caching**: Implement caching for supplier data
4. **Rate Limiting**: Add rate limiting on authentication endpoints
5. **Logging**: Implement structured logging
6. **Monitoring**: Set up comprehensive monitoring and alerts
