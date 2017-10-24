/* eslint-disable */
const LIKE_MEDIA_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "key",
        "type": "bytes32"
      },
      {
        "name": "author",
        "type": "string"
      },
      {
        "name": "description",
        "type": "string"
      },
      {
        "name": "wallet",
        "type": "address"
      },
      {
        "name": "ipfs",
        "type": "string"
      },
      {
        "name": "footprintKeys",
        "type": "bytes32[]"
      },
      {
        "name": "footprintShares",
        "type": "uint8[]"
      },
      {
        "name": "license",
        "type": "string"
      }
    ],
    "name": "upload",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "get",
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "bytes32[]"
      },
      {
        "name": "",
        "type": "uint8[]"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "metaTables",
    "outputs": [
      {
        "name": "author",
        "type": "string"
      },
      {
        "name": "description",
        "type": "string"
      },
      {
        "name": "wallet",
        "type": "address"
      },
      {
        "name": "ipfs",
        "type": "string"
      },
      {
        "name": "license",
        "type": "string"
      },
      {
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "name": "isUsed",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "key",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "author",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "wallet",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "ipfs",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "footprintKeys",
        "type": "bytes32[]"
      },
      {
        "indexed": false,
        "name": "footprintShares",
        "type": "uint8[]"
      },
      {
        "indexed": false,
        "name": "license",
        "type": "string"
      }
    ],
    "name": "Uploaded",
    "type": "event"
  }
];

const LIKE_MEDIA_ADDRESS = '0xA97fEfe489ca62ADD4949360DCE30e3351F6881B';

module.exports = { LIKE_MEDIA_ABI, LIKE_MEDIA_ADDRESS };