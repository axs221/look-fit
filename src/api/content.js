/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import { join } from 'path';
import { Router } from 'express';
import jade from 'jade';
import fm from 'front-matter';
import fs from '../utils/fs';
import secret from '../secret_config'
import https from 'https'

// A folder with Jade/Markdown/HTML content pages
const CONTENT_DIR = join(__dirname, './content');

// Extract 'front matter' metadata and generate HTML
const parseJade = (path, jadeContent) => {
  const content = fm(jadeContent);
  const html = jade.render(content.body, null, '  ');
  const page = Object.assign({ path, content: html }, content.attributes);
  return page;
};

const router = new Router();

router.get('/authorize', async (req, res, next) => {
  try {
    console.log('Authorizing...');

    if (!req.query) {
      // TODO - TESTING
      res.status(200).send({ 'accessToken': '' });
      return;
    }

    //let body = 'client_id=229TPJ&grant_type=authorization_code&redirect_uri=http%3A%2F%2Fshawnaxsom.com%2Fcallback'
    let body = 'client_id=229TPJ&grant_type=authorization_code&redirect_uri=http://shawnaxsom.com/callback'
    body += '&code=' + req.query.code;

    let options = {
      host: 'api.fitbit.com',
      port: 443,
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length' : Buffer.byteLength(body, 'utf8'),
        'Authorization' : 'Basic ' + secret.base64OfClientIdColonClientSecret
      }
    };

    let tokenReq = https.request(options, function(tokenRes) {
      tokenRes.setEncoding('utf8');

      tokenRes.on('data', function (chunk) {
        let data = JSON.parse(chunk);
        console.log('Access Token: ' + data.access_token);
        res.status(200).send({ 'accessToken': data.access_token });
      });
      tokenRes.on('error', function (error) {
        console.log('ERROR: ' + error);
      });
    });


    tokenReq.write(body);
    tokenReq.end();
  } catch(err) {
    console.log(err.message);
  }
});

router.get('/', async (req, res, next) => {
  try {
    let path = req.query.path;

    if (!path || path === 'undefined') {
      res.status(400).send({error: `The 'path' query parameter cannot be empty.`});
      return;
    }

    let fileName = join(CONTENT_DIR, (path === '/' ? '/index' : path) + '.jade');
    if (!await fs.exists(fileName)) {
      fileName = join(CONTENT_DIR, path + '/index.jade');
    }

    if (!await fs.exists(fileName)) {
      res.status(404).send({error: `The page '${path}' is not found.`});
    } else {
      const source = await fs.readFile(fileName, { encoding: 'utf8' });
      const content = parseJade(path, source);
      res.status(200).send(content);
    }
  } catch (err) {
    next(err);
  }
});

export default router;

