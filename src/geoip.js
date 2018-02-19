const rp = require('request-promise-native');

const baseUrl = 'https://freegeoip.net';

module.exports = class Geolocation {
  static async locate(ip) {
    return rp.get({
      uri: `${baseUrl}/json/${encodeURIComponent(ip)}`,
      simple: true,
      json: true,
    });
  }
};
