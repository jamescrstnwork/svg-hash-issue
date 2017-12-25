import React, {Component} from 'react';
import PropTypes from 'prop-types'; // ES6
import {connect} from 'react-redux';
import styled from 'styled-components';
// react-routes
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

// antd-mobile component

// components
// import Login from '../login/login';
import Home from '../home/home';

// antd-mobile style import
import 'antd-mobile/dist/antd-mobile.less';
import './global.less';

const Styled = styled('div')`

`;

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render = {
    props => (
      rest['isAuthenticated']
      ? ( <Component {...props}/>)
      : ( <Redirect to={{ pathname: '/login',state: { from: props.location }}}/>)
    )
  }/>
);

// Root component
class Root extends Component {
  static propTypes = {
    children: PropTypes.element,
    isAuthenticated: React.PropTypes.bool,
    routing: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      collapse: false
    };
  }

  render() {
    return (
      <Styled>
        <Switch>
          {/* <Route exact path="/login" component={Login} /> */}
          <PrivateRoute isAuthenticated={this.props.isAuthenticated} path="/" component={Home}/>
        </Switch>
      </Styled>
    );
  }
}

function mapStateToProps(state) {
  const {
    routing,
    auth: {
      isAuthenticated,
      user
    }
  } = state;
  return {isAuthenticated, user, routing};
}

// export default connect(mapStateToProps)(App);
export default withRouter(connect(mapStateToProps)(Root));
