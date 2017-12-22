/* eslint 'import/no-unresolved': ['error', { caseSensitive: false }] */
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
const abi = require('ethjs-abi');
const signer = require('ethjs-signer');
const BN = require('bn.js');

const ONE_LIKE = new BN(10).pow(new BN(18));

const LIKEMEDIA = require('./constant/contract/likemedia');
const LIKECOIN = require('./constant/contract/likecoin');
const config = require('./config/config.js');
const accounts = require('./config/accounts.js');

const eth = new Eth(new Eth.HttpProvider('https://rinkeby.infura.io/ywCD9mvUruQeYcZcyghk'));
const contract = new EthContract(eth);
const LikeMediaContract = contract(LIKEMEDIA.LIKE_MEDIA_ABI);
const likeMediaContract = LikeMediaContract.at(LIKEMEDIA.LIKE_MEDIA_ADDRESS);
const ipfsHost = config.IPFS_HOST || 'like-ipfs';
const ipfsApiHost = config.IPFS_API_HOST || 'like-ipfs';
const ipfs = ipfsAPI({
  host: ipfsApiHost,
  port: '5001',
  protocol: 'http',
});

const uploadAbi = LIKEMEDIA.LIKE_MEDIA_ABI.find(obj => (obj.type === 'function' && obj.name === 'upload'));
const transferAbi = LIKECOIN.LIKE_COIN_ABI.find(obj => (obj.type === 'function' && obj.name === 'transfer'));
const giveLikeDelegatedAbi = LIKEMEDIA.LIKE_MEDIA_ABI.find(obj => (obj.type === 'function' && obj.name === 'giveLikeDelegated'));
const {
  privateKey,
  address,
  gasPrice,
  gasLimit,
} = accounts[0];

function getUploadTxData(metaFields) {
  const footprintsArray = JSON.parse(metaFields.footprints);
  const footprintKeys = footprintsArray.map(f => f.id);
  const footprintValues = footprintsArray.map(f => f.share);
  const params = [
    metaFields.id,
    metaFields.author,
    metaFields.description,
    metaFields.wallet,
    metaFields.ipfs,
    footprintKeys,
    footprintValues,
    metaFields.license,
  ];
  return abi.encodeMethod(uploadAbi, params);
}

function checkAddressValid(addr) {
  return addr.length === 42 && addr.substr(0, 2) === '0x';
}

function checkFingerprintValid(addr) {
  return addr.length === 66 && addr.substr(0, 2) === '0x';
}

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
    if (err) {
      res.status(500).send(err.message || err);
      return;
    }

    const outputFields = {};
    Object.keys(fields).forEach((key) => {
      [outputFields[key]] = fields[key];
    });

    if (!checkAddressValid(outputFields.wallet)) {
      res.status(400).send('Invalid author wallet');
      return;
    }

    if (!files.image) {
      res.status(400).send('Image not found');
      return;
    }
    const targetImage = files.image.find(image => image.fieldName === 'image');
    if (!targetImage) {
      res.status(400).send('Invalid image');
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
          return Promise.reject(new Error('IPFS add return no result'));
        }
        return ipfs.pin.add(result[0].hash);
      })
      .then((result) => {
        if (!result || !result[0]) {
          return Promise.reject(new Error('IPFS pin return no result'));
        }
        [outputFields.ipfs] = result;
        return eth.getTransactionCount(address, 'pending');
      })
      .then((result) => {
        if (!result) {
          return Promise.reject(new Error('ETH getTransactionCount return no result'));
        }
        outputFields.id = `0x${hash256}`;
        const txData = getUploadTxData(outputFields);
        const tx = signer.sign({
          nonce: result.toNumber(),
          to: LIKEMEDIA.LIKE_MEDIA_ADDRESS,
          data: txData,
          gasPrice,
          gasLimit,
        }, privateKey);
        return eth.sendRawTransaction(tx);
      })
      .then((txHash) => {
        outputFields.txHash = txHash;
        res.json(outputFields);
      })
      .catch((e) => {
        res.status(500).send(e.message || e);
      });
  });
});

app.get('/query/:key', (req, res) => {
  if (!checkFingerprintValid(req.params.key)) {
    res.status(400).send('Invalid image fingerprint');
    return;
  }
  likeMediaContract.get(req.params.key)
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

app.post("/like/:key", (req, res) => {
  const key = req.params.key;
  if (!checkFingerprintValid(key)) {
    res.status(400).send('Invalid image fingerprint');
    return;
  }

  const {from, value, nonce, v, r, s} = req.body;
  if (!from || !checkAddressValid(from)) {
    res.status(400).send('Invalid from wallet');
    return;
  }

  eth.getTransactionCount(address, 'pending')
    .then((result) => {
      if (!result) {
        return Promise.reject(new Error('ETH getTransactionCount return no result'));
      }
      const txData = abi.encodeMethod(giveLikeDelegatedAbi, [key, from, value, nonce, v, r, s])
      const tx = signer.sign({
        nonce: result.toNumber(),
        to: LIKEMEDIA.LIKE_MEDIA_ADDRESS,
        data: txData,
        gasPrice,
        gasLimit,
      }, privateKey);
      return eth.sendRawTransaction(tx);
    })
    .then((txHash) => {
      res.json({ txHash });
    })
    .catch((err) => {
      res.status(500).send(err.message || err);
    });
});

app.post('/faucet/:addr', (req, res) => {
  const to = req.params.addr;
  if (!checkAddressValid(to)) {
    res.status(400).send('Invalid wallet');
    return;
  }

  const value = ONE_LIKE.mul(new BN(100));
  eth.getTransactionCount(address, 'pending')
    .then((result) => {
      if (!result) {
        return Promise.reject(new Error('ETH getTransactionCount return no result'));
      }
      const txData = abi.encodeMethod(transferAbi, [to, value])
      const tx = signer.sign({
        nonce: result.toNumber(),
        to: LIKECOIN.LIKE_COIN_ADDRESS,
        data: txData,
        gasPrice,
        gasLimit,
      }, privateKey);
      return eth.sendRawTransaction(tx);
    })
    .then((txHash) => {
      res.json({ txHash });
    })
    .catch((err) => {
      res.status(500).send(err.message || err);
    });
});

app.post('/meme/:key', (req, res) => {
  const { text, topText } = req.body;
  const outputFields = req.body.metadata || {};

  if (!checkFingerprintValid(req.params.key)) {
    res.status(400).send('Invalid image fingerprint');
    return;
  }

  if (!outputFields.wallet || !checkAddressValid(outputFields.wallet)) {
    res.status(400).send('Invalid author wallet');
    return;
  }

  likeMediaContract.get(req.params.key)
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
    .then(metadata => ipfs.cat(metadata.ipfs))
    .then((stream) => {
      gm(stream)
        .fill('#ffffff')
        .stroke('#000000', 2)
        .font('Noto-Sans-CJK-TC-Bold', 100)
        .drawText(0, 0, text || '', 'South')
        .drawText(0, 0, topText || '', 'North')
        .toBuffer((err, fileContent) => {
          if (err) {
            res.status(500).send(err.message || err);
            return;
          }
          const hash256 = sha256(fileContent);
          ipfs.files.add(fileContent)
            .then((result) => {
              if (!result || !result[0]) {
                return Promise.reject(new Error('IPFS add return no result'));
              }
              return ipfs.pin.add(result[0].hash);
            })
            .then((result) => {
              if (!result || !result[0]) {
                return Promise.reject(new Error('IPFS pin return no result'));
              }
              [outputFields.ipfs] = result;
              return eth.getTransactionCount(address, 'pending');
            })
            .then((result) => {
              if (!result) {
                return Promise.reject(new Error('ETH getTransactionCount return no result'));
              }
              outputFields.id = `0x${hash256}`;
              const txData = getUploadTxData(outputFields);
              const tx = signer.sign({
                nonce: result.toNumber(),
                to: LIKEMEDIA.LIKE_MEDIA_ADDRESS,
                data: txData,
                gasPrice,
                gasLimit,
              }, privateKey);
              return eth.sendRawTransaction(tx);
            })
            .then((txHash) => {
              outputFields.txHash = txHash;
              res.json(outputFields);
            })
            .catch((e) => {
              res.status(500).send(e.message || e);
            });
        });
    })
    .catch((err) => {
      res.status(500).send(err.message || err);
    });
});

app.get('/balance', (req, res) => {
  eth.getBalance(req.query.key || address, 'latest')
    .then((result) => {
      const output = {
        balance: Eth.fromWei(result, 'ether'),
      };
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
