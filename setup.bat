@echo off
echo ========================================
echo Supplier Impact Portal Setup
echo ========================================
echo.

echo [1/5] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

echo [2/5] Installing API dependencies...
cd api
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install API dependencies
    cd ..
    exit /b 1
)
cd ..
echo ✓ API dependencies installed
echo.

echo [3/5] Creating local configuration file...
if not exist api\local.settings.json (
    copy api\local.settings.json.template api\local.settings.json
    echo ✓ Created api\local.settings.json - PLEASE CONFIGURE IT
) else (
    echo ℹ local.settings.json already exists
)
echo.

echo [4/5] Installing Azure Static Web Apps CLI...
call npm install -g @azure/static-web-apps-cli
if errorlevel 1 (
    echo WARNING: Failed to install SWA CLI globally
    echo You can install it later with: npm install -g @azure/static-web-apps-cli
) else (
    echo ✓ Azure SWA CLI installed
)
echo.

echo [5/5] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Configure api\local.settings.json with your:
echo    - Azure Communication Services connection string
echo    - PowerBI credentials
echo    - Database connection string
echo    - Session secret
echo.
echo 2. Update src\styles\index.css with your brand colors
echo.
echo 3. Add your logo to public\logo.png
echo.
echo 4. Run the application:
echo    npm run swa:start
echo.
echo 5. Open browser to http://localhost:3000
echo.
echo ========================================
echo Documentation:
echo ========================================
echo.
echo - README.md - Project overview
echo - DEPLOYMENT.md - Deployment instructions
echo - DATABASE-INTEGRATION.md - Database setup
echo - POWERBI-RLS-SETUP.md - PowerBI configuration
echo - BRANDING-GUIDE.md - Customization guide
echo - SECURITY.md - Security considerations
echo.
echo ========================================
pause
