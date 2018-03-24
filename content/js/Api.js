export default class Api {
	constructor() {
	}

	request(method) {
		return fetch(`api/${encodeURIComponent(method)}`, {
			method: 'GET',
			mode: 'cors',
			json: true
		}).then((res) => (res.json()));
	}

	getSummary() {
		return this.request('getSummary');
	}

	getInfo() {
		return this.request('getinfo');
	}

	getMiningInfo() {
		return this.request('getmininginfo');
	}

	getRecentTransactions() {
		return this.request('getrecenttransactions');
	}

	getPeerInfo() {
		return this.request('getpeerinfo');
	}
}
