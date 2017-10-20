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
    }] , (err, result) => {
      if (err) { console.log(err); res.status(500).send(err.message); return; }
      if (!result || !result[0]) {
        res.status(500).send('IPFS return no result');
        return;
      }
      res.json({ fields, hash256, ipfs: result });
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
