export default class GrcApi {
  static request(method) {
    return fetch(`api/${encodeURIComponent(method)}`, {
      method: 'GET',
      mode: 'cors',
      json: true,
    }).then(res => (res.json()));
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
}
