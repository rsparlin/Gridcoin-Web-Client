import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Responsive } from 'semantic-ui-react';
import { matchPath, withRouter, Route, Switch, Redirect, Link } from 'react-router-dom';

import Dashboard from './Dashboard.jsx';
import Network from './Network.jsx';
import Transactions from './Transactions.jsx';
import Wallet from './Wallet.jsx';
import Boinc from './Boinc.jsx';

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
        component: Wallet,
        path: '/wallet',
      },
      {
        name: 'Transactions',
        component: Transactions,
        path: '/transactions',
      },
      {
        name: 'Network',
        component: Network,
        path: '/network',
      },
      {
        name: 'BOINC',
        component: Boinc,
        path: '/boinc',
      },
    ];

    const defaultNav = nav[0];

    const activeNav = nav.find(item => matchPath(this.props.location.pathname, {
      path: item.path,
    })) || defaultNav;

    const navItems = nav.map(item => (
      <Menu.Item
        key={item.name}
        as={Link}
        to={item.path}
        name={item.name}
        active={item === activeNav}
      />
    ));

    const content = (
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
    );

    const vertMenuStyle = {
      background: 'url("content/GRCVertical_Purple_Transparent.png")',
      backgroundSize: '80%',
      backgroundRepeat: 'no-repeat',
      backgroundPositionY: '99%',
      backgroundPositionX: '50%',
    };

    return (
      <div>
        <Responsive as="div" minWidth={1024}>
          <Menu borderless fixed="left" vertical style={vertMenuStyle}>
            {navItems}
          </Menu>
          <div style={{ height: '100%', marginLeft: '15rem' }}>
            {content}
          </div>
        </Responsive>
        <Responsive as="div" maxWidth={1023}>
          <Menu borderless fixed="top">
            {navItems}
          </Menu>
          <div style={{ width: '100%', marginTop: '5rem' }}>
            {content}
          </div>
        </Responsive>
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
