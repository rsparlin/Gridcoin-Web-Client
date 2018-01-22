import React from 'react';
import delay from 'delay';

import { Dimmer, Loader, Container, Header, Segment, Menu, Button, Image, Statistic, Grid, List } from 'semantic-ui-react';

const GridcoinLogo = () => (
	<Image src='assets/gridcoin/GRCLogoOnly_White_Transparent.png'
		style={{ position: 'fixed', right: '0.1em', top: '0.1em' }}
		size='tiny' />
);

class Api {
	constructor() {
	}

	request(method) {
		return fetch(`api/${encodeURIComponent(method)}`, {
			method: 'GET',
			mode: 'cors',
			json: true
		}).then((res) => (res.json()));
	}

	getInfo() {
		return this.request('getinfo');
	}

	getPeerInfo() {
		return this.request('getpeerinfo');
	}
}

class Root extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			error: false,
			api: new Api(),
			info: null,
			peers: null
		};

		this.refreshInterval = window.setInterval(() => this.reload(), 5000);
	}

	componentDidMount() {
		/* Do initial load */
		this.reload();
	}

	componentWillUnmount() {
		window.clearInterval(this.refreshInterval);
	}

	reload() {
		this.getInfo();
		this.getPeerInfo();
	}

	async getInfo() {
		try {
			const res = await this.state.api.getInfo();

			if (res.error) throw res.error;

			this.setState({
				info: res.result
			});
		} catch (e) {
			console.error(e);

			this.setState({
				error: true
			});
		}
	}

	async getPeerInfo() {
		try {
			const res = await this.state.api.getPeerInfo();

			if (res.error) throw res.error;

			this.setState({
				peers: res.result
			});
		} catch (e) {
			console.error(e);

			this.setState({
				error: true
			});
		}
	}

	getPeerList() {
		return (
			<List divided relaxed size='large' style={{textAlign: 'left'}}>
				{this.state.peers.sort((a, b) => (a.pingtime - b.pingtime)).map((e) => (
					<List.Item key={e.addr}>
						<List.Icon name='marker' />
						<List.Content>
							<List.Header>{e.addr}</List.Header>
							<List.Description>{Math.round(e.pingtime * 1000)}ms</List.Description>
						</List.Content>
					</List.Item>
				))}
			</List>
		);
	}

	render() {
		if (this.state.error) return (
			<Dimmer active page>
				<Container>
					<Header size='huge' inverted>beep boop beep</Header>
				</Container>
			</Dimmer>
		);

		if (!this.state.info || !this.state.peers) {
			return (
				<Dimmer active page>
					<Loader size='huge' indeterminate>
						Loading
					</Loader>
				</Dimmer>
			);
		} else {
			return (
				<Segment as='div' vertical basic>
					<GridcoinLogo />
					<Grid textAlign='center' stackable columns={12}>
						<Grid.Row>
							<Grid.Column width={4} textAlign='left'>
								<Statistic.Group horizontal>
									<Statistic>
										<Statistic.Value>{this.state.info.blocks}</Statistic.Value>
										<Statistic.Label>Blocks</Statistic.Label>
									</Statistic>
									<Statistic>
										<Statistic.Value>{this.state.info.difficulty['proof-of-stake']}</Statistic.Value>
										<Statistic.Label>Difficulty</Statistic.Label>
									</Statistic>
								</Statistic.Group>
							</Grid.Column>
							<Grid.Column width={8} textAlign='center'>
								{this.getPeerList()}
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Segment>
			);
		}
	}
}

export default Root;
