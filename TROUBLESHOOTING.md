# Troubleshooting Guide

Common issues and their solutions for the Supplier Impact Portal.

## Installation Issues

### npm install fails

**Error**: `npm ERR! code EACCES`

**Solution**:
```bash
# Windows: Run as administrator
# Mac/Linux: Fix npm permissions
sudo chown -R $USER /usr/local/lib/node_modules
```

**Error**: `ERESOLVE unable to resolve dependency tree`

**Solution**:
```bash
npm install --legacy-peer-deps
```

### Azure Functions Core Tools not installing

**Error**: `Unable to install azure-functions-core-tools`

**Solution**:
```bash
# Download and install manually from:
# https://github.com/Azure/azure-functions-core-tools/releases

# Or use Chocolatey (Windows):
choco install azure-functions-core-tools

# Or use Homebrew (Mac):
brew tap azure/functions
brew install azure-functions-core-tools@4
```

## Runtime Issues

### Port already in use

**Error**: `Port 3000 is already in use`

**Solution Windows**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

**Solution Mac/Linux**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### Azure Functions not starting

**Error**: `The listener for function 'sendOTP' was unable to start`

**Solution**:
1. Check `api/local.settings.json` exists
2. Verify format is valid JSON
3. Ensure `FUNCTIONS_WORKER_RUNTIME` is set to `"node"`
4. Restart the development server

**Error**: `Cannot find module '@azure/functions'`

**Solution**:
```bash
cd api
npm install
cd ..
npm run swa:start
```

### TypeScript compilation errors

**Error**: `Cannot find name 'process'`

**Solution**:
```bash
cd api
npm install --save-dev @types/node
```

**Error**: `Cannot find module 'crypto'`

**Solution**: Change import in `api/verifyOTP/index.ts`:
```typescript
// From:
import * as crypto from "crypto";

// To:
import { randomBytes } from "crypto";
```

## Authentication Issues

### OTP not appearing in console

**Check**:
1. Look for the line starting with `OTP for` in terminal output
2. Verify `COMMUNICATION_SERVICES_CONNECTION_STRING` is empty (for dev mode)
3. Check browser network tab for `/api/sendOTP` response

**Development workaround**:
The API returns the OTP in the response when no email service is configured:
```json
{
  "message": "OTP sent successfully",
  "dev_otp": "123456"
}
```

### OTP verification fails

**Error**: `Invalid or expired OTP`

**Causes**:
1. OTP expired (10 minutes)
2. Typo in OTP code
3. Server restarted (in-memory storage cleared)

**Solution**:
1. Request a new OTP
2. Enter code immediately
3. For production, use Redis instead of in-memory storage

### JWT token invalid

**Error**: `Unauthorized - Invalid token`

**Causes**:
1. Token expired (8 hours)
2. SESSION_SECRET changed
3. Token malformed

**Solution**:
1. Logout and login again
2. Clear localStorage: `localStorage.clear()`
3. Check SESSION_SECRET consistency

### Session not persisting

**Issue**: Logged out after page refresh

**Solution**:
1. Check browser console for localStorage errors
2. Ensure cookies/storage not blocked
3. Check if in private/incognito mode
4. Try different browser

## Data Access Issues

### "No data found for this supplier"

**Causes**:
1. AccountId doesn't exist in database
2. Database connection failed
3. Query error

**Debug**:
```typescript
// Add logging to api/getSupplierData/index.ts
console.log('Fetching data for accountId:', accountId);
console.log('Query result:', supplierData);
```

**Solution**:
1. Verify email exists in Suppliers table
2. Check database connection string
3. Test query directly in database

### Database connection fails

**Error**: `ConnectionError: Failed to connect to database`

**Check**:
1. Connection string format
2. Database server is accessible
3. Firewall rules allow Azure Functions
4. Credentials are correct

**Solution**:
```bash
# Test connection from terminal
sqlcmd -S your-server.database.windows.net -d YourDB -U username -P password
```

**Azure SQL specific**:
- Add Azure Function IP to firewall rules
- Or enable "Allow Azure services"

## PowerBI Issues

### PowerBI report not loading

**Error**: `Failed to load PowerBI report`

**Causes**:
1. Invalid embed token
2. Report ID incorrect
3. Service principal lacks permissions
4. RLS configuration issue

**Solution**:
1. Verify `POWERBI_REPORT_ID` in configuration
2. Check service principal has workspace access
3. Test embed URL directly in browser
4. Review PowerBI service logs

### RLS not filtering data correctly

**Issue**: Supplier sees all data or no data

**Debug**:
1. Test RLS in PowerBI Desktop with "View as Role"
2. Check CUSTOMDATA() value being passed
3. Verify AccountId matches exactly (case-sensitive)

**Solution**:
```dax
// Add debug measure in PowerBI
Debug = "CustomData: " & CUSTOMDATA()
```

Then check what value is being received.

### Embed token expired

**Error**: `Token expired`

**Solution**: Token automatically refreshes after 1 hour. If not:
```typescript
// Force token refresh
const newToken = await dataService.getPowerBIToken(token);
```

## Email Issues

### OTP emails not sending

**Error**: Email never arrives

**Check**:
1. Azure Communication Services connection string
2. Email domain verified
3. Sender email from verified domain
4. Recipient not in spam folder
5. Email quota not exceeded

**Solution**:
```bash
# Test email sending directly
curl -X POST http://localhost:7071/api/sendOTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check response for errors
```

### Email in spam folder

**Solution**:
1. Add SPF and DKIM records
2. Use verified domain
3. Improve email content (less "spammy")
4. Add unsubscribe link (for production)

## Build Issues

### React build fails

**Error**: `Failed to compile`

**Common causes**:
1. TypeScript errors
2. Import errors
3. Missing dependencies

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

### API build fails

**Error**: `Cannot find module`

**Solution**:
```bash
cd api
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Deployment Issues

### Azure deployment fails

**Error**: `Failed to deploy to Azure`

**Check**:
1. GitHub Actions workflow logs
2. Azure Portal deployment center
3. Application settings configured

**Solution**:
1. Verify AZURE_STATIC_WEB_APPS_API_TOKEN secret
2. Check build configuration in workflow
3. Review Azure portal logs

### Environment variables not working in Azure

**Issue**: App works locally but not in Azure

**Solution**:
1. Go to Azure Portal → Your Static Web App
2. Click "Configuration"
3. Add all variables from `local.settings.json`
4. Save and restart

### Static Web App authentication not working

**Issue**: Authentication provider not configured

**Solution**:
```json
// Add to staticwebapp.config.json
{
  "auth": {
    "identityProviders": {
      "customOpenIdConnectProviders": {}
    }
  }
}
```

## Performance Issues

### Slow page load

**Causes**:
1. Large bundle size
2. Unoptimized images
3. No caching

**Solution**:
```bash
# Analyze bundle size
npm run build
# Check build/static/js/* file sizes

# Optimize images
# Use WebP format
# Add lazy loading
```

### Slow API responses

**Causes**:
1. No database indexes
2. N+1 query problem
3. No caching
4. Cold start (Functions)

**Solution**:
```sql
-- Add indexes
CREATE INDEX IX_Donations_AccountId ON Donations(AccountId);
CREATE INDEX IX_Donations_Date ON Donations(DonationDate);
```

### High memory usage

**Issue**: Functions running out of memory

**Solution**:
1. Reduce query result size
2. Implement pagination
3. Use streaming for large datasets
4. Increase Function memory allocation

## Browser Issues

### CORS errors

**Error**: `Access-Control-Allow-Origin`

**Solution**:
Add to `api/host.json`:
```json
{
  "extensions": {
    "http": {
      "routePrefix": "api",
      "customHeaders": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    }
  }
}
```

### LocalStorage not working

**Error**: `Cannot read property 'getItem' of null`

**Causes**:
1. Cookies disabled
2. Private browsing mode
3. Storage quota exceeded

**Solution**:
1. Enable cookies/storage
2. Use regular browser mode
3. Clear localStorage

### PowerBI iframe blocked

**Error**: `Refused to display in iframe`

**Solution**:
Update CSP in `staticwebapp.config.json`:
```json
{
  "globalHeaders": {
    "content-security-policy": "frame-src 'self' https://*.powerbi.com;"
  }
}
```

## Development Workflow Issues

### Hot reload not working

**Issue**: Changes don't reflect in browser

**Solution**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear cache
3. Restart development server
4. Check terminal for compile errors

### Git issues

**Error**: `fatal: not a git repository`

**Solution**:
```bash
cd supplier-impact-portal
git init
git add .
git commit -m "Initial commit"
```

## Debugging Tools

### Enable verbose logging

Add to `api/host.json`:
```json
{
  "logging": {
    "logLevel": {
      "default": "Information",
      "Function": "Information"
    }
  }
}
```

### Browser DevTools

**Check Console**: F12 → Console tab
- JavaScript errors
- API response errors
- Network requests

**Check Network**: F12 → Network tab
- API call status
- Response bodies
- Request headers

**Check Application**: F12 → Application tab
- localStorage values
- Session storage
- Cookies

### Test API directly

```bash
# Test sendOTP
curl -X POST http://localhost:7071/api/sendOTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test verifyOTP
curl -X POST http://localhost:7071/api/verifyOTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Test getSupplierData (with token)
curl -X GET http://localhost:7071/api/getSupplierData \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Getting Additional Help

### Check logs

**Local development**:
- Terminal output
- Browser console (F12)
- Network tab

**Azure production**:
- Azure Portal → Function App → Logs
- Application Insights
- Log Stream

### Enable Application Insights

1. Create Application Insights resource
2. Add connection string to Azure Function settings:
```
APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string
```

### Common error codes

- **400**: Bad request - check request body
- **401**: Unauthorized - check token
- **403**: Forbidden - check permissions
- **404**: Not found - check endpoint URL
- **500**: Server error - check logs

### Still stuck?

1. Review the documentation:
   - README.md
   - QUICKSTART.md
   - ARCHITECTURE.md
   - Other guide files

2. Check your configuration:
   - `api/local.settings.json`
   - `staticwebapp.config.json`
   - Environment variables

3. Test components individually:
   - Frontend only: `npm start`
   - API only: `cd api && func start`
   - Database: Test queries directly

4. Create a minimal reproduction:
   - Isolate the issue
   - Test with mock data
   - Remove unnecessary code

5. Review Azure documentation:
   - [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/)
   - [Azure Functions](https://learn.microsoft.com/azure/azure-functions/)
   - [PowerBI Embedded](https://learn.microsoft.com/power-bi/developer/embedded/)

Remember: Most issues are configuration-related. Double-check all connection strings, IDs, and environment variables!
