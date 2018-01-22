/* Init dependencies */
console.log('Initializing dependencies...');

const Hapi = require('hapi');
const config = require('config');

/* Get config */
const appConfig = {
	rpc: {
		baseUrl: config.get('rpc.baseurl'),
		username: config.get('rpc.username'),
		password: config.get('rpc.password'),
	}
};

/* Create server */
console.log('Starting web server...');

const server = new Hapi.Server({
	host: 'localhost',
	port: process.env.PORT || 8080,
});

/* Load plugins */
(async () => {
	try {
		await server.register(require('inert'));
		await server.register({
			plugin: require('./grcWebClient'),
			options: appConfig
		});
		server.route({
			method: 'GET',
			path: '/{file*}',
			handler: {
				directory: {
					path: 'content/',
					redirectToSlash: true,
					index: true,
					listing: false,
					etagMethod: 'hash'
				}
			}
		});
		await server.start();
		console.log('Server started at: ', server.info.uri);
	} catch (e) {
		console.error(e);
	}
})();
