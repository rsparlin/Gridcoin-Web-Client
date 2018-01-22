const rp = require('request-promise-native'); /* https://github.com/request/request-promise-native */
const Boom = require('boom'); /* https://github.com/hapijs/boom */
const Geolocation = require('./geoip');

class GrcWebClient {
	/**
	 * Constructor
	 */
	constructor() {
		this.pkg = require('../package.json');
	}

	/**
	 * Hapi plugin registration function
	 * @param {Object} server Hapi server object
	 * @param {Object} options Plugin options
	 */
	register(server, options) {
		/* Save reference to config */
		this.config = options;

		/* Create cache */
		this.cache = {
			rpc: server.cache({
				segment: 'rpc',
				expiresIn: 5 * 1000,
			})
		};

		/* Routes for allowed methods that take no arguments */
		server.route([
			'ping',
			'getinfo'
		].map((method) => ({
			method: 'GET',
			path: `/api/${method}`,
			config: {
				handler: async (req, h) => (h.response(await this.request(method)))
			}
		})));
	}

	/**
	 * Performs JSON RPC request
	 * @param {String} method Method name
	 * @param {Array} [params=[]] Method parameters
	 * @param {Number} [ttlOverride=0] TTL override for caching, optional
	 * @return {Promise} Promise that resolves to result object
	 */
	async request(method, params = [], ttlOverride = 0) {
		const cacheId = JSON.stringify([ method, params]);

		/* Try cache first */
		const cached = await this.cache.rpc.get(cacheId);

		if (cached) return Object.assign(cached, { cached: true });

		/* Perform request */
		let res;

		try {
			res = await rp({
				method: 'POST',
				uri: this.config.rpc.baseUrl,
				auth: {
					user: this.config.rpc.username,
					pass: this.config.rpc.password
				},
				body: {
					method,
					params
				},
				json: true,
				simple: true
			});
		} catch (e) {
			throw Boom.badGateway(e.message);
		}

		/* Cache result */
		await this.cache.rpc.set(cacheId, res, ttlOverride);

		/* Done */
		return res;
	}
}

/* Export plugin */
module.exports.plugin = new GrcWebClient();
