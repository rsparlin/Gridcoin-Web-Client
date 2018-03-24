const rp = require('request-promise-native'); /* https://github.com/request/request-promise-native */
const Boom = require('boom'); /* https://github.com/hapijs/boom */
const Geolocation = require('./geoip');
const pkg = require('../package.json');
const dns = require('dns');

class GrcWebClient {
  /**
   * Constructor
   */
  constructor() {
    this.pkg = pkg;
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
      }),
    };

    /* Server method for IP geolocation */
    server.method('geolocate', ip => (Geolocation.locate(ip)), {
      cache: {
        expiresIn: 24 * 60 * 60 * 1000,
        generateTimeout: 5000,
      },
    });

    /* Server method for reverse DNS lookups */
    server.method('reverseDns', ip => (new Promise((res, rej) => {
      dns.reverse(ip, (err, hostnames) => {
        if (err) return res(''); // return rej(err);
        return res(hostnames.join('/'));
      });
    })), {
      cache: {
        expiresIn: 24 * 60 * 60 * 1000,
        generateTimeout: 2000,
      },
    });

    /* Server method for GRC ticker */
    server.method('ticker', async () => {
      const ticker = await rp.get({
        uri: 'https://api.coinmarketcap.com/v1/ticker/gridcoin/',
        simple: true,
        json: true,
      });

      if (!ticker[0]) throw Boom.badGateway();

      return ticker[0];
    }, {
      cache: {
        expiresIn: 1 * 60 * 1000,
        generateTimeout: 5000,
      },
    });

    /* Route for ticker */
    server.route({
      method: 'GET',
      path: '/api/getTicker',
      handler: async (req, h) => (h.response(await server.methods.ticker())),
    });

    /* Routes for allowed methods that take no arguments */
    server.route([
      'getinfo', 'getmininginfo', 'getnettotals', 'listunspent',
    ].map(method => ({
      method: 'GET',
      path: `/api/${method}`,
      options: {
        handler: async (req, h) => (h.response(await this.request(method))),
      },
    })));

    /* Routes for more complicated methods */
    server.route([
      {
        method: 'GET',
        path: '/api/listtransactions/{from}/{amount}',
        options: {
          handler: async (req, h) => {
            const amount = Number(req.params.amount);
            const from = Number(req.params.from);

            if (Number.isNaN(amount) || Number.isNaN(from)) throw Boom.badRequest();

            const transactions = await this.request('listtransactions', [
              '', amount, from,
            ]);

            const blocks = await Promise.all(transactions.result.filter(e => e.generated).map(e => (
              this.request('getblock', [e.blockhash], 10 * 1000)
            )));

            return h.response({
              transactions: transactions.result,
              blocks: blocks.reduce((a, v) => {
                a[v.result.hash] = v.result; // eslint-disable-line no-param-reassign
                return a;
              }, {}),
            });
          },
        },
      },
      {
        method: 'GET',
        path: '/api/getSummary',
        options: {
          handler: async (req, h) => {
            const [info, mininginfo, nettotals, recent] = await Promise.all([
              this.request('getinfo'),
              this.request('getmininginfo'),
              this.request('getnettotals'),
              this.request('listtransactions', ['', 10], 30 * 1000),
            ]);

            const blocks = await Promise.all(recent.result.filter(e => e.generated).map(e => (
              this.request('getblock', [e.blockhash], 10 * 1000)
            )));

            return h.response({
              info: info.result,
              mininginfo: mininginfo.result,
              recent: recent.result,
              nettotals: nettotals.result,
              blocks: blocks.reduce((a, v) => {
                a[v.result.hash] = v.result; // eslint-disable-line no-param-reassign
                return a;
              }, {}),
            });
          },
        },
      },
      {
        method: 'GET',
        path: '/api/getpeerinfo',
        options: {
          handler: async (req, h) => {
            const peers = await this.request('getpeerinfo');
            const proms = [];

            /* Reverse DNS lookup peers */
            if (this.config.reverseDns) {
              proms.push(...peers.result.map(async (e) => {
                try {
                  e.addr_rev = await req.server.methods.reverseDns(e.addr.split(':')[0]);
                } catch (err) {
                  console.warn(err);
                }
              }));
            }

            /* Geolocate peers */
            if (this.config.geolocate) {
              proms.push(...peers.result.map(async (e) => {
                const geo = await req.server.methods.geolocate(e.addr.split(':')[0]);
                e.country = geo.country_code;
              }));
            }

            await Promise.all(proms);

            return h.response(peers);
          },
        },
      },
      {
        method: 'GET',
        path: '/api/getblockstats',
        options: {
          /* https://github.com/gridcoin/Gridcoin-Research/wiki/Block-Stats-Command */
          handler: async (req, h) => (
            h.response(await this.request('getblockstats', [1, 1000], 10 * 60 * 1000))
          ),
        },
      },
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
    const cacheId = JSON.stringify([method, params]);

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
          pass: this.config.rpc.password,
        },
        body: {
          method,
          params,
        },
        json: true,
        simple: true,
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
