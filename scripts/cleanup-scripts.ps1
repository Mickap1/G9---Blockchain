# Script de nettoyage des fichiers scripts inutiles
Write-Host "🧹 Nettoyage des scripts inutiles..." -ForegroundColor Cyan
Write-Host ""

$scriptsToDelete = @(
    # Anciennes versions
    "deploy-kyc-v2.ts",
    "deploy-nft-v2.ts",
    "deploy-tokens.ts",
    "deploy-marketplace.ts",
    
    # Scripts de debug temporaires
    "debug-dex-liquidity.ts",
    "debug-kyc-transfer.ts",
    "fix-dex-in-admin.ts",
    "test-kyc-listing.ts",
    "test-indexer.ts",
    
    # Doublons de vérification
    "check-accounts-status.ts",
    "check-all-whitelisted.ts",
    "check-and-whitelist.ts",
    "check-asset-info.ts",
    "check-dex-reserves.ts",
    "check-kyc-admin.ts",
    "check-my-nfts.ts",
    "check-nft-simple.js",
    "check-oracle.ts",
    "check-sepolia-balance.ts",
    "check-token-balance.ts",
    "quick-check-nfts.ts",
    
    # Doublons de whitelist
    "whitelist-address.ts",
    "whitelist-dex.ts",
    "quick-whitelist.ts",
    
    # Doublons d'actions
    "add-initial-liquidity.ts",
    "add-more-liquidity.ts",
    "buy-with-account2.ts",
    "trade-tokens.ts",
    
    # Scripts d'explication
    "explain-liquidity-position.ts",
    "explain-tokenization-system.ts",
    
    # Scripts temporaires
    "calculate-roles.js",
    "init-all-nft-prices.ts",
    "init-oracle-prices.ts",
    "update-kyc-config.ts",
    "verify-oracle-integration.ts",
    
    # Auto-update non utilisés
    "auto-update-rwat-price.ts",
    "auto-update-all-nft-prices.ts"
)

$scriptsPath = "scripts"
$deletedCount = 0
$notFoundCount = 0

foreach ($script in $scriptsToDelete) {
    $fullPath = Join-Path $scriptsPath $script
    
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  ✅ Supprimé: $script" -ForegroundColor Green
        $deletedCount++
    } else {
        Write-Host "  ⚠️  Non trouvé: $script" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Nettoyage terminé                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📊 Fichiers supprimés: $deletedCount" -ForegroundColor Green
Write-Host "  ⚠️  Fichiers non trouvés: $notFoundCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "Scripts conservés (essentiels):" -ForegroundColor Cyan
Write-Host "  📁 Déploiement:" -ForegroundColor White
Write-Host "     - deploy-all.ts, deploy-kyc.ts, deploy-fungible.ts" -ForegroundColor Gray
Write-Host "     - deploy-nft.ts, deploy-dex.ts, deploy-oracle.ts" -ForegroundColor Gray
Write-Host "     - extract-abis.js" -ForegroundColor Gray
Write-Host ""
Write-Host "  ⚙️  Configuration:" -ForegroundColor White
Write-Host "     - setup-dex-liquidity.ts" -ForegroundColor Gray
Write-Host "     - whitelist-account.ts" -ForegroundColor Gray
Write-Host "     - grant-admin-role.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "  🧪 Tests:" -ForegroundColor White
Write-Host "     - test-indexer-requirement.ts (IMPORTANT)" -ForegroundColor Gray
Write-Host "     - verify-system.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "  🔍 Vérification:" -ForegroundColor White
Write-Host "     - check-kyc.ts" -ForegroundColor Gray
Write-Host "     - check-prices.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "  🛠️  Utilitaires:" -ForegroundColor White
Write-Host "     - mint-diamond.ts" -ForegroundColor Gray
Write-Host "     - list-admins.ts" -ForegroundColor Gray
Write-Host "     - auto-update-diamond-price.ts" -ForegroundColor Gray
Write-Host "     - start-indexer.ps1" -ForegroundColor Gray
Write-Host ""
