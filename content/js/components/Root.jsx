import React from 'react';
import delay from 'delay';
import { Dimmer, Loader, Container, Header, Segment } from 'semantic-ui-react';

class Root extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			error: false
		};

		delay(1000).then(() => {
			this.setState({
				loading: false
			});
		});
	}

	render() {
		if (this.state.error) return (
			<Dimmer active page>
				<Container>
					<Header size='huge' inverted>beep boop beep</Header>
				</Container>
			</Dimmer>
		);

		if (this.state.loading) {
			return (
				<Dimmer inverted active page>
					<Loader size='huge' indeterminate>
						Loading
					</Loader>
				</Dimmer>
			);
		} else {
			return (
				<Container>
					<Segment textAlign='center' style={{padding: '1em 0em'}} vertical>
						<Header>this is a thing</Header>
					</Segment>
				</Container>
			);
		}
	}
}

export default Root;
