/* eslint 'import/no-unresolved': ['error', { caseSensitive: false }] */
const util = require('util');
const path = require('path');
const fs = require('fs');
const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const multiparty = require('multiparty');
const ipfsAPI = require('ipfs-api');
const sha256 = require('js-sha256');
const Eth = require('ethjs');
const EthContract = require('ethjs-contract');
const gm = require('gm').subClass({ imageMagick: true });

const LIKEMEDIA = require('./constant/contract/likemedia');
const config = require('./config/config.js');

const eth = new Eth(new Eth.HttpProvider('https://rinkeby.infura.io'));
const contract = new EthContract(eth);
const LikeContract = contract(LIKEMEDIA.LIKE_MEDIA_ABI);
const likeContract = LikeContract.at(LIKEMEDIA.LIKE_MEDIA_ADDRESS);
const ipfsHost = config.IPFS_HOST || 'like-ipfs';
const ipfs = ipfsAPI({
  host: ipfsHost,
  port: '5001',
  protocol: 'http',
})

const app = express();
app.use(compression());

if (config.DEBUG) app.use(cors({ origin: true }));

app.use(express.static('public'));
app.use('/ipfs', proxy({ target: `http://${ipfsHost}:8080` }));
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
    const fieldNames = [
      'key',
      'author',
      'description',
      'wallet',
      'ipfs',
      'license',
      'timestamp',
      'footprintIds',
      'footprintShares',
    ];
    const output = {};
    fieldNames.forEach((value, index) => {
      output[value] = result[index.toString()];
    });
    res.json(output);
  })
  .catch((err) => {
    res.status(500).send(err.message || err);
  });
});

app.post('/meme/:key', (req, res) => {
  const { text, topText } = req.body;
  const outputFields = req.body.metadata || {};
  likeContract.get(req.params.key)
  .then((result) => {
    const fieldNames = [
      'key',
      'author',
      'description',
      'wallet',
      'ipfs',
      'license',
      'timestamp',
      'footprintIds',
      'footprintShares',
    ];
    const output = {};
    fieldNames.forEach((value, index) => {
      output[value] = result[index.toString()];
    });
    return output;
  })
  .then((metadata) => {
    return ipfs.cat(metadata.ipfs);
  })
  .then((stream) => {
    gm(stream)
    .fill('#ffffff')
    .stroke('#000000', 2)
    .font('Noto-Sans-CJK-TC-Bold', 100)
    .drawText(0, 0, text || '', 'South')
    .drawText(0, 0, topText || '', 'North')
    .toBuffer((err, fileContent) => {
      if (err) return handle(err);
      const hash256 = sha256(fileContent);
      ipfs.files.add(fileContent)
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
