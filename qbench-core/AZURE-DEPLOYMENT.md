# Azure CDN Deployment Guide

This guide covers multiple Azure-based CDN hosting options for your private QBench Worksheet Core repository.

## Option 1: Azure Static Web Apps (Recommended)

**Pros:**
- Free tier available (100GB bandwidth/month)
- Automatic builds from private GitHub repos
- Built-in CDN and custom domains
- Automatic SSL certificates
- Authentication integration

**Setup:**

### Step 1: Create Azure Static Web App

1. Go to Azure Portal → Create Resource → Static Web Apps
2. Fill in details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `qbench-worksheet-core`
   - **Plan**: Free (or Standard for enterprise features)
   - **Region**: Choose closest to your users

3. **Deployment Details:**
   - **Source**: GitHub
   - **Organization**: Your GitHub organization
   - **Repository**: `qbench-worksheet-core`
   - **Branch**: `main`

4. **Build Details:**
   - **Build Presets**: Custom
   - **App location**: `/`
   - **Output location**: `dist`

### Step 2: Configure GitHub Secrets

The deployment will automatically create a GitHub secret. Your CDN URLs will be:
- `https://your-static-app-name.azurestaticapps.net/qbench-worksheet.esm.min.js`
- `https://your-static-app-name.azurestaticapps.net/qbench-core.css`

### Step 3: Custom Domain (Optional)

1. In Azure Portal → Static Web Apps → Custom domains
2. Add your domain (e.g., `cdn.yourcompany.com`)
3. Configure DNS CNAME record

**Final CDN URLs:**
- `https://cdn.yourcompany.com/qbench-worksheet.esm.min.js`
- `https://cdn.yourcompany.com/qbench-core.css`

---

## Option 2: Azure Blob Storage + Azure CDN

**Pros:**
- More control over caching and CDN settings
- Integration with Azure Front Door for global distribution
- Advanced security features
- Pay-as-you-go pricing

**Setup:**

### Step 1: Create Storage Account

```bash
# Create resource group
az group create --name qbench-rg --location eastus

# Create storage account
az storage account create \
    --name qbenchcdn \
    --resource-group qbench-rg \
    --location eastus \
    --sku Standard_LRS \
    --kind StorageV2

# Enable static website hosting
az storage blob service-properties update \
    --account-name qbenchcdn \
    --static-website \
    --index-document index.html
```

### Step 2: Create CDN Profile and Endpoint

```bash
# Create CDN profile
az cdn profile create \
    --name qbench-cdn \
    --resource-group qbench-rg \
    --sku Standard_Microsoft

# Create CDN endpoint
az cdn endpoint create \
    --name qbench-core \
    --profile-name qbench-cdn \
    --resource-group qbench-rg \
    --origin qbenchcdn.z13.web.core.windows.net \
    --origin-host-header qbenchcdn.z13.web.core.windows.net
```

### Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `AZURE_CREDENTIALS`: Service principal credentials (JSON)
- `AZURE_STORAGE_ACCOUNT`: `qbenchcdn`
- `AZURE_RESOURCE_GROUP`: `qbench-rg`
- `AZURE_CDN_PROFILE`: `qbench-cdn`
- `AZURE_CDN_ENDPOINT`: `qbench-core`

**Final CDN URLs:**
- `https://qbench-core.azureedge.net/qbench-worksheet.esm.min.js`
- `https://qbench-core.azureedge.net/qbench-core.css`

---

## Option 3: Azure Container Registry + Container Apps

**Pros:**
- Full Docker container control
- Can serve multiple versions
- Advanced routing and authentication
- Integration with Azure API Management

### Step 1: Create Container Registry

```bash
az acr create \
    --name qbenchregistry \
    --resource-group qbench-rg \
    --sku Basic \
    --admin-enabled true
```

### Step 2: Create Dockerfile

Create a simple Nginx-based container to serve your files:

```dockerfile
FROM nginx:alpine

# Copy built files
COPY dist/ /usr/share/nginx/html/

# Copy custom nginx config for CDN headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Enable gzip compression
RUN sed -i '/gzip on;/a\    gzip_types text/css application/javascript application/json;' /etc/nginx/nginx.conf

EXPOSE 80
```

**Final CDN URLs:**
- `https://qbench-apps.region.azurecontainerapps.io/qbench-worksheet.esm.min.js`
- `https://qbench-apps.region.azurecontainerapps.io/qbench-core.css`

---

## Cost Comparison

| Option | Monthly Cost (estimated) | Bandwidth Included | Custom Domain |
|--------|--------------------------|-------------------|---------------|
| Static Web Apps (Free) | $0 | 100GB | Yes (SSL included) |
| Static Web Apps (Standard) | $9 | 100GB + $0.20/GB | Yes (SSL included) |
| Blob Storage + CDN | $5-20 | Pay per GB ($0.08-0.15/GB) | Yes (extra cost) |
| Container Apps | $10-30 | Included in compute | Yes (extra cost) |

---

## Recommended Approach

**For QBench Enterprise Use:**

1. **Start with Azure Static Web Apps (Free tier)**
   - Quick setup with private GitHub integration
   - Professional CDN URLs
   - Free SSL certificates
   - 100GB/month bandwidth should be sufficient

2. **Upgrade to Standard tier if needed** ($9/month)
   - Custom authentication
   - Staging environments
   - More bandwidth

3. **Future: Move to Blob Storage + CDN for enterprise features**
   - More granular control
   - Integration with Azure API Management
   - Advanced security policies

---

## Security Considerations

### Private Repository Access
- Azure Static Web Apps can access private GitHub repositories
- Uses GitHub App authentication (more secure than personal tokens)
- Supports organization-level permissions

### Content Security
- All options support HTTPS by default
- Custom headers for CORS and CSP
- Integration with Azure AD for authentication

### Version Management
- All options support multiple deployment slots/environments
- Can serve multiple versions simultaneously
- Easy rollback capabilities

---

## Next Steps

1. **Choose Option 1 (Azure Static Web Apps)** for immediate deployment
2. Set up the Azure Static Web App through the Azure Portal
3. The GitHub Action will be automatically configured
4. Test the CDN URLs in your QBench worksheets
5. Configure custom domain if needed

Would you like me to help you set up any of these options?
