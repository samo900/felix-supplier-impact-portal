#!/bin/bash
# Azure Deployment Script for The Felix Project Supplier Impact Portal

echo "========================================="
echo "The Felix Project - Supplier Impact Portal"
echo "Azure Deployment Script"
echo "========================================="
echo ""

# Configuration
RESOURCE_GROUP="felix-allocations-rg"
LOCATION="uksouth"  # Change if needed
APP_NAME="felix-supplier-impact"
FUNCTION_APP_NAME="felix-supplier-api"
STORAGE_ACCOUNT="felixsupplierstore"

# Check if logged in to Azure
echo "[1/8] Checking Azure login..."
az account show > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Not logged in to Azure. Please run: az login"
    exit 1
fi
echo "✓ Logged in to Azure"
echo ""

# Check resource group exists
echo "[2/8] Checking resource group..."
az group show --name $RESOURCE_GROUP > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Resource group '$RESOURCE_GROUP' not found"
    echo "Please create it first or update the RESOURCE_GROUP variable"
    exit 1
fi
echo "✓ Resource group exists: $RESOURCE_GROUP"
echo ""

# Create Static Web App
echo "[3/8] Creating Azure Static Web App..."
az staticwebapp show --name $APP_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Creating new Static Web App..."
    az staticwebapp create \
        --name $APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION \
        --sku Standard \
        --source "Local"
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create Static Web App"
        exit 1
    fi
else
    echo "Static Web App already exists"
fi
echo "✓ Static Web App ready: $APP_NAME"
echo ""

# Get deployment token
echo "[4/8] Getting deployment token..."
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "properties.apiKey" -o tsv)

if [ -z "$DEPLOYMENT_TOKEN" ]; then
    echo "ERROR: Failed to get deployment token"
    exit 1
fi
echo "✓ Deployment token retrieved"
echo ""

# Build frontend
echo "[5/8] Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend build failed"
    exit 1
fi
echo "✓ Frontend built successfully"
echo ""

# Build API
echo "[6/8] Building API..."
cd api
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: API build failed"
    cd ..
    exit 1
fi
cd ..
echo "✓ API built successfully"
echo ""

# Deploy to Azure Static Web App
echo "[7/8] Deploying to Azure..."
npx @azure/static-web-apps-cli deploy \
    --app-location ./build \
    --api-location ./api \
    --deployment-token $DEPLOYMENT_TOKEN

if [ $? -ne 0 ]; then
    echo "ERROR: Deployment failed"
    exit 1
fi
echo "✓ Deployed successfully"
echo ""

# Get app URL
echo "[8/8] Getting application URL..."
APP_URL=$(az staticwebapp show \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "defaultHostname" -o tsv)

echo ""
echo "========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
echo "Your application is available at:"
echo "https://$APP_URL"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in Azure Portal"
echo "2. Set up Azure Communication Services for emails"
echo "3. Configure PowerBI credentials"
echo "4. Connect your database"
echo ""
echo "To configure app settings, run:"
echo "az staticwebapp appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --setting-names KEY=VALUE"
echo ""
echo "========================================="
