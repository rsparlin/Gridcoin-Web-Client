import React from 'react';
import { Container, Segment, Header, Dimmer, Table, Visibility, Loader } from 'semantic-ui-react';
// import { PieChart } from 'react-d3-basic';
// import { ResponsiveOrdinalFrame } from 'semiotic';

import BigLoader from './BigLoader.jsx';
import GrcApi from '../GrcApi';

class Network extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
      loading: false,
      offset: 0,
    };
  }

  async componentDidMount() {
    this.listTransactions();
  }

  async listTransactions(offset = 0) {
    this.setState({ offset, loading: true });

    try {
      const res = await GrcApi.listTransactions(100, offset);

      if (res.error) throw res.error;

      this.setState({
        transactions: (!this.state.transactions) ?
          res.transactions : [...this.state.transactions, ...res.transactions],
        blocks: Object.assign({}, this.state.blocks || {}, res.blocks),
      });
    } catch (e) {
      this.setState({
        error: e,
      });
    }

    this.setState({ loading: false });
  }

  infiniteScroll() {
    if (!this.state.loading) {
      this.listTransactions(Math.min(this.state.transactions.length, this.state.offset + 100));
    }
  }

  render() {
    const {
      error,
      loading,
      transactions,
      blocks,
    } = this.state;

    if (error) {
      return (
        <Dimmer active>
          <Container>
            <Header size="huge" inverted>{error.toString()}</Header>
          </Container>
        </Dimmer>
      );
    } else if (!transactions) {
      return (<BigLoader />);
    }

    const cols = [
      {
        label: 'Type',
        name: 'Type',
        render: (e) => {
          const block = e.generated && blocks[e.blockhash];

          return block ? (
            <span style={{ textTransform: 'capitalize' }}>
              {block.ResearchSubsidy ? `DPoR (mag = ${block.Magnitude})` : 'Interest'}
            </span>
          ) : (
            <span style={{ textTransform: 'capitalize' }}>
              {e.category}
            </span>
          );
        },
      },
      {
        label: 'Account',
        name: 'account',
        render: e => (e.account),
      },
      {
        label: 'Amount',
        name: 'amount',
        render: (e) => {
          const block = e.generated && blocks[e.blockhash];

          if (block) {
            const research = block.ResearchSubsidy.toFixed(2);
            const interest = block.Interest.toFixed(2);

            return block.ResearchSubsidy ? (
              `${interest} + ${research} (DPoR)`
            ) : (interest);
          }

          return e.amount;
        },
      },
      {
        label: 'Date',
        name: 'timereceived',
        render: e => (new Date(e.timereceived * 1000).toLocaleString()),
      },
      {
        label: 'Transaction ID',
        name: 'txid',
      },
    ];

    return (
      <Container fluid style={{ padding: '1rem' }}>
        <Segment vertical basic>
          <Header size="large" textAlign="center">List of Transactions</Header>

          <Visibility once={false} onBottomVisible={() => this.infiniteScroll()}>
            <Table size="large" basic="very" striped singleLine compact="very">
              <Table.Header>
                <Table.Row>
                  {cols.map(col => (
                    <Table.HeaderCell key={col.name}>
                      {col.label}
                    </Table.HeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {transactions
                  .sort((a, b) => (a.confirmations - b.confirmations))
                  .map(tx => (
                    <Table.Row key={`${tx.address}-${tx.txid}`}>
                      {cols.map(col => (
                        <Table.Cell key={col.name}>
                          {col.render ? col.render(tx) : tx[col.name]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                }
              </Table.Body>
            </Table>
          </Visibility>
          {!loading ? '' : (
            <Segment basic textAlign="center">
              <Loader inline active indeterminate />
            </Segment>
          )}
        </Segment>
      </Container>
    );
  }
}

export default Network;
