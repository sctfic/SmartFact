module.exports = {
  apps: [
    {
      name: 'SmartFact',
      version: '0.0.01',
      script: './src/server.js',
      watch: true,
      ignore_watch: [
        // pm2 delete 0;pm2 startOrReload ecosystem.config.js --update-env; pm2 logs --raw
        //     ou
        // pm2 restart 0
        'node_modules',
        './node_modules',
        './public',
        './docs',
        './.git',
        './visits',
        './datas'
      ],
      max_memory_restart: '300M',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 10001,
        watch: true,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 10001,
        watch: false // Désactiver watch en production
      },
      // Les logs seront gérés par défaut par PM2 dans C:\Users\VotreNom\.pm2\logs
      // Utilisez `pm2 logs SmartFact` pour les consulter.
    },
  ],
};