import React from 'react';
import Moment from 'react-moment';
import { Container, Header, Dimmer, Item, List, Divider, Segment, Progress } from 'semantic-ui-react';

import BigLoader from './BigLoader.jsx';
import GrcApi from '../GrcApi';

class Boinc extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
    };

    this.refreshInterval = window.setInterval(() => this.refresh(), 10000);
  }

  async componentDidMount() {
    this.refresh();
  }

  componentWillUnmount() {
    /* Cleanup */
    window.clearInterval(this.refreshInterval);
  }

  async refresh() {
    try {
      this.setState({
        hosts: await GrcApi.getBoincHosts(),
      });
    } catch (e) {
      this.setState({
        error: e.message,
      });
    }
  }

  render() {
    const { hosts, error } = this.state;

    if (error) {
      return (
        <Dimmer active>
          <Container>
            <Header size="huge" inverted>{this.state.error.toString()}</Header>
          </Container>
        </Dimmer>
      );
    } else if (!hosts) {
      return (<BigLoader />);
    }

    return (
      <Container style={{ padding: '1rem' }}>
        <Segment vertical basic textAlign="center">
          <Header size="huge">BOINC Status</Header>
        </Segment>
        <Divider />
        <Segment vertical basic>
          <Item.Group divided relaxed>
            {Object.entries(hosts).map(([hostname, { info, tasks }]) => (
              <Item key={`host-${hostname}`}>
                <Item.Content>
                  <Item.Header>{hostname}</Item.Header>
                  <Item.Meta>Operating System: {info['OS name']}</Item.Meta>
                  <Item.Meta>Memory: {(Number(info['mem size']) / 1024 / 1024 / 1024).toFixed(1)} GiB</Item.Meta>
                  <Item.Meta>CPU Model: {info['CPU model']}</Item.Meta>
                  <Item.Meta>Active Tasks: {tasks ? tasks.length : 0}</Item.Meta>
                  <Item.Description>
                    {
                      (tasks && tasks.length) ? (
                        <List>
                          {
                            tasks.map(task => (
                              <List.Item key={`task-${hostname}-${task.name}`}>
                                <List.Content>
                                  <Progress
                                    size="small"
                                    active={task.active_task_state === 'EXECUTING'}
                                    success={task['ready to report'] === 'yes'}
                                    percent={(Number(task['fraction done']) * 100).toPrecision(2)}
                                    progress="percent"
                                  >
                                    {task.name} &mdash; due <Moment fromNow date={new Date(Date.parse(task['report deadline']))} />
                                  </Progress>
                                </List.Content>
                              </List.Item>
                            ))
                          }
                        </List>
                      ) : 'No active tasks.'
                    }
                  </Item.Description>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        </Segment>
      </Container>
    );
  }
}

export default Boinc;
