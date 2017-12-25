/* eslint-disable import/default */
// react import
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

// antd import
import { LocaleProvider } from 'antd-mobile';
import enUS from 'antd-mobile/lib/locale-provider/en_US';

// local source import
import configureStore, { history } from './store/configureStore';

// local component import
import Root from './containers/root/root';

// load favicon.ico
require('./favicon.ico');

// initialization
const store = configureStore();

// render root
render(
  <LocaleProvider locale={enUS}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Root />
      </ConnectedRouter>
    </Provider>
  </LocaleProvider>,
  document.getElementById('root')
);
