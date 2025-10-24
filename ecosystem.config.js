module.exports = {
  apps: [
    {
      name: 'nft-price-updater',
      script: 'npx',
      args: 'hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        // Assurez-vous que ALCHEMY_API_KEY et SEPOLIA_PRIVATE_KEY sont dans votre .env
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/nft-updater-err.log',
      out_file: './logs/nft-updater-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'rwat-price-updater',
      script: 'npx',
      args: 'hardhat run scripts/auto-update-rwat-price.ts --network sepolia',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        // Assurez-vous que ALCHEMY_API_KEY et SEPOLIA_PRIVATE_KEY sont dans votre .env
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/rwat-updater-err.log',
      out_file: './logs/rwat-updater-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
