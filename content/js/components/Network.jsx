import React from 'react';
import { Grid, Container, Segment, Header, Dimmer, List, Flag, Divider } from 'semantic-ui-react';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, LabelList } from 'recharts';
// import { PieChart } from 'react-d3-basic';
// import { ResponsiveOrdinalFrame } from 'semiotic';

import Moment from 'react-moment';

import BigLoader from './BigLoader.jsx';
import GrcApi from '../GrcApi';
import chartColors from '../chartColors.js';

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

  makePeerList() {
    return (
      <List divided relaxed size="large" style={{ textAlign: 'left' }}>
        {
          this.state.peers
          .sort((a, b) => (a.conntime - b.conntime))
          .map(e => (
            <List.Item key={e.addr}>
              <List.Content>
                <List.Header style={{ wordBreak: 'break-all' }}>
                  <Flag name={e.country.toLowerCase()} />
                  {e.addr_rev || e.addr.split(':')[0]}
                </List.Header>
                <List.Description>
                  <span>
                    {e.inbound ? 'Inbound' : 'Outbound'},
                    Latency: {Math.round(e.pingtime * 1000)}ms
                  </span>
                  <span style={{ float: 'right' }}>Connected for <Moment unix fromNow ago>{e.conntime}</Moment></span>
                </List.Description>
              </List.Content>
            </List.Item>
        ))}
      </List>
    );
  }

  makeRegionChart() {
    const maxRegions = 8;

    const regionCounts = this.state.peers.reduce((a, { country }) => {
      a[country] = (a[country] || 0) + 1; // eslint-disable-line no-param-reassign
      return a;
    }, {});

    const regionCountsArray = Object.keys(regionCounts).map(country => ({
      country,
      count: regionCounts[country],
    })).sort((a, b) => (b.count - a.count)).reduce((a, v, index) => {
      if (index > maxRegions - 1) {
        a[maxRegions - 1].count += v.count; // eslint-disable-line no-param-reassign
      } else if (index === maxRegions - 1) {
        a[maxRegions - 1] = { // eslint-disable-line no-param-reassign
          country: 'Other',
          count: v.count,
        };
      } else {
        a.push(v);
      }

      return a;
    }, []);
    console.log('Region counts:', regionCountsArray);

    const renderCustomizedLabel = (params) => {
      const {
        cx, cy, startAngle, endAngle, innerRadius, outerRadius,
      } = params.viewBox;
      const midAngle = (startAngle + endAngle) / 2;
      const radius = innerRadius + ((outerRadius - innerRadius) * 0.8);
      const x = cx + (radius * Math.cos(-midAngle * (Math.PI / 180)));
      const y = cy + (radius * Math.sin(-midAngle * (Math.PI / 180)));

      return (
        <text fontWeight="bold" x={x} y={y} fill="black" textAnchor="middle" pointerEvents="none">
          {params.value}
        </text>
      );
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          {/* <Pie
            nameKey="name"
            dataKey="count"
            isAnimationActive={false}
            data={[{
              name: 'Total',
              count: regionCountsArray.reduce((a, v) => (a + v.count), 0),
            }]}
            label
            outerRadius="0%"
            strokeWidth={0}
            fill="transparent"
          /> */ }
          <Pie
            stroke="white"
            nameKey="country"
            dataKey="count"
            animationBegin={0}
            animationDuration={750}
            strokeWidth={2}
            isAnimationActive
            data={regionCountsArray}
            /* label={{
              fontWeight: 'bold',
              fill: 'white',
              textAnchor: 'middle',
            }}
            labelLine={{
              stroke: 'rgba(255, 255, 255, 1)',
              strokeWidth: 1,
            }} */
            label={false}
            innerRadius="0%"
          >
            {
              regionCountsArray.map(e => (
                <Cell
                  key={`cell-${e.country}`}
                  fill={chartColors[
                    (
                      (e.country.charCodeAt(0) << 8) | // eslint-disable-line no-bitwise
                      (e.country.charCodeAt(1)) // eslint-disable-line no-bitwise
                    ) % chartColors.length
                  ]}
                />
              ))
            }
            <LabelList content={renderCustomizedLabel} dataKey="country" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      /* <ResponsiveOrdinalFrame
        size={[400, 400]}
        data={regionCountsArray}
        oAccessor="country"
        style={e => ({
          fill: chartColors[
            (
              (e.country.charCodeAt(0) << 16) | // eslint-disable-line no-bitwise
              (e.country.charCodeAt(1) << 8) // eslint-disable-line no-bitwise
            ) % chartColors.length
          ],
          stroke: 'white',
        })}
        responsiveWidth
        projection="radial"
        type="bar"
        dynamicColumnWidth="count"
        oLabel
        hoverAnimation
        tooltipContent={() => 'bloop'}
        margin={{
          left: 20,
          top: 10,
          bottom: 10,
          right: 10
        }}
      /> */

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
        <Dimmer active>
          <Container>
            <Header size="huge" inverted>beep boop beep</Header>
          </Container>
        </Dimmer>
      );
    } else if (!this.state.peers) {
      return (<BigLoader />);
    }

    return (
      <Segment vertical basic>
        <Grid columns="equal" container stackable>
          <Grid.Row>
            <Grid.Column>
              <Header size="huge" textAlign="center">Network</Header>
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row>
            <Grid.Column>
              <Header size="large" textAlign="center">
                Peer location summary
              </Header>
              <Segment vertical basic>
                {this.makeRegionChart()}
                {/* <List>
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
                </List> */}
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header size="large" textAlign="center">
                Peers
              </Header>
              <Segment vertical basic>
                {this.makePeerList()}
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default Network;
