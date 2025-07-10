#!/bin/bash

# QBench Core Build Script
# This script builds the modular worksheet library for distribution

echo "🔨 Building QBench Core Library..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean dist directory
echo "🧹 Cleaning dist directory..."
rm -rf dist
mkdir -p dist

# Copy core styles
echo "🎨 Copying styles..."
mkdir -p dist/styles
cp src/styles/*.css dist/styles/

# Copy examples
echo "📋 Copying examples..."
mkdir -p dist/examples
cp examples/*.js examples/*.html dist/examples/

# Build JavaScript bundles
echo "📦 Building JavaScript bundles..."

# Check if rollup is available
if npm list rollup &> /dev/null; then
    npm run build
else
    echo "⚠️  Rollup not available, copying source files..."
    mkdir -p dist/src
    cp -r src/* dist/src/
fi

# Create a simple HTML index for testing
echo "📄 Creating test index..."
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QBench Core Library</title>
    <link rel="stylesheet" href="styles/qbench-core.css">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .example-link { display: block; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; text-decoration: none; color: #333; }
        .example-link:hover { background: #e9e9e9; }
    </style>
</head>
<body>
    <h1>QBench Core Library</h1>
    <p>Modular worksheet system for QBench LIMS</p>
    
    <h2>Examples</h2>
    <a href="examples/cannabinoids-worksheet.html" class="example-link">
        <strong>Cannabinoids Worksheet</strong><br>
        Complete example for cannabis potency testing
    </a>
    
    <a href="examples/migration-example.html" class="example-link">
        <strong>Migration Example</strong><br>
        Shows how to migrate from legacy worksheets
    </a>
    
    <h2>Files</h2>
    <ul>
        <li><strong>styles/qbench-core.css</strong> - Core stylesheet</li>
        <li><strong>src/qbench-worksheet.js</strong> - Main library entry point</li>
        <li><strong>src/core/</strong> - Core modules (calculations, UI, data integrity, etc.)</li>
        <li><strong>examples/</strong> - Example configurations and worksheets</li>
    </ul>
    
    <h2>Usage</h2>
    <pre><code>import QBenchWorksheet from './src/qbench-worksheet.js';

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

const worksheet = new QBenchWorksheet(config);</code></pre>
</body>
</html>
EOF

# Create a simple server script
echo "🌐 Creating development server script..."
cat > dist/serve.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Internal Server Error: ' + err.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`QBench Core development server running at http://localhost:${PORT}/`);
});
EOF

echo "✅ Build complete!"
echo ""
echo "📁 Generated files in dist/:"
ls -la dist/
echo ""
echo "🚀 To test the library:"
echo "   cd dist && node serve.js"
echo "   Then open http://localhost:8080 in your browser"
echo ""
echo "📚 To use in your QBench worksheet:"
echo "   1. Copy the dist/ folder to your server"
echo "   2. Include qbench-core.css in your HTML"
echo "   3. Import qbench-worksheet.js and configure for your site"
echo "   4. See examples/ for configuration examples"
