const rp = require('request-promise-native');

const baseUrl = 'https://freegeoip.net';

module.exports = class Geolocation {
	async locate(ip) {
		return await rp.get({
			uri: `${baseUrl}/json/${encodeURIComponent(ip)}`,
			simple: true,
			json: true
		});
	}
};
