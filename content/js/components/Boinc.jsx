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

    const Tasks = ({ tasks }) => {
      if (!tasks || !tasks.length) {
        return (
          <p>
            No active tasks.
          </p>
        );
      }

      return (
        <List>
          {
            tasks.map(task => (
              <List.Item key={`task-${task.name}`}>
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
      );
    };

    const Host = ({ host }) => {
      const {
        hostname,
        info,
        tasks,
        projects,
      } = host;
      const memoryGib = (Number(info['mem size']) / 1024 / 1024 / 1024).toFixed(1);
      const hostProjects = (projects && projects.length) ? projects.map(p => p.name).join(', ') : 'None';
      const hostRac = (projects) ? projects.reduce((a, p) => (a + Number(p.host_expavg_credit)), 0).toLocaleString() : 'N/A';

      return (
        <Item key={`host-${hostname}`}>
          <Item.Content>
            <Item.Header>{hostname}</Item.Header>
            <Item.Meta>Operating System: {info['OS name']}</Item.Meta>
            <Item.Meta>Memory: {memoryGib} GiB</Item.Meta>
            <Item.Meta>CPU Model: {info['CPU model']}</Item.Meta>
            <Item.Meta>Projects: {hostProjects}</Item.Meta>
            <Item.Meta>Host RAC: {hostRac}</Item.Meta>
            <Item.Meta>Active Tasks: {tasks ? tasks.length : 0}</Item.Meta>
            <Item.Description>
              <Tasks tasks={tasks} />
            </Item.Description>
          </Item.Content>
        </Item>
      );
    };

    const Hosts = () => {
      if (!hosts.length) {
        return (
          <p>
            There are no BOINC hosts configured. See the README for information on adding hosts.
          </p>
        );
      }

      return (
        <Item.Group divided relaxed>
          {hosts.map(host => (
            <Host key={`host-${host.hostname}`} hostname={host.hostname} host={host} />
          ))}
        </Item.Group>
      );
    };

    return (
      <Container style={{ padding: '1rem' }}>
        <Segment vertical basic textAlign="center">
          <Header size="huge">BOINC Status</Header>
        </Segment>
        <Divider />
        <Segment vertical basic>
          <Hosts />
        </Segment>
      </Container>
    );
  }
}

export default Boinc;
