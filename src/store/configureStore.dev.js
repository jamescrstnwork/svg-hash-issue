// This file merely configures the store for hot reloading.
// This boilerplate file is likely to be the same for each project that uses Redux.
// With Redux, the actual stores are in /reducers.

import { createStore, applyMiddleware, compose } from 'redux';

import rootReducer from '../reducers';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

// import { browserHistory } from 'react-router';
import createHistory from 'history/createBrowserHistory'; // react-route-v4 removed browserHistory, now its in seperate module

import { routerMiddleware } from 'react-router-redux';
import promiseMiddleware from './../utils/promise-middleware';

export const history = createHistory();
const logger = createLogger();
const router = routerMiddleware(history);

// https://github.com/ReactTraining/history#properties
// const unlisten = history.listen((location, action) => {
//   // location is an object like window.location
//   console.log('============= HISTORY ===============');
//   console.log(action, location.pathname, location.state);
//   console.log('====================================');
// });

// comment it, to listen
// unlisten();

const enhancer = compose(
  applyMiddleware(
    thunk,
    promiseMiddleware(),
    logger,
    router
  ),
  window.devToolsExtension ? window.devToolsExtension() : f => f
);

export default function configureStore(initialState) {
  const store = createStore(rootReducer,
    initialState, enhancer
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default; // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
