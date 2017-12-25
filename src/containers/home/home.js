import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';

// routes
import {Route,  Switch , withRouter} from 'react-router-dom';

// antd-mobile imports
import {Badge,TabBar, Drawer, List} from 'antd-mobile';

// static menu json
import menus from './menus.data';

// style import
import Styled from './home-style';

// custom components
import Icon from '../../components/icon/icon';
// import TabBar from '../../components/tabbar/TabBar';
// import NoPageFound from '../../components/not-found-page/not-found-page';


class Home extends Component {
  constructor(props) {
    super(props);

    this.contentArea = undefined;

    this.state = {
      theme: {
        contentPane: {
          textColor: '#A6A6A6'
        }
      },
      drawerMenus: [],
      contentRoutes: [],
      notifications: [],
      fullScreen: true,
      collapsed: false,
      badges: {
        appTabBar: 0
      },
      appTabBar: {
        selectedKey: "NONE",
        visible: true,
        items: []
      }
    };
  }

  componentDidMount(){
    this.ldMenus();
    this.ldTbRoutes();

  }

  ldTbRoutes = () => {
    const {location,match} = this.props;

    const tabItems = _.filter(menus,{type: 102});

    const r_TabItems = _.transform(tabItems,(r,v)=>{
      r.push(
        <TabBar.Item
          title={v.title}
          key={v.path}
          icon={
            <div style={{
              width: '22px',
              height: '22px',
              background: `url(/app.icons.svg#${v.icon}-usage) center center /  21px 21px no-repeat`}}
            />
          }
          selectedIcon={
            <div style={{
              width: '22px',
              height: '22px',
              background: `url(/app.icons.svg#${v.icon}-usage) center center /  21px 21px no-repeat`}}
            />
          }
          selected={_.eq(location.pathname,`${match.url}${v.path}`)}
          badge={this.state.badges.appTabBar}
          onPress={()=>this.tabClick(v)}
        />
      );
    },[]);

    // console.log('loadTabRoutes r_TabItems : ',r_TabItems);

    this.setState((state) => (
      {
        appTabBar: {
          ...state.appTabBar,
          items: r_TabItems
        }
      }
    ));

    _.map(tabItems,
      (v)=>{
        import(`bundle-loader?lazy!../../screens/${v.screen}`)
        .then(bundle=>{
          bundle((f)=>{
            let path = `${this.props.match.url}${v.path}`;

            // if(_.eq(location.pathname,`${match.url}${v.path}`)){
            //   // if current location is selected, then set tab-selection
            //   this.setState((state)=>{
            //     return ({
            //       appTabBar: {
            //         ...state.appTabBar,
            //         selectedKey: location.pathname
            //       }
            //     });
            //   });
            // }

            this.setState((prevState) => ({
              contentRoutes: _.concat(prevState.contentRoutes, [<Route key={v.screen} path={path} component={f.default} />] )
            }));
          });
        });
      }
    );
  };

  ldMenus = () => {
    // after menu loaded, create drawer menu bar
    const drawerItems = _.filter(menus,{type: 101});

    const drawerMenus = (
      <List renderHeader={this.drawerHeader}>
      {
        _.map(drawerItems, (v, i) => {
          return (
            <List.Item style={{backgroundColor:'#C5D5D6',fontVariant: 'normal'}} thumb={<Icon type={v.icon} size="xs" />} key={i} multipleLine onClick={()=>this.onDrawerMenuClick(v)}>
              {v.title}
            </List.Item>
          );
        })
      }
      </List>
    );

    this.setState({drawerMenus});

    // generate routes async
    _.map(drawerItems,v=>{
      import(`bundle-loader?lazy!../../screens/${v.screen}`)
      .then(bundle=>{
        bundle((f)=>{
          let path = `${this.props.match.url}${v.path}`;
          this.setState((prevState) => ({
            contentRoutes: _.concat(prevState.contentRoutes, [<Route key={v.screen} path={path} component={f.default} />] )
          }));
        });
      });
    });
  };

  drawerHeader = () => {
    // console.log('drawerHeader, user info');
    return (
      <List>
        <List.Item className="user" extra={<Icon type="avatar" />} >
          <span>James Christian</span>
        </List.Item>
        <List.Item className="logout" extra={<Icon type="logout" />} >
          <span></span>
        </List.Item>
      </List>
    );
  };

  // drawerFooter = () => {
  //   console.log('drawerFooter, user logout');
  //   return (
  //     <Button type="ghost" size="small" inline>Logout</Button>
  //   );
  // };

  onDrawerMenuClick = (menu) => {
    console.log('drawerMenuClick : ',menu );
    const {history,match} = this.props;
    this.onCollapse(false);
    history.push(`${match.url}${menu.path}`);
  };

  onCollapse = (v) => {
    console.log('drawer event: ',v);
    this.setState({
      collapsed: v
    });
  };

  renderTabTitle = (v) => {
    return (
      <Badge text={'10'}><Icon type={v.icon} size="xs" />{v.title}</Badge>
    );
  };

  tabClick = (v) => {
    // console.log('tabClick : value :',v);

    if(v.path === this.state.appTabBar.selectedKey){
      return;
    }
    this.setState((state)=>{
      return ({
        appTabBar: {
          ...state.appTabBar,
          selectedKey: v.path
        }
      });
    },()=>this.onCollapse(false));
    this.props.history.push(`${this.props.match.url}${v.path}`,{selectedTabKey: v.path});
  };

  render() {

    // const {history, activity} = this.props;
    const {
      appTabBar,
      drawerMenus,
      theme,
      collapsed,
      contentRoutes
    } = this.state;

    // onLeftClick={()=>history.goBack()}>
    return (
      <Styled theme={theme}>
        {
        /*
        <NavBar
          mode="dark"
          icon={<Icon type="more-ol-vt-gold" size="lg" onClick={()=>this.onCollapse(!collapsed)} />}
        >
          Welcome
        </NavBar> */
        }
        <Drawer
          className="appDrawer"
          style={{ minHeight: document.documentElement.clientHeight-50 }}
          enableDragHandle
          sidebarStyle={{backgroundColor:'#34495E'}}
          dragHandleStyle={{ position: 'fixed',backgroundColor: 'rgba(50,50,50,0)'}}
          contentStyle={{ color: `${theme.contentPane.textColor}`, textAlign: 'center', backgroundColor: 'rgba(50, 50, 50, 0)' }}
          sidebar={drawerMenus}
          open={collapsed}
          onOpenChange={(v)=>this.onCollapse(v)}
        >
          <Switch>
            {contentRoutes}
            {/* <Redirect to={`${match.url}dashboard`} /> */}
          </Switch>
        </Drawer>
        <TabBar
          unselectedTintColor="white"
          tintColor="#F9BF3B"
          barTintColor="#2C3E50"
          hidden={!appTabBar.visible}
        >
          {appTabBar.items}
        </TabBar>
      </Styled>
    );
  }
}

Home.propTypes = {
  routes: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.object,
  children: PropTypes.element
};

function mapStateToProps(state) {
  const {
    auth: {
      isAuthenticated,
      user
    },
    routes
  } = state;
  return {isAuthenticated, user, routes};
}

export default withRouter(connect(mapStateToProps)(Home));
