module.exports = {
    apps : [{
      name: "Uni server",
      script: "/var/www/kompendia/client/dist/kompendia/server/main.js",
      // watch: "/var/www/kompendia/api/dist",
      // watch_delay: 10000,
      // watch_options: {
      //   "followSymlinks": false
      // },
      kill_timeout: 1600,
      wait_ready: true,
      listen_timeout: 3000,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }
