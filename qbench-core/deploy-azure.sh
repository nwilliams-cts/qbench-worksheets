#!/bin/bash

# QBench Core - Azure Deployment Helper
# This script helps deploy QBench Worksheet Core to Azure

echo "🚀 QBench Core Azure Deployment Helper"
echo "========================================"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔑 Please log in to Azure first:"
    az login
fi

echo ""
echo "Select deployment option:"
echo "1) Azure Static Web Apps (Recommended)"
echo "2) Azure Blob Storage + CDN"
echo "3) Manual setup instructions"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Setting up Azure Static Web Apps..."
        echo ""
        echo "Please follow these steps:"
        echo "1. Go to https://portal.azure.com"
        echo "2. Click 'Create a resource' → 'Static Web Apps'"
        echo "3. Fill in these details:"
        echo "   - Name: qbench-worksheet-core"
        echo "   - Region: (choose closest to your users)"
        echo "   - Source: GitHub"
        echo "   - Repository: nwilliams-cts/qbench-worksheet-core"
        echo "   - Branch: main"
        echo "   - Build Presets: Custom"
        echo "   - App location: /"
        echo "   - Output location: dist"
        echo ""
        echo "4. After creation, your CDN URLs will be:"
        echo "   https://YOUR-APP-NAME.azurestaticapps.net/qbench-worksheet.esm.min.js"
        echo "   https://YOUR-APP-NAME.azurestaticapps.net/qbench-core.css"
        echo ""
        ;;
    2)
        echo ""
        echo "💾 Setting up Azure Blob Storage + CDN..."
        echo ""
        
        # Get user input
        read -p "Enter resource group name (or press Enter for 'qbench-rg'): " rg_name
        rg_name=${rg_name:-qbench-rg}
        
        read -p "Enter storage account name (must be globally unique): " storage_name
        if [ -z "$storage_name" ]; then
            echo "❌ Storage account name is required"
            exit 1
        fi
        
        read -p "Enter region (or press Enter for 'eastus'): " region
        region=${region:-eastus}
        
        echo ""
        echo "Creating Azure resources..."
        
        # Create resource group
        echo "📁 Creating resource group..."
        az group create --name "$rg_name" --location "$region"
        
        # Create storage account
        echo "💾 Creating storage account..."
        az storage account create \
            --name "$storage_name" \
            --resource-group "$rg_name" \
            --location "$region" \
            --sku Standard_LRS \
            --kind StorageV2
        
        # Enable static website hosting
        echo "🌐 Enabling static website hosting..."
        az storage blob service-properties update \
            --account-name "$storage_name" \
            --static-website \
            --index-document index.html
        
        # Create CDN profile
        echo "🚀 Creating CDN profile..."
        az cdn profile create \
            --name "qbench-cdn" \
            --resource-group "$rg_name" \
            --sku Standard_Microsoft
        
        # Get storage endpoint
        storage_endpoint=$(az storage account show \
            --name "$storage_name" \
            --resource-group "$rg_name" \
            --query "primaryEndpoints.web" \
            --output tsv | sed 's|https://||' | sed 's|/||')
        
        # Create CDN endpoint
        echo "📡 Creating CDN endpoint..."
        az cdn endpoint create \
            --name "qbench-core" \
            --profile-name "qbench-cdn" \
            --resource-group "$rg_name" \
            --origin "$storage_endpoint" \
            --origin-host-header "$storage_endpoint"
        
        echo ""
        echo "✅ Azure Blob Storage + CDN setup complete!"
        echo ""
        echo "📋 Add these secrets to your GitHub repository:"
        echo "   AZURE_RESOURCE_GROUP: $rg_name"
        echo "   AZURE_STORAGE_ACCOUNT: $storage_name"
        echo "   AZURE_CDN_PROFILE: qbench-cdn"
        echo "   AZURE_CDN_ENDPOINT: qbench-core"
        echo ""
        echo "🔗 Your CDN URLs will be:"
        echo "   https://qbench-core.azureedge.net/qbench-worksheet.esm.min.js"
        echo "   https://qbench-core.azureedge.net/qbench-core.css"
        echo ""
        echo "🚀 Run 'npm run build' and then push to GitHub to deploy!"
        ;;
    3)
        echo ""
        echo "📖 Manual Setup Instructions"
        echo ""
        echo "Please refer to AZURE-DEPLOYMENT.md for detailed setup instructions."
        echo "This file contains comprehensive guides for all deployment options."
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and select 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "🧪 Testing your deployment:"
echo "1. Update the CDN URLs in cdn-test.html"
echo "2. Deploy cdn-test.html to your CDN"
echo "3. Open it in a browser to verify everything works"
echo ""
echo "📚 Documentation:"
echo "- AZURE-DEPLOYMENT.md - Comprehensive Azure deployment guide"
echo "- IMPLEMENTATION.md - Integration guide for existing worksheets"
echo "- README.md - General project information"
echo ""
echo "✨ Happy deploying!"
