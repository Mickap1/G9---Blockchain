@echo off
echo ================================================
echo Starting NFT Price Auto-Updater
echo ================================================
echo.
echo Updating prices every hour at XX:00
echo Press Ctrl+C to stop
echo.

cd /d %~dp0
npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia

pause
