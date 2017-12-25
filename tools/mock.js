/* eslint-disable no-console */
import jsonServer from 'json-server';
import enableDestroy from 'server-destroy';
// import chokidar from 'chokidar';
// import path from 'path';
// import fs from 'fs';
import querystring from 'querystring';
import _ from 'lodash';
import bodyParser from 'body-parser';
import {chalkSuccess} from './chalkConfig';
// import FileAsync from 'lowdb/adapters/FileAsync';

const PORT = 4000;
let server = null;
const db = './src/data/db.json';

// use middlewares when , some global level intercept injection needed
const middlewares = jsonServer.defaults();

let router = jsonServer.router(db);
const token = "7xPJPuVfTse2pFHc5Pfu";

function isAuthorized(req){
  return req.get("Authorization") == token;
}

function start(){
  const app = jsonServer.create();

  app.use(middlewares);

  // for json pojo unmarshalling
  app.use(bodyParser.json());

  app.use(function(req, res, next) {
    if (req.originalUrl == "/api/v1/auth"){
      return res.send({
        access_token: token
      });
    }
    if (req.originalUrl == '/db' || isAuthorized(req)) { 
      // add your authorization logic here
      // continue to Mock Server router
      console.log('====================================');
      console.log('main route, before router next()');
      console.log('====================================');
      next();
    } else {
      res.sendStatus(401);
    }
  });
 
  // Add this before app.use(router)
  app.use(jsonServer.rewriter({
    '/api/v1/*': '/$1'
  }));


  app.get('/accounts',(req,res)=>{
    let params = querystring.parse(req._parsedOriginalUrl.query);
    let accounts = router.db.get('accounts').value();
    let persons = router.db.get('persons').value();
    let businesses = router.db.get('businesses').value();
    let q = _.toLower(params["q"]);
    // console.log("params : %o",params);
    // console.log("persons : %o",persons);
    // console.log("q : %o",q);
    // let filtered = _.filter(persons, 
    //   v => { return v.firstname.toLowerCase().includes(q) || 
    //     v.lastname.toLowerCase().includes(q)
    //   }
    // );

    let accountPersons=_.map(accounts,v => {
      let p =_.find(persons,['id',v.person]);
      let b =_.find(businesses,['id',v.business]);

      // console.log('\n account: %o \n person: %o \n business: %o \n\n',v.id,p,b);

      let condition = _.toLower(p.firstname).includes(q);
      condition |= _.toLower(p.lastname).includes(q);

      if(b){
        condition |= _.toLower(b.name).includes(q);
        condition |= _.toLower(b.address).includes(q);
        condition |= _.toLower(b.gst).includes(q);
      }

      return condition?{ id:v.id, person: p, business: b}:null;
    });

    accountPersons = _.filter(accountPersons,v=>v);
    
    res.jsonp(preparePageResponse(accountPersons));
  });

  // https://github.com/typicode/lowdb/tree/master/examples#server
  app.post('/accounts', (req, res) => {
        console.log('========== [POST] /account ==========');
        // console.log('Person : %o',req.body.person);
        // console.log('BusinessEntity : %o',req.body.entity);
        // console.log('',);
        
        // Ref: https://github.com/typicode/lodash-id
        // Overwrite it if you want to use another id property.
        // _.id = '_id'

        //validation
        
        const {
          person,
          business
        } = req.body;

        let rdb = router.db;
        let ldb = rdb._;

        let collPersons = rdb.get('persons');
        let collBusinesses = rdb.get('businesses');
        let collAccounts = rdb.get('accounts');

        // let test = rdb.get('users').value();

        let newPersonId=   ldb.createId(collPersons.value());
        let newBusinessId= ldb.createId(collBusinesses.value());
        let newAccountId=  ldb.createId(collAccounts.value());

        if(business){
          let gstNumber = _.isString(business) ? business : business.gst;
          let exist=collBusinesses.find({gst: gstNumber}).value();
          if(_.isString(business)){
            // taking ref of business
            if(!exist){
              res.send({error: 'Such GST number does not exist.'});
              return;
            }
            newBusinessId = exist.id;
          }else{
            // new business request
            if(exist){ 
              // check duplicacy
              res.send({error: 'GST number exist.'});
              return;
            }
            collBusinesses
              .push(business)
              .last()
              .assign({ id: newBusinessId})
              .write()
              .then(r=>{
                console.log('resp business : %o',r);  
              });
      
          }
        }
        
        if(person){
          collPersons
            .push(person)
            .last()
            .assign({ id: newPersonId})
            .write()
            .then(r=>{
              console.log('resp person : %o',r);  
            });    
        }

        let newAccount={
          id: newAccountId, 
          person: newPersonId
        };

        if(business){
          newAccount['business'] = newBusinessId;
        }

        console.log('newAccount : %o', newAccount);
        
        collAccounts
        .push(newAccount)
        .write().then(r=>{
          console.log('resp account : %o',r);  
        });

    res.send({status: 'RECEIVED', time: Date.now()});
  });


  // app.get('/echo',(req,res) => {
  //   res.jsonp(db.users);
  // });

  router.render = (req,res) => {
    let d_resp={};

    switch (req.method) {
      case "POST":
        d_resp = wrapNewEntityResponse(req,res);
        break;
    
      default:
        d_resp = wrapPaginationRespose(req,res);
        break;
      }

    console.log('router.render response return d_resp: %o',d_resp);
    res.jsonp(d_resp);
  };

  app.use(router);

  server = app.listen(PORT, () => {
    console.log(chalkSuccess('Mock Server is running'));
  });

  // webSocketEnable(app,server);

  // Enhance with a destroy function
  enableDestroy(server);
}

function wrapNewEntityResponse(req,res){
  let status="failed";
  if(res.locals.data){
    status="RECEIVED";
  }
  return {status};
}

function wrapPaginationRespose(req,res){
  console.log('========== [START] === wrapPagination() =======');
  console.log("res.locals.data: %o",res.locals.data);
  if(!req._parsedOriginalUrl || !req._parsedOriginalUrl.query){
    console.log('====================================');
    console.log('inside router.render, returning : ',res.locals.data);
    console.log('====================================');
    return res.locals.data;
  }

  let params = querystring.parse(req._parsedOriginalUrl.query);
  console.log('====================================');
  console.log('render : params : %o',params);
  // console.log('render : req._parsedOriginalUrl : %o',req._parsedOriginalUrl);
  console.log('====================================');
  
  let perPage = Number.parseInt(params._limit);
  let page = Number.parseInt(params._page);
  let totalCount = res.getHeader('x-totalo-count');
  totalCount = totalCount ? totalCount : res.locals.data.length;
  page = page ? page : 1;
  perPage = perPage ? perPage : 10;

  let pageData = preparePageResponse(res.locals.data,perPage,page,totalCount);

  // console.log('====================================');
  // console.log('pageData: %o', pageData);
  // console.log('====================================');
  console.log('========== [END] === wrapPagination() =======');
  
  return pageData;
}

function preparePageResponse(data,perPage=10,page=1,total=data.length){
  return {
    data: data,
    meta: {
      total: total,
      perPage: perPage,
      page: page
    }
  };
}

// mocking websocket
// function webSocketEnable(){
//   var io = require('socket.io')(server);

//   io.of('/app')
//     .on('connection', function(socket){
//       console.log('a user connected');
//       socket.on('disconnect', function(){
//         console.log('user disconnected');
//       });
//   });
  
//   // testWsClient();
// }

// function testWsClient(){
//   var ioc = require('socket.io-client');  
//   let sclient = ioc.connect('http://localhost:'+PORT+'/app', {
//     'reconnection delay' : 0
//     , 'reopen delay' : 0
//     , 'force new connection' : true
//   });
//   sclient.on('connect', function() {
//       console.log('worked...');
//       done();
//   });
//   sclient.on('disconnect', function() {
//       console.log('disconnected...');
//   })
// }

// Watch .js or .json file
// Since lowdb uses atomic writing, directory is watched instead of file
// chokidar
//   .watch(path.dirname(db))
//   .on('change', function (file) {
//     const obj = JSON.parse(fs.readFileSync(file));
//     const isDatabaseDifferent = !_.isEqual(obj, router.db.getState());
//     if (isDatabaseDifferent) {
//       console.log(chalkSuccess('File was changed, Reloading... %or));
//       server && server.destroy();
//       router = jsonServer.router(obj);
//       start();
//     }
//   });

start();
