import React from 'react';
import Moment from 'react-moment';
import { Dimmer, Container, Header, Grid, List, Divider, Segment, Table } from 'semantic-ui-react';

import GrcApi from '../GrcApi';
import BigLoader from './BigLoader.jsx';

export default class Dashboard extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
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
      walletInfo: res.walletinfo,
      miningInfo: res.mininginfo,
      networkInfo: res.networkinfo,
      recentTrans: res.recent,
      netTotals: res.nettotals,
      blocks: res.blocks,
      error: false,
    });
  }

  async getUnconfirmed() {
    try {
      const res = await GrcApi.getUnconfirmed();

      if (res.error) throw res.error;

      this.setState({ unconfirmed: res.unconfirmed });
    } catch (error) {
      this.setState({ error });
    }
  }

  refresh() {
    this.getUnconfirmed();
    this.getSummary();
  }

  render() {
    if (this.state.error) {
      return (
        <Dimmer active page>
          <Container>
            <Header size="huge" inverted>{this.state.error.toString()}</Header>
          </Container>
        </Dimmer>
      );
    } else if (!this.state.walletInfo) {
      return (<BigLoader />);
    }

    const {
      walletInfo,
      miningInfo,
      networkInfo,
      netTotals,
      recentTrans,
      blocks,
      unconfirmed,
    } = this.state;

    return (
      <Container style={{ padding: '1rem' }}>
        <Segment vertical basic textAlign="center">
          <List size="huge" horizontal>
            <List.Item>
              <List.Icon name="cubes" />
              <List.Content>
                <List.Header>Blocks</List.Header>
                {miningInfo.blocks}
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name={miningInfo.difficulty['proof-of-stake'] >= 0.35 ? 'check' : 'warning sign'} />
              <List.Content>
                <List.Header>Difficulty</List.Header>
                <span style={{ color: (miningInfo.difficulty['proof-of-stake'] < 0.35 ? 'red' : 'inherit') }}>
                  {miningInfo.difficulty['proof-of-stake']}
                </span>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="money" />
              <List.Content>
                <List.Header>Balance</List.Header>
                <span style={{ color: (walletInfo.balance > 0 ? 'green' : '') }}>
                  {walletInfo.balance.toFixed(2)}
                </span>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="line graph" />
              <List.Content>
                <List.Header>Stake</List.Header>
                <span style={{ color: (walletInfo.stake > 0 ? 'green' : '') }}>
                  {(() => {
                    if (!walletInfo.unlocked_until) return 'Locked';
                    else if (walletInfo.stake > 0) return walletInfo.stake.toFixed(2);
                    return 'Not staking';
                  })()}
                </span>
              </List.Content>
            </List.Item>
          </List>
        </Segment>
        <Divider />
        <Segment vertical basic>
          <Grid container columns="equal" stackable>
            <Grid.Row>
              <Grid.Column>
                <Header size="large" textAlign="center">Mining</Header>
                <List relaxed size="large">
                  <List.Item header="CPID" content={miningInfo.CPID} />
                  <List.Item header="Pending Interest" content={miningInfo.InterestPending} />
                  <List.Item header="Pending Boinc Reward" content={miningInfo.BoincRewardPending} />
                  <List.Item>
                    <List.Header>
                      Est. time to stake
                    </List.Header>
                    {
                      walletInfo.unlocked_until ? (
                        <Moment add={{ seconds: miningInfo.expectedtime }} fromNow>
                          {new Date()}
                        </Moment>
                      ) : 'N/A'
                    }
                  </List.Item>
                </List>

                <Header size="large" textAlign="center">
                  Network
                  {miningInfo.testnet ? '(Testnet)' : ''}
                </Header>
                <List relaxed size="large">
                  <List.Item header="IP Address" content={networkInfo.ip} />
                  <List.Item header="Client Version" content={networkInfo.version} />
                  <List.Item header="Connections" content={networkInfo.connections} />
                  <List.Item header="Total Sent" content={`${(netTotals.totalbytessent / 1024 / 1024).toFixed(1)} MiB`} />
                  <List.Item header="Total Received" content={`${(netTotals.totalbytesrecv / 1024 / 1024).toFixed(1)} MiB`} />
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
                    (recentTrans || []).sort((a, b) => (
                      a.confirmations - b.confirmations
                    )).map((e) => {
                      const block = e.generated && blocks[e.blockhash];
                      const genType = (block && block.ResearchSubsidy) ? 'DPoR' : 'Interest';

                      return (
                        <List.Item key={e.txid}>
                          <List.Content>
                            <List.Header>
                              {block ? genType : (
                                <span style={{ textTransform: 'capitalize' }}>
                                  {e.category}
                                </span>
                              )} &mdash; {e.account || e.address}
                            </List.Header>
                            {(block ? (`${block.Interest.toFixed(2)} + ${block.ResearchSubsidy.toFixed(2)} (DPoR)`) : e.amount.toFixed(2))}
                            <List.Description>
                              {e.confirmations} confirmations
                              <Moment fromNow unix style={{ float: 'right' }}>
                                {e.timereceived}
                              </Moment>
                            </List.Description>
                          </List.Content>
                        </List.Item>
                      );
                    })
                  }
                />
              </Grid.Column>
            </Grid.Row>
            {!!unconfirmed.length &&
            <Grid.Row>
              <Grid.Column>
                <Header size="large" textAlign="center">
                  Unconfirmed Transactions
                </Header>
                <Table size="large" basic="very" striped singleLine compact="very">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Date</Table.HeaderCell>
                      <Table.HeaderCell>Size</Table.HeaderCell>
                      <Table.HeaderCell>Inputs</Table.HeaderCell>
                      <Table.HeaderCell>Outputs</Table.HeaderCell>
                      <Table.HeaderCell>Transaction ID</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {unconfirmed
                      .sort((a, b) => (b.date - a.date))
                      .map(tx => (
                        <Table.Row key={`unconfirmed-${tx.txid}`}>
                          <Table.Cell>{(new Date(tx.time * 1000).toLocaleString())}</Table.Cell>
                          <Table.Cell>
                            {tx.vout.reduce((a, v) => (a + v.value), 0).toFixed(8)}
                          </Table.Cell>
                          <Table.Cell>{tx.vin.length}</Table.Cell>
                          <Table.Cell>{tx.vin.length}</Table.Cell>
                          <Table.Cell>{tx.txid}</Table.Cell>
                        </Table.Row>
                      ))
                    }
                  </Table.Body>
                </Table>
              </Grid.Column>
            </Grid.Row>
            }
          </Grid>
        </Segment>
      </Container>
    );
  }
}
