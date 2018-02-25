import React from 'react';
import { Container, Segment, Header, Dimmer, Table } from 'semantic-ui-react';
// import { PieChart } from 'react-d3-basic';
// import { ResponsiveOrdinalFrame } from 'semiotic';

import Moment from 'react-moment';

import BigLoader from './BigLoader.jsx';
import GrcApi from '../GrcApi';

class Network extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
      transactions: null,
      offset: 0,
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

  async listTransactions() {
    const res = await GrcApi.listTransactions(100, this.state.offset);

    if (res.error) throw res.error;

    this.setState({
      transactions: res.transactions,
      blocks: res.blocks,
    });
  }

  async refresh() {
    try {
      await this.listTransactions();
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
    } else if (!this.state.transactions) {
      return (<BigLoader />);
    }

    const cols = [
      {
        label: 'Type',
        name: 'Type',
        render: (e) => {
          const block = e.generated && this.state.blocks[e.blockhash];

          return block ? (
            <span style={{ textTransform: 'capitalize' }}>
              {block.ResearchSubsidy ? 'DPoR' : 'Interest'}
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
          const block = e.generated && this.state.blocks[e.blockhash];

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
        render: e => (
          <Moment format="YYYY-DD-MM hh:mm A" unix>{e.timereceived}</Moment>
        ),
      },
      {
        label: 'Confirmations',
        name: 'confirmations',
      },
    ];

    return (
      <Segment vertical basic>
        <Header size="huge" textAlign="center">List of Transactions</Header>
        <Table size="large" singleLine striped celled unstackable selectable compact="very">
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
            {this.state.transactions
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
      </Segment>
    );
  }
}

export default Network;
