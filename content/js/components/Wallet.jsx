import React from 'react';
import { Container, Header, Dimmer, List, Divider, Segment } from 'semantic-ui-react';
// import { PieChart } from 'react-d3-basic';
// import { ResponsiveOrdinalFrame } from 'semiotic';

import BigLoader from './BigLoader.jsx';
import GrcApi from '../GrcApi';

class Wallet extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
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

  async getInfo() {
    const res = await GrcApi.request('getinfo');

    this.setState({
      info: res.result,
    });
  }

  async getTicker() {
    this.setState({
      ticker: await GrcApi.getTicker(),
    });
  }

  async listUnspent() {
    const res = await GrcApi.request('listunspent');

    this.setState({
      unspent: res.result,
    });
  }

  async refresh() {
    try {
      await Promise.all([
        this.listUnspent(),
        this.getInfo(),
        this.getTicker(),
      ]);
    } catch (e) {
      this.setState({
        error: e,
      });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <Dimmer active>
          <Container>
            <Header size="huge" inverted>{this.state.error.toString()}</Header>
          </Container>
        </Dimmer>
      );
    } else if (!this.state.unspent || !this.state.info || !this.state.ticker) {
      return (<BigLoader />);
    }

    const balances = this.state.unspent.reduce((a, v) => {
      const accName = v.account || '';

      if (!a[accName]) a[accName] = {}; // eslint-disable-line no-param-reassign
      const account = a[accName];

      if (!account[v.address]) account[v.address] = { balance: 0 };
      const address = account[v.address];

      address.balance += v.amount;
      address[v.txid] = v;

      return a;
    }, {});

    const { balance, stake } = this.state.info;
    const totalBtc = (balance + stake) * this.state.ticker.price_btc;
    const totalFiat = (balance + stake) * this.state.ticker.price_usd;

    return (
      <Container style={{ padding: '1rem' }}>
        <Segment vertical basic textAlign="center">
          <List relaxed size="huge" horizontal style={{ margin: '0 auto' }}>
            <List.Item>
              <List.Icon name="money" />
              <List.Content>
                <List.Header>Available</List.Header>
                {balance.toFixed(2)}
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="line graph" />
              <List.Content>
                <List.Header>Stake</List.Header>
                {stake.toFixed(2)}
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="bitcoin" />
              <List.Content>
                <List.Header>Total (BTC)</List.Header>
                {totalBtc.toFixed(6)}
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="money" />
              <List.Content>
                <List.Header>Total (USD)</List.Header>
                ${totalFiat.toFixed(2)}
              </List.Content>
            </List.Item>
          </List>
        </Segment>
        <Divider />
        <Segment vertical basic>
          <Header size="large" textAlign="center">Balances</Header>
          <List size="huge">
            {
              Object.entries(balances).map(([accName, acc]) => (
                <List.Item key={`account-${accName}`}>
                  {/* <List.Icon name="folder" /> */}
                  <List.Content>
                    <List.Header>{accName || 'default'}</List.Header>
                    <List.List>
                      {
                        Object.entries(acc).map(([address, transactions]) => (
                          <List.Item key={`address-${address}`}>
                            <List.Icon name="money" />
                            <List.Content>
                              <List.Header>
                                {address}
                              </List.Header>
                              <List.Description>
                                {transactions.balance.toFixed(2)} GRC
                              </List.Description>
                            </List.Content>
                          </List.Item>
                        ))
                      }
                    </List.List>
                  </List.Content>
                </List.Item>
              ))
            }
          </List>
        </Segment>
      </Container>
    );
  }
}

export default Wallet;
