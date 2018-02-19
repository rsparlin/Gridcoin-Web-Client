import React from 'react';
import Moment from 'react-moment';
import { Dimmer, Loader, Container, Header, Grid, List, Divider } from 'semantic-ui-react';

import GrcApi from '../GrcApi';

export default class Dashboard extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
      info: null,
    };

    this.refreshInterval = window.setInterval(() => this.refresh(), 5000);
  }

  componentDidMount() {
    /* Do initial load */
    this.refresh();
  }

  componentWillUnmount() {
    /* Cleanup */
    window.clearInterval(this.refreshInterval);
  }

  async getSummary() {
    const res = await GrcApi.getSummary();
    if (res.error) throw res.error;

    this.setState({
      info: res.info,
      mininginfo: res.mininginfo,
      recentTrans: res.recent,
      nettotals: res.nettotals,
      txinfo: res.txinfo,
      error: false,
    });
  }

  async refresh() {
    try {
      await this.getSummary();
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
    } else if (!this.state.info) {
      return (
        <Dimmer active page>
          <Loader size="huge" indeterminate>
            Loading
          </Loader>
        </Dimmer>
      );
    }

    return (
      <Grid columns="equal" container stackable>
        <Grid.Row>
          <List relaxed size="massive" horizontal style={{ margin: '0 auto' }}>
            <List.Item>
              <List.Icon name="cubes" />
              <List.Content>
                <List.Header>Blocks</List.Header>
                {this.state.info.blocks}
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name={this.state.info.difficulty['proof-of-stake'] >= 0.35 ? 'check' : 'warning sign'} />
              <List.Content>
                <List.Header>Difficulty</List.Header>
                <span style={{ color: (this.state.info.difficulty['proof-of-stake'] < 0.35 ? 'red' : 'inherit') }}>
                  {this.state.info.difficulty['proof-of-stake']}
                </span>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="currency" />
              <List.Content>
                <List.Header>Balance</List.Header>
                <span style={{ color: (this.state.info.balance > 0 ? 'green' : '') }}>
                  {this.state.info.balance.toFixed(2)}
                </span>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="line graph" />
              <List.Content>
                <List.Header>Stake</List.Header>
                <span style={{ color: (this.state.info.stake > 0 ? 'green' : '') }}>
                  {(() => {
                    if (!this.state.mininginfo.staking) return 'Locked';
                    else if (this.state.info.stake > 0) return this.state.info.stake.toFixed(2);
                    return 'Not staking';
                  })()}
                </span>
              </List.Content>
            </List.Item>
          </List>
        </Grid.Row>
        <Divider />
        <Grid.Row>
          <Grid.Column>
            <Header size="large" textAlign="center">
              Network
              {this.state.info.testnet ? '(Testnet)' : ''}
            </Header>
            <List relaxed size="large">
              <List.Item header="IP Address" content={this.state.info.ip} />
              <List.Item header="Client Version" content={this.state.info.version} />
              <List.Item header="Connections" content={this.state.info.connections} />
              <List.Item header="Total Sent" content={`${(this.state.nettotals.totalbytessent / 1024 / 1024).toFixed(1)} MiB`} />
              <List.Item header="Total Received" content={`${(this.state.nettotals.totalbytesrecv / 1024 / 1024).toFixed(1)} MiB`} />
            </List>
          </Grid.Column>
          <Grid.Column>
            <Header size="large" textAlign="center">
              Recent Transactions
            </Header>
            <List
              relaxed
              size="large"
              items={
                (this.state.recentTrans || []).sort((a, b) => (
                  a.confirmations - b.confirmations
                )).map(e => (
                  this.state.txinfo[e.txid]
                )).map(e => (
                  <List.Item key={e.txid}>
                    <List.Content>
                      <List.Header>
                        {e.details[0].Type} &mdash; {e.details[0].account}
                      </List.Header>
                      {e.details[0].amount}
                      <List.Description>
                        {e.confirmations} confirmations
                        <Moment fromNow unix style={{ float: 'right' }}>{e.timereceived}</Moment>
                      </List.Description>
                    </List.Content>
                  </List.Item>
                ))
              }
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
