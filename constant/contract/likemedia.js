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
        "name": "fromAddr",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      },
      {
        "name": "_nonce",
        "type": "uint256"
      },
      {
        "name": "_v",
        "type": "uint8"
      },
      {
        "name": "_r",
        "type": "bytes32"
      },
      {
        "name": "_s",
        "type": "bytes32"
      }
    ],
    "name": "giveLikeDelegated",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
    "stateMutability": "nonpayable",
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
    "name": "getNumberOfTx",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
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
    "name": "likeCounts",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
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
    "stateMutability": "view",
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
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "key",
        "type": "bytes32"
      },
      {
        "name": "amount",
        "type": "uint256"
      },
      {
        "name": "fromAddr",
        "type": "address"
      }
    ],
    "name": "giveLike",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "name": "getLike",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_likeAddr",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "fromAddr",
        "type": "address"
      }
    ],
    "name": "GiveLike",
    "type": "event"
  }
];

const LIKE_MEDIA_ADDRESS = '0x5beE1FD64DA6Da28EE83813afd17CAb186373d28';

module.exports = { LIKE_MEDIA_ABI, LIKE_MEDIA_ADDRESS };