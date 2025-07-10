@echo off
REM QBench Core Build Script for Windows
REM This script builds the modular worksheet library for distribution

echo 🔨 Building QBench Core Library...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is required but not installed. Please install npm first.
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Clean dist directory
echo 🧹 Cleaning dist directory...
if exist "dist" rmdir /s /q "dist"
mkdir "dist"

REM Copy core styles
echo 🎨 Copying styles...
mkdir "dist\styles"
copy "src\styles\*.css" "dist\styles\"

REM Copy examples
echo 📋 Copying examples...
mkdir "dist\examples"
copy "examples\*.js" "dist\examples\"
copy "examples\*.html" "dist\examples\"

REM Build JavaScript bundles
echo 📦 Building JavaScript bundles...

REM Check if rollup is available
npm list rollup >nul 2>&1
if %errorlevel% equ 0 (
    npm run build
) else (
    echo ⚠️  Rollup not available, copying source files...
    mkdir "dist\src"
    xcopy "src" "dist\src" /e /i
)

REM Create a simple HTML index for testing
echo 📄 Creating test index...
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>QBench Core Library^</title^>
echo     ^<link rel="stylesheet" href="styles/qbench-core.css"^>
echo     ^<style^>
echo         body { font-family: Arial, sans-serif; margin: 40px; }
echo         .example-link { display: block; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; text-decoration: none; color: #333; }
echo         .example-link:hover { background: #e9e9e9; }
echo     ^</style^>
echo ^</head^>
echo ^<body^>
echo     ^<h1^>QBench Core Library^</h1^>
echo     ^<p^>Modular worksheet system for QBench LIMS^</p^>
echo     
echo     ^<h2^>Examples^</h2^>
echo     ^<a href="examples/cannabinoids-worksheet.html" class="example-link"^>
echo         ^<strong^>Cannabinoids Worksheet^</strong^>^<br^>
echo         Complete example for cannabis potency testing
echo     ^</a^>
echo     
echo     ^<a href="examples/migration-example.html" class="example-link"^>
echo         ^<strong^>Migration Example^</strong^>^<br^>
echo         Shows how to migrate from legacy worksheets
echo     ^</a^>
echo     
echo     ^<h2^>Files^</h2^>
echo     ^<ul^>
echo         ^<li^>^<strong^>styles/qbench-core.css^</strong^> - Core stylesheet^</li^>
echo         ^<li^>^<strong^>src/qbench-worksheet.js^</strong^> - Main library entry point^</li^>
echo         ^<li^>^<strong^>src/core/^</strong^> - Core modules ^(calculations, UI, data integrity, etc.^)^</li^>
echo         ^<li^>^<strong^>examples/^</strong^> - Example configurations and worksheets^</li^>
echo     ^</ul^>
echo     
echo     ^<h2^>Usage^</h2^>
echo     ^<pre^>^<code^>import QBenchWorksheet from './src/qbench-worksheet.js';
echo 
echo const config = {
echo     fields: {
echo         sampleWeight: 'input[name="sample_weight"]',
echo         instrumentResults: 'textarea[name="ws_instrument_results"]'
echo     },
echo     features: {
echo         multiUnit: true,
echo         dataIntegrity: true
echo     }
echo };
echo 
echo const worksheet = new QBenchWorksheet^(config^);^</code^>^</pre^>
echo ^</body^>
echo ^</html^>
) > "dist\index.html"

REM Create a simple server script
echo 🌐 Creating development server script...
(
echo const http = require^('http'^);
echo const fs = require^('fs'^);
echo const path = require^('path'^);
echo 
echo const PORT = 8080;
echo 
echo const mimeTypes = {
echo     '.html': 'text/html',
echo     '.js': 'text/javascript',
echo     '.css': 'text/css',
echo     '.json': 'application/json'
echo };
echo 
echo const server = http.createServer^(^(req, res^) =^> {
echo     let filePath = '.' + req.url;
echo     if ^(filePath === './'^ filePath = './index.html';
echo 
echo     const extname = String^(path.extname^(filePath^^).toLowerCase^(^);
echo     const mimeType = mimeTypes[extname] ^|^| 'application/octet-stream';
echo 
echo     fs.readFile^(filePath, ^(err, content^) =^> {
echo         if ^(err^) {
echo             if ^(err.code === 'ENOENT'^) {
echo                 res.writeHead^(404, { 'Content-Type': 'text/html' }^);
echo                 res.end^('^<h1^>404 Not Found^</h1^>', 'utf-8'^);
echo             } else {
echo                 res.writeHead^(500^);
echo                 res.end^('Internal Server Error: ' + err.code + ' ..\n'^);
echo             }
echo         } else {
echo             res.writeHead^(200, { 'Content-Type': mimeType }^);
echo             res.end^(content, 'utf-8'^);
echo         }
echo     }^);
echo }^);
echo 
echo server.listen^(PORT, ^(^) =^> {
echo     console.log^(`QBench Core development server running at http://localhost:${PORT}/`^);
echo }^);
) > "dist\serve.js"

echo ✅ Build complete!
echo.
echo 📁 Generated files in dist\:
dir "dist" /b
echo.
echo 🚀 To test the library:
echo    cd dist ^&^& node serve.js
echo    Then open http://localhost:8080 in your browser
echo.
echo 📚 To use in your QBench worksheet:
echo    1. Copy the dist\ folder to your server
echo    2. Include qbench-core.css in your HTML
echo    3. Import qbench-worksheet.js and configure for your site
echo    4. See examples\ for configuration examples

pause
