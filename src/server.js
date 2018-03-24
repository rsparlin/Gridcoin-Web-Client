/* Init dependencies */
console.log('Initializing dependencies...');

const Hapi = require('hapi');
const config = require('config');
const inert = require('inert');
const GrcWebClient = require('./grcWebClient');

/* Get config */
const appConfig = {
  rpc: {
    baseUrl: config.get('rpc.baseurl'),
    username: config.get('rpc.username'),
    password: config.get('rpc.password'),
  },
  reverseDns: config.get('reverseDns'),
  geolocate: config.get('geolocate'),
};

/* Create server */
console.log('Starting web server...');

const server = new Hapi.Server({
  host: process.env.GWC_HOST || 'localhost',
  port: process.env.GWC_PORT || 8080,
});

/* Load plugins */
(async () => {
  try {
    await server.register(inert);
    await server.register({
      plugin: GrcWebClient,
      options: appConfig,
    });

    server.route({
      method: 'GET',
      path: '/{any*}',
      handler: {
        file: 'content/index.html',
      },
    });

    server.route({
      method: 'GET',
      path: '/content/{file*}',
      handler: {
        directory: {
          path: 'content/',
          redirectToSlash: true,
          index: true,
          listing: false,
          etagMethod: 'hash',
        },
      },
    });
    await server.start();
    console.log('Server started at: %s (%s)', server.info.uri, new Date());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
