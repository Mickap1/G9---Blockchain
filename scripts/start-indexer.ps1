# Script to start the indexer
Write-Host "🚀 Starting RWA Blockchain Indexer..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Navigate to indexer directory
$indexerPath = Join-Path $PSScriptRoot "..\indexer"
if (Test-Path $indexerPath) {
    Set-Location $indexerPath
    Write-Host "📂 Changed directory to: $indexerPath" -ForegroundColor Yellow
} else {
    Write-Host "❌ Indexer directory not found: $indexerPath" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please configure it with your settings." -ForegroundColor Green
        Write-Host ""
        Write-Host "Required variables:" -ForegroundColor Cyan
        Write-Host "  - SEPOLIA_RPC_URL" -ForegroundColor White
        Write-Host "  - MONGODB_URI" -ForegroundColor White
        Write-Host ""
        Write-Host "Press any key to continue after configuring .env..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "❌ .env.example not found. Cannot create .env file." -ForegroundColor Red
        exit 1
    }
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed." -ForegroundColor Green
}

# Check if dist exists, if not build
if (-not (Test-Path "dist")) {
    Write-Host "🔨 Building indexer..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build completed." -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🔄 Starting Indexer Service" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The indexer will:" -ForegroundColor Yellow
Write-Host "  ✓ Monitor blockchain events in real-time" -ForegroundColor White
Write-Host "  ✓ Sync data to MongoDB every minute" -ForegroundColor White
Write-Host "  ✓ Expose API on http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the indexer" -ForegroundColor Gray
Write-Host ""

# Start the indexer
npm start
