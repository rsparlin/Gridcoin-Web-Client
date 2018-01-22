class GrcWebClient {
	constructor() {
		this.pkg = require('../package.json');
	}

	register(server, options) {
		/* Save reference to config */
		this.config = options;

		/* Create cache */
		this.cache = {
			/*cache1: server.cache({
				segment: 'cache1',
				expiresIn: 1 * 60 * 1000,
			}),*/
		};

		server.route([
			{
				method: 'GET',
				path: '/api/testing',
				config: {
					handler: function(req, h) {
						return h.response('hey').code(200);
					}
				}
			}
		]);
	}
}

/* Export plugin */
module.exports.plugin = new GrcWebClient();
