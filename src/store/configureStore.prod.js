import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import createHistory from 'history/createBrowserHistory'; // react-route-v4 removed browserHistory, now its in seperate module
import { routerMiddleware } from 'react-router-redux';

import promiseMiddleware from './../utils/promise-middleware';


export const history = createHistory();

const router = routerMiddleware(history);

export default function configureStore(initialState) {
  return createStore(rootReducer,
    initialState,
    applyMiddleware(
      thunk,
      promiseMiddleware(),
      router
    )
  );
}
