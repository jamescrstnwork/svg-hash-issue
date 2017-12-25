// 1) JS Build
//    npm run build
// 2) docker build :
//    docker build -t mobile-erp-view . --compress=true
// 3) docker run :
//    docker run -p 3000:3000 --name m-view mobile-erp-view

const express = require('express');
const serveStatic =require('serve-static');
const historyApiFallback = require('connect-history-api-fallback');
const compression = require('compression');

const PORT=3000;

let app = express();

// gzip compression
// http://expressjs.com/en/advanced/best-practice-performance.html#use-gzip-compression
app.use(compression());

app.use(historyApiFallback());

app.use('/',express.static('dist',{
  maxAge: '1d',
  setHeaders: setCustomCacheControl
}));

function afterStart(){
  console.log('Listening at http://127.0.0.1:%s',PORT);
}

app.listen(PORT,afterStart);


// https://github.com/expressjs/serve-static
function setCustomCacheControl (res, path) {
  if (serveStatic.mime.lookup(path) === 'text/html') {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'public, max-age=0');
  }
}
