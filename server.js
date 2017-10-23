/* eslint 'import/no-unresolved': ['error', { caseSensitive: false }] */
const util = require('util');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const multiparty = require('multiparty');
const ipfsAPI = require('ipfs-api');
const sha256 = require('js-sha256');
const ipfs = ipfsAPI({ host: 'like-ipfs', port: '5001', protocol: 'http' })

const config = require('./config/config.js');

const app = express();
app.use(compression());

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/upload', (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (!files.image) {
      res.status(500).send('Image not found');
      return;
    }
    const targetImage = files.image.find(image => 'image' === image.fieldName);
    if (!targetImage) {
      res.status(500).send('Invalid image');
      return;
    }
    const fileContent = fs.readFileSync(targetImage.path);
    const hash256 = sha256(fileContent);
    ipfs.files.add([{
      path: path.basename(targetImage.path),
      content: fileContent,
    }])
    .then((result) => {
      if (!result || !result[0]) {
        return Promise.reject(
          new Error('IPFS add return no result'));
      }
      return ipfs.pin.add(result[0].hash);
    })
    .then((result) => {
      if (!result || !result[0]) {
        return Promise.reject(
          new Error('IPFS pin return no result'));
      }
      res.json({ fields, hash256, ipfs: result[0] });
    })
    .catch((err) => {
      res.status(500).send(err.message || err);
    });
  });
});

app.get('/query/:key', (req, res) => {
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.sendStatus(200);
});

const port = process.env.PORT || config.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
