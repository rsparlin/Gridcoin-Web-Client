import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Menu } from 'semantic-ui-react';
import { matchPath, withRouter, Route, Switch, Redirect, Link } from 'react-router-dom';

import Dashboard from './Dashboard.jsx';
import Network from './Network.jsx';

/*
const GridcoinLogo = () => (
  <Image src='assets/gridcoin/GRCLogoOnly_White_Transparent.png'
    style={{ position: 'fixed', right: '0.1em', top: '0.1em' }}
    size='tiny' />
);
*/

class Root extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const nav = [
      {
        name: 'Dashboard',
        component: Dashboard,
        path: '/dashboard',
      },
      {
        name: 'Wallet',
        component: Dashboard,
        path: '/wallet',
      },
      {
        name: 'Transactions',
        component: Dashboard,
        path: '/transactions',
      },
      {
        name: 'Network',
        component: Network,
        path: '/network',
      },
      {
        name: 'Mining',
        component: Dashboard,
        path: '/mining',
      },
      {
        name: 'About',
        component: Dashboard,
        path: '/about',
      },
    ];

    const defaultNav = nav[0];

    const activeNav = nav.find(item => matchPath(this.props.location.pathname, {
      path: item.path,
    })) || defaultNav;

    return (
      <div>
        <Menu borderless>
          {
            nav.map(item => (
              <Menu.Item
                key={item.name}
                as={Link}
                to={item.path}
                name={item.name}
                active={item === activeNav}
              />
            ))
          }
        </Menu>
        {/* <GridcoinLogo /> */}
        <Segment vertical basic>
          <Switch>
            {
              nav.map(item => (
                <Route key={item.name} path={item.path} component={item.component} />
              ))
            }
            <Route>
              <Redirect to={defaultNav.path} />
            </Route>
          </Switch>
        </Segment>
      </div>
    );
  }
}

Root.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(Root);
