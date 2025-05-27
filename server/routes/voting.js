const express = require('express');
const Web3 = require('web3').default;
const fs = require('fs');
const router = express.Router();

const CONTRACT_JSON = require('../../artifacts/contracts/Voting.sol/Voting.json');
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// owner address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 

const web3 = new Web3('http://localhost:8545'); // Hardhat node
const contract = new web3.eth.Contract(CONTRACT_JSON.abi, CONTRACT_ADDRESS);

// Middleware to check owner
async function isOwner(req, res, next) {
  const accounts = await web3.eth.getAccounts();
  const owner = await contract.methods.owner().call();
  if (req.body.account && req.body.account.toLowerCase() === owner.toLowerCase()) {
    next();
  } else {
    res.status(403).json({ error: 'Only owner can perform this action' });
  }
}

// POST /candidates - Add candidate (owner only)
router.post('/candidates', isOwner, async (req, res) => {
  try {
    const { name, account } = req.body;
    const tx = await contract.methods.addCandidate(name).send({ from: account });
    res.json({ success: true, tx: bigIntToString(tx) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /candidates - List all candidates
router.get('/candidates', async (req, res) => {
  try {
    const count = await contract.methods.getCandidates().call();
    res.json(bigIntToString(count));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /vote - Cast a vote
router.post('/vote', async (req, res) => {
  try {
    const { account, candidateIndex } = req.body;
    const tx = await contract.methods.vote(candidateIndex).send({ from: account });
    res.json({ success: true,  tx: bigIntToString(tx) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /winner - Get winner
router.get('/winner', async (req, res) => {
  try {
    const winner = await contract.methods.getWinner().call();
    res.json({ winner });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// util
function bigIntToString(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(bigIntToString);
  } else if (typeof obj === 'object' && obj !== null) {
    const res = {};
    for (const key in obj) {
      res[key] = bigIntToString(obj[key]);
    }
    return res;
  }
  return obj;
}

module.exports = router;