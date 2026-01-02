# Configure Azure Environment Variables
# Run this after deployment to set up your application settings

$RESOURCE_GROUP = "felix-allocations-rg"
$APP_NAME = "felix-supplier-impact"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setting up environment variables" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for configuration values
Write-Host "Please provide the following configuration values:" -ForegroundColor Yellow
Write-Host ""

$COMM_SERVICES = Read-Host "Azure Communication Services connection string"
$SENDER_EMAIL = Read-Host "Sender email address"
$POWERBI_CLIENT_ID = Read-Host "PowerBI Client ID (press Enter to skip)"
$POWERBI_CLIENT_SECRET = Read-Host "PowerBI Client Secret (press Enter to skip)"
$POWERBI_TENANT_ID = Read-Host "PowerBI Tenant ID (press Enter to skip)"
$POWERBI_WORKSPACE_ID = Read-Host "PowerBI Workspace ID (press Enter to skip)"
$POWERBI_REPORT_ID = Read-Host "PowerBI Report ID (press Enter to skip)"
$POWERBI_DATASET_ID = Read-Host "PowerBI Dataset ID (press Enter to skip)"
$DB_SERVER = Read-Host "Database server (e.g., yourserver.database.windows.net)"
$DB_NAME = Read-Host "Database name"
$DB_USER = Read-Host "Database username"
$DB_PASSWORD = Read-Host "Database password" -AsSecureString

# Generate session secret
$SESSION_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

Write-Host ""
Write-Host "Configuring application settings..." -ForegroundColor Green

# Convert secure string to plain text for API
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
$DB_PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set all configuration values
az staticwebapp appsettings set `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --setting-names `
        COMMUNICATION_SERVICES_CONNECTION_STRING="$COMM_SERVICES" `
        SENDER_EMAIL="$SENDER_EMAIL" `
        POWERBI_CLIENT_ID="$POWERBI_CLIENT_ID" `
        POWERBI_CLIENT_SECRET="$POWERBI_CLIENT_SECRET" `
        POWERBI_TENANT_ID="$POWERBI_TENANT_ID" `
        POWERBI_WORKSPACE_ID="$POWERBI_WORKSPACE_ID" `
        POWERBI_REPORT_ID="$POWERBI_REPORT_ID" `
        POWERBI_DATASET_ID="$POWERBI_DATASET_ID" `
        SESSION_SECRET="$SESSION_SECRET" `
        DB_SERVER="$DB_SERVER" `
        DB_NAME="$DB_NAME" `
        DB_USER="$DB_USER" `
        DB_PASSWORD="$DB_PASSWORD_PLAIN" `
        FUNCTIONS_WORKER_RUNTIME="node"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Configuration complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your settings have been configured. The app will restart automatically." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Configuration failed. Please check your inputs and try again." -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
