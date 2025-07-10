@echo off
REM QBench Core - Azure Deployment Helper (Windows)
REM This script helps deploy QBench Worksheet Core to Azure

echo 🚀 QBench Core Azure Deployment Helper
echo ========================================

REM Check if Azure CLI is installed
az --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Azure CLI is not installed. Please install it first:
    echo    https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
    exit /b 1
)

REM Check if logged in to Azure
az account show >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 Please log in to Azure first:
    az login
)

echo.
echo Select deployment option:
echo 1^) Azure Static Web Apps ^(Recommended^)
echo 2^) Azure Blob Storage + CDN
echo 3^) Manual setup instructions
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🌐 Setting up Azure Static Web Apps...
    echo.
    echo Please follow these steps:
    echo 1. Go to https://portal.azure.com
    echo 2. Click 'Create a resource' → 'Static Web Apps'
    echo 3. Fill in these details:
    echo    - Name: qbench-worksheet-core
    echo    - Region: ^(choose closest to your users^)
    echo    - Source: GitHub
    echo    - Repository: nwilliams-cts/qbench-worksheet-core
    echo    - Branch: main
    echo    - Build Presets: Custom
    echo    - App location: /
    echo    - Output location: dist
    echo.
    echo 4. After creation, your CDN URLs will be:
    echo    https://YOUR-APP-NAME.azurestaticapps.net/qbench-worksheet.esm.min.js
    echo    https://YOUR-APP-NAME.azurestaticapps.net/qbench-core.css
    echo.
) else if "%choice%"=="2" (
    echo.
    echo 💾 Setting up Azure Blob Storage + CDN...
    echo.
    
    set /p rg_name="Enter resource group name (or press Enter for 'qbench-rg'): "
    if "%rg_name%"=="" set rg_name=qbench-rg
    
    set /p storage_name="Enter storage account name (must be globally unique): "
    if "%storage_name%"=="" (
        echo ❌ Storage account name is required
        exit /b 1
    )
    
    set /p region="Enter region (or press Enter for 'eastus'): "
    if "%region%"=="" set region=eastus
    
    echo.
    echo Creating Azure resources...
    
    REM Create resource group
    echo 📁 Creating resource group...
    az group create --name "%rg_name%" --location "%region%"
    
    REM Create storage account
    echo 💾 Creating storage account...
    az storage account create --name "%storage_name%" --resource-group "%rg_name%" --location "%region%" --sku Standard_LRS --kind StorageV2
    
    REM Enable static website hosting
    echo 🌐 Enabling static website hosting...
    az storage blob service-properties update --account-name "%storage_name%" --static-website --index-document index.html
    
    REM Create CDN profile
    echo 🚀 Creating CDN profile...
    az cdn profile create --name "qbench-cdn" --resource-group "%rg_name%" --sku Standard_Microsoft
    
    REM Create CDN endpoint (simplified for Windows batch)
    echo 📡 Creating CDN endpoint...
    az cdn endpoint create --name "qbench-core" --profile-name "qbench-cdn" --resource-group "%rg_name%" --origin "%storage_name%.z13.web.core.windows.net" --origin-host-header "%storage_name%.z13.web.core.windows.net"
    
    echo.
    echo ✅ Azure Blob Storage + CDN setup complete!
    echo.
    echo 📋 Add these secrets to your GitHub repository:
    echo    AZURE_RESOURCE_GROUP: %rg_name%
    echo    AZURE_STORAGE_ACCOUNT: %storage_name%
    echo    AZURE_CDN_PROFILE: qbench-cdn
    echo    AZURE_CDN_ENDPOINT: qbench-core
    echo.
    echo 🔗 Your CDN URLs will be:
    echo    https://qbench-core.azureedge.net/qbench-worksheet.esm.min.js
    echo    https://qbench-core.azureedge.net/qbench-core.css
    echo.
    echo 🚀 Run 'npm run build' and then push to GitHub to deploy!
) else if "%choice%"=="3" (
    echo.
    echo 📖 Manual Setup Instructions
    echo.
    echo Please refer to AZURE-DEPLOYMENT.md for detailed setup instructions.
    echo This file contains comprehensive guides for all deployment options.
) else (
    echo ❌ Invalid choice. Please run the script again and select 1, 2, or 3.
    exit /b 1
)

echo.
echo 🧪 Testing your deployment:
echo 1. Update the CDN URLs in cdn-test.html
echo 2. Deploy cdn-test.html to your CDN
echo 3. Open it in a browser to verify everything works
echo.
echo 📚 Documentation:
echo - AZURE-DEPLOYMENT.md - Comprehensive Azure deployment guide
echo - IMPLEMENTATION.md - Integration guide for existing worksheets
echo - README.md - General project information
echo.
echo ✨ Happy deploying!
pause
