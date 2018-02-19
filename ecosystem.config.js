module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'GridcoinWebClient',
      script: 'src/server.js',

      env: {
        watch: ['src/*.js'],
        WEB_PORT: '8080',
        NODE_ENV: 'development',
      },
      env_development: {
        watch: ['src/*.js'],
        WEB_PORT: '8080',
        NODE_ENV: 'development',
      },
      env_production: {
        WEB_PORT: '5000',
        NODE_ENV: 'production',
        watch: false,
      },
    },
  ],
};
