@echo off
REM Azure Deployment Script for The Felix Project Supplier Impact Portal

echo =========================================
echo The Felix Project - Supplier Impact Portal
echo Azure Deployment Script
echo =========================================
echo.

REM Configuration
set RESOURCE_GROUP=felix-allocations-rg
set LOCATION=uksouth
set APP_NAME=felix-supplier-impact
set FUNCTION_APP_NAME=felix-supplier-api
set STORAGE_ACCOUNT=felixsupplierstore

REM Check if logged in to Azure
echo [1/8] Checking Azure login...
az account show >nul 2>&1
if errorlevel 1 (
    echo Not logged in to Azure. Please run: az login
    exit /b 1
)
echo ✓ Logged in to Azure
echo.

REM Check resource group exists
echo [2/8] Checking resource group...
az group show --name %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo ERROR: Resource group '%RESOURCE_GROUP%' not found
    echo Please create it first or update the RESOURCE_GROUP variable
    exit /b 1
)
echo ✓ Resource group exists: %RESOURCE_GROUP%
echo.

REM Create Static Web App
echo [3/8] Creating Azure Static Web App...
az staticwebapp show --name %APP_NAME% --resource-group %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo Creating new Static Web App...
    az staticwebapp create --name %APP_NAME% --resource-group %RESOURCE_GROUP% --location %LOCATION% --sku Standard --source "Local"
    if errorlevel 1 (
        echo ERROR: Failed to create Static Web App
        exit /b 1
    )
) else (
    echo Static Web App already exists
)
echo ✓ Static Web App ready: %APP_NAME%
echo.

REM Get deployment token
echo [4/8] Getting deployment token...
for /f "delims=" %%i in ('az staticwebapp secrets list --name %APP_NAME% --resource-group %RESOURCE_GROUP% --query "properties.apiKey" -o tsv') do set DEPLOYMENT_TOKEN=%%i

if "%DEPLOYMENT_TOKEN%"=="" (
    echo ERROR: Failed to get deployment token
    exit /b 1
)
echo ✓ Deployment token retrieved
echo.

REM Build frontend
echo [5/8] Building frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

REM Build API
echo [6/8] Building API...
cd api
call npm run build
if errorlevel 1 (
    echo ERROR: API build failed
    cd ..
    exit /b 1
)
cd ..
echo ✓ API built successfully
echo.

REM Deploy to Azure Static Web App
echo [7/8] Deploying to Azure...
call npx @azure/static-web-apps-cli deploy --app-location ./build --api-location ./api --deployment-token %DEPLOYMENT_TOKEN%

if errorlevel 1 (
    echo ERROR: Deployment failed
    exit /b 1
)
echo ✓ Deployed successfully
echo.

REM Get app URL
echo [8/8] Getting application URL...
for /f "delims=" %%i in ('az staticwebapp show --name %APP_NAME% --resource-group %RESOURCE_GROUP% --query "defaultHostname" -o tsv') do set APP_URL=%%i

echo.
echo =========================================
echo ✅ DEPLOYMENT COMPLETE!
echo =========================================
echo.
echo Your application is available at:
echo https://%APP_URL%
echo.
echo Next steps:
echo 1. Configure environment variables in Azure Portal
echo 2. Set up Azure Communication Services for emails
echo 3. Configure PowerBI credentials
echo 4. Connect your database
echo.
echo To configure app settings, run:
echo az staticwebapp appsettings set --name %APP_NAME% --resource-group %RESOURCE_GROUP% --setting-names KEY=VALUE
echo.
echo =========================================
pause
