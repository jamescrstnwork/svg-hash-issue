// This file configures a web server for testing the production build
// on your local machine.

// import browserSync from 'browser-sync';
import express from 'express';
import serveStatic from 'serve-static';
import historyApiFallback from 'connect-history-api-fallback';


let app = express();

app.use(historyApiFallback());

app.use('/',express.static('dist',{
  maxAge: '1d',
  setHeaders: setCustomCacheControl
}));


app.listen(3000);

// https://github.com/expressjs/serve-static
function setCustomCacheControl (res, path) {
  if (serveStatic.mime.lookup(path) === 'text/html') {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'public, max-age=0');
  }
}

// Run Browsersync
// browserSync({
//   port: 3000,
//   ui: {
//     port: 3001
//   },
//   open: false,
//   notify: false,
//   server: {
//     baseDir: 'dist'
//   },

//   files: [
//     'src/*.html'
//   ],

//   middleware: [historyApiFallback()]
// });
