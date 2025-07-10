# QBench Core Library - Deployment Guide

This guide walks you through setting up a GitHub repository and deploying your QBench Core Library to a CDN.

## 📁 Step 1: Create GitHub Repository

### 1.1 Create Repository on GitHub

1. Go to https://github.com
2. Click "New" or "New repository"
3. Repository name: `qbench-core` (or `qbench-worksheets`)
4. Description: "Modular worksheet system for QBench LIMS"
5. Set to **Public** (for free GitHub Pages hosting)
6. ✅ Add a README file
7. ✅ Add .gitignore (choose Node.js template)
8. ✅ Choose a license (MIT recommended)
9. Click "Create repository"

### 1.2 Clone and Setup Local Repository

```bash
# Clone your new repository
git clone https://github.com/YOUR_USERNAME/qbench-core.git
cd qbench-core

# Copy your modular system files
# Copy everything from your qbench-core folder to this directory

# Install dependencies
npm install

# Test the build
npm run build

# Add all files
git add .

# Commit initial version
git commit -m "feat: initial release of modular QBench worksheet system

- Modular ES6 architecture with configuration-driven field mapping
- Multi-unit output support (mg/g, %, ppm, mg/serving, mg/package)
- Data integrity protection with deviation tracking
- Condition fields for Confident Cannabis integration
- Real-time calculations with caching and debouncing
- Responsive UI with modern design system
- Complete migration tools from legacy monolithic system"

# Push to GitHub
git push origin main
```

## 🌐 Step 2: CDN Hosting Options

You have several options for CDN hosting, from simple (free) to advanced (paid):

### Option A: GitHub Pages (Free & Easy)

**Best for:** Testing, demos, personal projects
**Cost:** Free
**Setup time:** 5 minutes

#### Setup Steps:

1. In your GitHub repository, go to Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `main`
4. Folder: `/ (root)` or `/docs` (if you prefer)
5. Click Save

**Your CDN URLs will be:**
```
https://YOUR_USERNAME.github.io/qbench-core/dist/qbench-worksheet.esm.min.js
https://YOUR_USERNAME.github.io/qbench-core/dist/qbench-core.css
```

#### Auto-deployment with GitHub Actions:

The provided workflow file will automatically:
- Build your code on every push to main
- Deploy to GitHub Pages
- Your changes go live automatically!

### Option B: jsDelivr (Free CDN for GitHub)

**Best for:** Production use, better performance
**Cost:** Free
**Setup time:** 0 minutes (automatic)

Once your code is on GitHub, jsDelivr automatically creates CDN URLs:

```html
<!-- Latest version -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@latest/dist/qbench-core.css">
<script type="module" src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@latest/dist/qbench-worksheet.esm.min.js"></script>

<!-- Specific version (recommended for production) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@1.0.0/dist/qbench-core.css">
<script type="module" src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@1.0.0/dist/qbench-worksheet.esm.min.js"></script>
```

### Option C: NPM + jsDelivr (Professional)

**Best for:** Professional projects, version management
**Cost:** Free
**Setup time:** 15 minutes

1. **Publish to NPM:**
```bash
# Login to NPM (create account at npmjs.com first)
npm login

# Publish your package
npm publish
```

2. **Use NPM-based CDN URLs:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/qbench-core@latest/dist/qbench-core.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/qbench-core@latest/dist/qbench-worksheet.esm.min.js"></script>
```

### Option D: Cloud Storage CDN (AWS CloudFront)

**Best for:** Enterprise use, custom domains, maximum performance
**Cost:** ~$1-5/month
**Setup time:** 30-60 minutes

#### AWS S3 + CloudFront Setup:

1. **Create S3 Bucket:**
   - Name: `qbench-core-cdn`
   - Enable static website hosting
   - Upload your `dist/` folder

2. **Create CloudFront Distribution:**
   - Origin: Your S3 bucket
   - Enable compression
   - Configure caching headers

3. **Setup Custom Domain (optional):**
   - Add your domain to CloudFront
   - Configure SSL certificate
   - Update DNS to point to CloudFront

**Your CDN URLs:**
```
https://your-domain.com/qbench-core/1.0.0/qbench-worksheet.esm.min.js
https://your-domain.com/qbench-core/latest/qbench-core.css
```

## 🚀 Step 3: Recommended Setup for You

**I recommend starting with Option A (GitHub Pages) + Option B (jsDelivr):**

1. **Use GitHub Pages for demos and documentation**
2. **Use jsDelivr for production CDN links**
3. **Upgrade to NPM later when you're ready**

### Quick Setup Script:

```bash
#!/bin/bash
# Quick setup script for QBench Core

echo "🚀 Setting up QBench Core repository..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

# Install dependencies
npm install

# Build the project
npm run build

# Add all files
git add .

# Commit
git commit -m "feat: initial release of QBench Core Library"

# Add your GitHub remote (replace with your actual repo URL)
echo "Add your GitHub remote URL:"
echo "git remote add origin https://github.com/YOUR_USERNAME/qbench-core.git"
echo "git push -u origin main"

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push -u origin main"
echo "2. Enable GitHub Pages in repository settings"
echo "3. Your CDN will be available at:"
echo "   https://YOUR_USERNAME.github.io/qbench-core/"
```

## 📝 Step 4: Usage Examples

Once your CDN is live, users can include your library like this:

### For Modern Browsers (ES Modules):
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@latest/dist/qbench-core.css">
</head>
<body>
    <script type="module">
        import QBenchWorksheet from 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@latest/dist/qbench-worksheet.esm.min.js';
        
        const config = {
            fields: {
                sampleWeight: 'input[name="sample_weight"]',
                instrumentResults: 'textarea[name="ws_instrument_results"]'
            },
            features: {
                multiUnit: true,
                dataIntegrity: true
            }
        };
        
        const worksheet = new QBenchWorksheet(config);
    </script>
</body>
</html>
```

### For Legacy Browsers (UMD):
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@latest/dist/qbench-core.css">
</head>
<body>
    <script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@latest/dist/qbench-worksheet.umd.min.js"></script>
    <script>
        const config = { /* your config */ };
        const worksheet = new QBenchWorksheet(config);
    </script>
</body>
</html>
```

## 🔄 Step 5: Version Management

### Creating Releases:

1. **Update version in package.json:**
```bash
npm version patch  # 1.0.0 → 1.0.1 (bug fix)
npm version minor  # 1.0.0 → 1.1.0 (new feature)
npm version major  # 1.0.0 → 2.0.0 (breaking change)
```

2. **Create GitHub Release:**
   - Go to your repository → Releases → "Create a new release"
   - Tag version: `v1.0.1`
   - Release title: `QBench Core v1.0.1`
   - Describe what changed
   - GitHub Actions will automatically build and deploy

3. **Users can target specific versions:**
```html
<!-- Always get the latest -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@latest/dist/qbench-worksheet.esm.min.js"></script>

<!-- Pin to specific version (recommended for production) -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/qbench-core@v1.0.1/dist/qbench-worksheet.esm.min.js"></script>
```

## 📊 Step 6: Monitoring & Analytics

### CDN Usage Tracking:

1. **jsDelivr provides free analytics:**
   - Visit: https://www.jsdelivr.com/package/gh/YOUR_USERNAME/qbench-core
   - See download stats, popular files, geographic distribution

2. **GitHub provides repository insights:**
   - Traffic tab shows views and clones
   - Releases tab shows download counts

### Setting Up Alerts:

```yaml
# Add to .github/workflows/monitor.yml
name: Monitor CDN Health

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
    - name: Test CDN endpoints
      run: |
        curl -f https://cdn.jsdelivr.net/gh/${{ github.repository }}@latest/dist/qbench-worksheet.esm.min.js
        curl -f https://cdn.jsdelivr.net/gh/${{ github.repository }}@latest/dist/qbench-core.css
```

## 🎯 Next Steps

1. **Set up your GitHub repository**
2. **Enable GitHub Pages**
3. **Test your CDN URLs**
4. **Update your existing worksheets to use the CDN**
5. **Consider publishing to NPM for wider distribution**

Your modular QBench system will then be available worldwide via CDN! 🌍
