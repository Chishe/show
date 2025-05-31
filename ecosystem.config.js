module.exports = {
    apps: {
      name: 'show',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      port :  4000 ,
      watch: false,
      max_memory_restart: '1G',
    }
  }
