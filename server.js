/* eslint 'import/no-unresolved': ['error', { caseSensitive: false }] */
const util = require('util');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const multiparty = require('multiparty');
const ipfsAPI = require('ipfs-api');
const sha256 = require('js-sha256');
const Eth = require('ethjs');
const EthContract = require('ethjs-contract');

const LIKEMEDIA = require('./constant/contract/likemedia');
const config = require('./config/config.js');

const eth = new Eth(new Eth.HttpProvider('https://rinkeby.infura.io'));
const contract = new EthContract(eth);
const LikeContract = contract(LIKEMEDIA.LIKE_MEDIA_ABI);
const likeContract = LikeContract.at(LIKEMEDIA.LIKE_MEDIA_ADDRESS);
const ipfs = ipfsAPI({ host: 'like-ipfs', port: '5001', protocol: 'http' })

const app = express();
app.use(compression());

if (config.DEBUG) app.use(cors({ origin: true }));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/upload', (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    const { author, description,  wallet, footprints, license } = fields;
    const outputFields = {};
    Object.keys(fields).forEach((key) => {
      outputFields[key] = fields[key][0];
    });
    console.log(outputFields);
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
      outputFields.id = `0x${hash256}`;
      outputFields.ipfs = result[0];
      res.json(outputFields);
    })
    .catch((err) => {
      res.status(500).send(err.message || err);
    });
  });
});

app.get('/query/:key', (req, res) => {
  likeContract.get(req.params.key)
  .then((result) => {
    const mapping = {
      k: 'key',
      a: 'author',
      d: 'description',
      w: 'wallet',
      i: 'ipfs',
      l: 'license',
      t: 'timestamp',
    };
    const output = {};
    Object.keys(mapping).forEach((key) => {
      output[mapping[key]] = result[key];
    });
    res.json(output);
  })
  .catch((err) => {
    res.status(500).send(err.message || err);
  });
});

app.get('/', (req, res) => {
  res.sendStatus(200);
});

const port = process.env.PORT || config.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
