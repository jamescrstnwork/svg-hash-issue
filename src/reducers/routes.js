// // import { ROUTES } from './../constants/actionTypes';
// import initialState from './initialState';
// import reducersGenerate from './reducersGenerate';
// import _ from 'lodash';

// export default reducersGenerate(ROUTES, initialState.routes, {
//   'ROUTES_PENDING': (state) => {
//     return Object.assign({}, state, {
//       isFetching: true
//     });
//   },
//   'ROUTES_FULFILLED': (state, action) => {
//     let newValues = _.clone(state.data);

//     let exist = _.find(newValues,{path: action.payload.path});

//     // console.log('====================================');
//     // console.log('ROUTES_FULLFILLED: exist: %o',exist);
//     // console.log('====================================');

//     if(!exist){
//       newValues.push(action.payload);
//     }

//     return Object.assign({}, state, {
//       isFetching: false,
//       data: newValues
//     });
//   },
//   'ROUTES_REJECTED': (state, action) => {
//     return Object.assign({}, state, {
//       isFetching: false,
//       data: state.data,
//       errorMessage: action.message
//     });
//   }
// });
