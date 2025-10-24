@echo off
echo ================================================
echo Starting RWAT Price Auto-Updater
echo ================================================
echo.
echo Updating price every hour at XX:00
echo Press Ctrl+C to stop
echo.

cd /d %~dp0
npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia

pause
