module.exports = {
  apps: [
    {
      name: 'box-factory-erp',
      script: 'server/index.js',
      cwd: '/var/www/box-factory',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        JWT_SECRET: 'boxfactory-production-key-change-this'
      }
    }
  ]
};
