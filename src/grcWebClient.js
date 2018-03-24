const rp = require('request-promise-native'); /* https://github.com/request/request-promise-native */
const Boom = require('boom'); /* https://github.com/hapijs/boom */
const Geolocation = require('./geoip');

class GrcWebClient {
	/**
	 * Constructor
	 */
	constructor() {
		this.pkg = require('../package.json');
		this.geo = new Geolocation();
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
			'getinfo', 'getmininginfo', 'getnettotals'
		].map((method) => ({
			method: 'GET',
			path: `/api/${method}`,
			options: {
				handler: async (req, h) => (h.response(await this.request(method)))
			}
		})));

		/* Server method for IP geolocation */
		server.method('geolocate', (ip) => (this.geo.locate(ip)), {
			cache: {
				expiresIn: 24 * 60 * 60 * 1000,
				generateTimeout: 2000
			}
		});

		/* Routes for more complicated methods */
		server.route([
			{
				method: 'GET',
				path: '/api/getSummary',
				options: {
					handler: async (req, h) => {
						const [ info, mininginfo, nettotals, recent ] = await Promise.all([
							this.request('getinfo'),
							this.request('getmininginfo'),
							this.request('getnettotals'),
							this.request('listtransactions', [ '', 10 ], 30 * 1000)
						]);

						const txdata = await Promise.all(recent.result.map(e => (
							this.request('gettransaction', [ e.txid ], 10 * 1000)
						)));

						return h.response({
							info: info.result,
							mininginfo: mininginfo.result,
							recent: recent.result,
							nettotals: nettotals.result,
							txinfo: txdata.reduce((a, v) => {
								a[v.result.txid] = v.result;
								return a;
							}, {})
						});
					}
				}
			},
			{
				method: 'GET',
				path: '/api/getpeerinfo',
				options: {
					handler: async (req, h) => {
						const peers = await this.request('getpeerinfo');

						await Promise.all(peers.result.map(async (e) => {
							const geo = await req.server.methods.geolocate(e.addr.split(':')[0]);
							e.country = geo.country_code;
							return e;
						}));

						return h.response(peers);
					}
				}
			},
			{
				method: 'GET',
				path: '/api/getblockstats',
				options: {
					/* https://github.com/gridcoin/Gridcoin-Research/wiki/Block-Stats-Command */
					handler: async (req, h) => (
						h.response(await this.request('getblockstats', [ 1, 1000 ], 10 * 60 * 1000))
					)
				}
			}
		]);
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
