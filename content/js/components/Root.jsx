import React from 'react';

import Dashboard from './Dashboard.jsx';

import { Segment, Menu, Image, List, Flag, Input } from 'semantic-ui-react';

const GridcoinLogo = () => (
	<Image src='assets/gridcoin/GRCLogoOnly_White_Transparent.png'
		style={{ position: 'fixed', right: '0.1em', top: '0.1em' }}
		size='tiny' />
);

const MainMenu = () => (
	<Menu borderless>
		<Menu.Item as='a' name='dashboard' />
		<Menu.Item as='a' name='wallet' />
		<Menu.Item as='a' name='transactions' />
		<Menu.Item as='a' name='network' />
		<Menu.Item as='a' name='mining' />
		<Menu.Item as='a' name='about' />
	</Menu>
);

class Root extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
		};
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
				{this.state.peers.sort((a, b) => (a.conntime - b.conntime)).map((e) => (
					<List.Item key={e.addr}>
						<List.Content>
							<List.Header>
								<Flag name={e.country.toLowerCase()} />
								{e.addr.split(':')[0]}
							</List.Header>
							<List.Description>
								{Math.round(e.pingtime * 1000)}ms
							</List.Description>
						</List.Content>
					</List.Item>
				))}
			</List>
		);
	}

	render() {
		return (
			<div>
				{/*<GridcoinLogo />*/}
				<MainMenu />
				<Segment vertical basic>
					<Dashboard />
				</Segment>
			</div>
		);
	}
}

export default Root;
