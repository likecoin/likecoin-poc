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
      },
      {
        "name": "index",
        "type": "uint8"
      }
    ],
    "name": "getFp",
    "outputs": [
      {
        "name": "k",
        "type": "bytes32"
      },
      {
        "name": "s",
        "type": "uint8"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "prevKey",
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
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
        "name": "k",
        "type": "bytes32"
      },
      {
        "name": "a",
        "type": "string"
      },
      {
        "name": "d",
        "type": "string"
      },
      {
        "name": "w",
        "type": "address"
      },
      {
        "name": "i",
        "type": "string"
      },
      {
        "name": "l",
        "type": "string"
      },
      {
        "name": "t",
        "type": "uint256"
      },
      {
        "name": "i2",
        "type": "bool"
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
  }
];

const LIKE_MEDIA_ADDRESS = '0xfE4c0cbD9c7f7504626C8d8dC0B68e3a3FDA51af';

module.exports = { LIKE_MEDIA_ABI, LIKE_MEDIA_ADDRESS };