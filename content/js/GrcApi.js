export default class GrcApi {
  static async request(method, ...params) {
    const paramStr = params.length ? `/${params.map(encodeURIComponent).join('/')}` : '';

    const raw = await fetch(`api/${encodeURIComponent(method)}${paramStr}`, {
      method: 'GET',
      mode: 'cors',
      json: true,
    });

    const res = await raw.json();
    if (res.error) throw res.error;
    return res;
  }

  static listTransactions(amount, from) {
    return GrcApi.request('listtransactions', from, amount);
  }

  static getSummary() {
    return GrcApi.request('getSummary');
  }

  static getInfo() {
    return GrcApi.request('getinfo');
  }

  static getMiningInfo() {
    return GrcApi.request('getmininginfo');
  }

  static getRecentTransactions() {
    return GrcApi.request('getrecenttransactions');
  }

  static getPeerInfo() {
    return GrcApi.request('getpeerinfo');
  }

  static getTicker() {
    return GrcApi.request('getTicker');
  }
}
