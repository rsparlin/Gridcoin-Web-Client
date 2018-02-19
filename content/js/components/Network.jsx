import React from 'react';
import { Grid, Container, Segment, Header, Loader, Dimmer, List, Flag } from 'semantic-ui-react';
import Moment from 'react-moment';

import GrcApi from '../GrcApi';

class Network extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
      peers: null,
    };

    this.refreshInterval = window.setInterval(() => this.refresh(), 5000);
  }

  async componentDidMount() {
    this.refresh();
  }

  componentWillUnmount() {
    /* Cleanup */
    window.clearInterval(this.refreshInterval);
  }

  async getPeerInfo() {
    const res = await GrcApi.getPeerInfo();

    if (res.error) throw res.error;

    this.setState({
      peers: res.result,
    });
  }

  getPeerList() {
    return (
      <List divided relaxed size="large" style={{ textAlign: 'left' }}>
        {
          this.state.peers
          .sort((a, b) => (a.conntime - b.conntime))
          .map(e => (
            <List.Item key={e.addr}>
              <List.Content>
                <List.Header>
                  <Flag name={e.country.toLowerCase()} />
                  {e.addr_rev || e.addr.split(':')[0]}
                </List.Header>
                <List.Description>
                  <span>Latency: {Math.round(e.pingtime * 1000)}ms</span>
                  <span style={{ float: 'right' }}>Connected for <Moment unix fromNow ago>{e.conntime}</Moment></span>
                </List.Description>
              </List.Content>
            </List.Item>
        ))}
      </List>
    );
  }

  async refresh() {
    try {
      await this.getPeerInfo();
    } catch (e) {
      console.error(e);

      this.setState({
        error: true,
      });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <Dimmer active page>
          <Container>
            <Header size="huge" inverted>beep boop beep</Header>
          </Container>
        </Dimmer>
      );
    } else if (!this.state.peers) {
      return (
        <Dimmer active page>
          <Loader size="huge" indeterminate>￼
            Loading
          </Loader>
        </Dimmer>
      );
    }
    return (
      <Grid columns="equal" container stackable>
        <Grid.Row>
          <Grid.Column>
            <Header attached="top">
              something else
            </Header>
            <Segment attached>
              <List>
                {((peers) => {
                  const countryCounts = peers.reduce((a, { country }) => {
                    a[country] = (a[country] || 0) + 1; // eslint-disable-line no-param-reassign
                    return a;
                  }, {});

                  return Object.keys(countryCounts).map(country => (
                    <List.Item key={country}>
                      <List.Content>
                        <List.Header>{country}</List.Header>
                        {countryCounts[country]}
                      </List.Content>
                    </List.Item>
                  ));
                })(this.state.peers)}
              </List>
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <Header attached="top">
              Peers
            </Header>
            <Segment attached>
              {this.getPeerList()}
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default Network;
