/**
 * PM2 Ecosystem Configuration
 * Usa: pm2 start ecosystem.config.js
 */

module.exports = {
    apps: [
        {
            name: 'amas-centurion-bot',
            script: 'src/app.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '256M',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            // Logs
            error_file: './logs/error.log',
            out_file: './logs/output.log',
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
        },
    ],
};
