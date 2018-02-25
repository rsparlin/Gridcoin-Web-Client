import React from 'react';
import { Container, Header, Dimmer, List, Divider } from 'semantic-ui-react';
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
    this.getTicker();
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
      ]);
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
        <Dimmer active>
          <Container>
            <Header size="huge" inverted>beep boop beep</Header>
          </Container>
        </Dimmer>
      );
    } else if (!this.state.unspent || !this.state.info) {
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

    return (
      <Container style={{ padding: '1rem' }}>
        <Header textAlign="center" size="huge">
          Wallet balances
          <Header.Subheader>
            {this.state.info.balance} GRC Available
          </Header.Subheader>
          <Header.Subheader>
            {this.state.info.stake} GRC Staked
          </Header.Subheader>
        </Header>
        <Divider />
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
                          <List.Icon name="currency" />
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
      </Container>
    );
  }
}

export default Wallet;
