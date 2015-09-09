/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import 'babel/polyfill';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import express from 'express';
import ReactDOM from 'react-dom/server';
import Router from './Router';
import secret from './secret_config'
import https from 'https'
import cookieParser from 'cookie-parser'
import session from 'express-session'

if (process.env.NODE_ENV !== 'production'){
    require('longjohn');
}

const server = global.server = express();

server.set('port', (process.env.PORT || 5000));
server.use(express.static(path.join(__dirname, 'public')));

server.use(cookieParser());
server.use(session({secret: 'hiamasessionsecret'}));

//
// Register API middleware
// -----------------------------------------------------------------------------
server.use('/api/content', require('./api/content'));

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------

// The top-level React component + HTML template for it
const templateFile = path.join(__dirname, 'templates/index.html');
const template = _.template(fs.readFileSync(templateFile, 'utf8'));

//server.get('/authorize', async (req, res, next) => {
//  try {
//    console.log('Authorizing...');
//
//    //let body = 'client_id=229TPJ&grant_type=authorization_code&redirect_uri=http%3A%2F%2Fshawnaxsom.com%2Fcallback'
//    let body = 'client_id=229TPJ&grant_type=authorization_code&redirect_uri=http://shawnaxsom.com/callback'
//    body += '&code=' + req.query.code;
//
//    let options = {
//      host: 'api.fitbit.com',
//      port: 443,
//      path: '/oauth2/token',
//      method: 'POST',
//      headers: {
//        'Content-Type' : 'application/x-www-form-urlencoded',
//        'Content-Length' : Buffer.byteLength(body, 'utf8'),
//        'Authorization' : 'Basic ' + secret.base64OfClientIdColonClientSecret
//      }
//    };
//
//    console.log(JSON.stringify(options));
//
//    console.log('Requesting token');
//
//    let tokenReq = https.request(options, function(tokenRes) {
//      console.log('STATUS: ' + tokenRes.statusCode);
//      console.log('HEADERS: ' + JSON.stringify(tokenRes.headers));
//      tokenRes.setEncoding('utf8');
//
//      tokenRes.on('data', function (chunk) {
//        let data = JSON.parse(chunk);
//        console.log('Access Token: ' + data.access_token);
//        req.session.accessToken = data.access_token;
//        res.redirect('/');
//      });
//      tokenRes.on('error', function (error) {
//        console.log('ERROR: ' + error);
//      });
//    });
//
//
//    tokenReq.write(body);
//    tokenReq.end();
//    console.log('Request sent');
//  } catch(err) {
//    console.log(err.message);
//  }
//});

server.get('*', async (req, res, next) => {
  try {
    let statusCode = 200;
    const data = { title: '', description: '', css: '', body: '' };
    const css = [];
    const context = {
      onInsertCss: value => css.push(value),
      onSetTitle: value => data.title = value,
      onSetMeta: (key, value) => data[key] = value,
      onPageNotFound: () => statusCode = 404
    };

    await Router.dispatch({ path: req.path, context }, (state, component) => {
      data.body = ReactDOM.renderToString(component);
      data.css = css.join('');
    });

    const html = template(data);
    res.status(statusCode).send(html);
  } catch (err) {
    next(err);
  }
});

//
// Launch the server
// -----------------------------------------------------------------------------

server.listen(server.get('port'), () => {
  if (process.send) {
    process.send('online');
  } else {
    console.log('The server is running at http://localhost:' + server.get('port'));
  }
});
