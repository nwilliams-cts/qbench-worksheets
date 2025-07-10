@echo off
REM QBench Core Setup Script for Windows
REM This script helps you set up the GitHub repository and prepare for deployment

echo 🚀 QBench Core Library Setup
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Are you in the qbench-core directory?
    pause
    exit /b 1
)

echo ✅ Found package.json - we're in the right directory
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git not found. Please install Git first.
    echo Download from: https://git-scm.com/
    pause
    exit /b 1
)

echo ✅ Git is installed
git --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Build the project
echo 🔨 Building project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully
echo.

REM Check if this is already a git repository
if exist ".git" (
    echo ✅ Already a git repository
    echo.
    
    REM Check if we have uncommitted changes
    git diff-index --quiet HEAD --
    if %errorlevel% neq 0 (
        echo 📝 You have uncommitted changes. Here's what's new:
        git status --porcelain
        echo.
        
        set /p commit="Would you like to commit these changes? (y/N): "
        if /i "%commit%"=="y" (
            git add .
            git commit -m "feat: update QBench Core Library

- Updated modular worksheet system
- Enhanced build configuration  
- Added comprehensive documentation
- Ready for CDN deployment"
            echo ✅ Changes committed
        )
    ) else (
        echo ✅ Working directory is clean
    )
) else (
    echo 🔧 Initializing git repository...
    git init
    git branch -M main
    
    echo 📝 Adding all files...
    git add .
    
    echo 💾 Creating initial commit...
    git commit -m "feat: initial release of QBench Core Library

- Modular ES6 architecture with configuration-driven field mapping
- Multi-unit output support (mg/g, %%, ppm, mg/serving, mg/package)
- Data integrity protection with deviation tracking  
- Condition fields for Confident Cannabis integration
- Real-time calculations with caching and debouncing
- Responsive UI with modern design system
- Complete migration tools from legacy monolithic system
- Production-ready build system with Rollup
- Comprehensive documentation and examples"
    
    echo ✅ Git repository initialized and initial commit created
)

echo.
echo 🎉 Setup Complete!
echo ================
echo.
echo Your QBench Core Library is ready for deployment!
echo.
echo 📋 Next Steps:
echo.
echo 1. Create a GitHub repository:
echo    - Go to https://github.com
echo    - Click "New repository"
echo    - Name: qbench-core
echo    - Make it public (for free GitHub Pages)
echo    - Don't initialize with README (we already have one)
echo.
echo 2. Add your GitHub repository as remote:
echo    git remote add origin https://github.com/YOUR_USERNAME/qbench-core.git
echo.
echo 3. Push to GitHub:
echo    git push -u origin main
echo.
echo 4. Enable GitHub Pages:
echo    - Go to repository Settings ^> Pages
echo    - Source: "Deploy from a branch"  
echo    - Branch: main
echo    - Folder: / (root)
echo.
echo 5. Your CDN URLs will be:
echo    CSS: https://YOUR_USERNAME.github.io/qbench-core/dist/qbench-core.css
echo    JS:  https://YOUR_USERNAME.github.io/qbench-core/dist/qbench-worksheet.esm.min.js
echo.
echo 📚 For detailed deployment instructions, see DEPLOYMENT.md
echo.
echo 🔗 Useful commands:
echo    npm run build         - Build the library
echo    npm run serve         - Start local development server
echo    npm run lint          - Check code quality
echo.

set /p open="Would you like to open the deployment guide? (y/N): "
if /i "%open%"=="y" (
    start DEPLOYMENT.md
)

echo.
echo Happy coding! 🚀
pause
