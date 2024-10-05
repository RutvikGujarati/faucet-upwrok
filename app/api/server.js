const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

// Load your environment variables from a.env file
const dotenv = require('dotenv');

const port = process.env

dotenv.config();
// Set up your contract details and provider
// const contractAddress = '0x30ca59f68F00E42b04acf8a6e93033fE3De71807';
// const faucetAbi = require('../ABI.json'); // Load the ABI

const provider = new ethers.JsonRpcProvider('https://testnet-rpc.meld.com'); // Use your chain's RPC URL
const privateKey = process.env.PRIVATE_KEY; // Store your private key in environment variables
const wallet = new ethers.Wallet(privateKey, provider);

// const faucetContract = new ethers.Contract(contractAddress, faucetAbi, wallet);

const app = express();
app.use(cors());
app.use(express.json());

const isValidEthereumAddress = (address) => {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  

  export default async function handler(req, res) {
	if (req.method === 'POST') {
	  const { address } = req.body;
  
	  try {
		// Validate Ethereum address
		if (!isValidEthereumAddress(address)) {
		  return res.status(400).json({ error: 'Invalid Ethereum address.' });
		}
  
		// Example for sending GMELD
		const tx = await wallet.sendTransaction({
		  to: address,
		  value: '10000000000000000', // Sending 0.01 GMELD
		});
		await tx.wait();
		return res.json({ message: 'Successfully claimed 0.01 GMELD!' });
	  } catch (error) {
		console.error('Error claiming GMELD:', error);
		return res.status(500).json({ error: 'Failed to claim GMELD.' });
	  }
	} else {
	  res.setHeader('Allow', ['POST']);
	  res.status(405).end(`Method ${req.method} Not Allowed`);
	}
  }

//   app.post('/api/claimMeldefi', async (req, res) => {
// 	const { address } = req.body;
  
// 	try {
// 	  // Ensure it's a valid Ethereum address
// 	  if (!isValidEthereumAddress) {
// 		throw new Error("Invalid Ethereum address.");
// 	  }
  
// 	  // MELDEFI is assumed to be an ERC-20 token, so sending as before
// 	  const meldefiTokenAddress = '0xMeldefiTokenAddress';  // MELDEFI token contract address
// 	  const erc20Abi = ['function transfer(address to, uint amount) public returns (bool)']; // Basic ERC-20 ABI
  
// 	  const meldefiContract = new ethers.Contract(meldefiTokenAddress, erc20Abi, wallet);
  
// 	  // Send MELDEFI tokens
// 	  const tx = await meldefiContract.transfer(address, ethers.utils.parseUnits('10000', 18)); // Sending 10,000 MELDEFI
// 	  await tx.wait(); // Wait for the transaction to be mined
  
// 	  res.json({ message: 'Successfully claimed 10,000 MELDEFI!' });
// 	} catch (error) {
// 	  console.error('Error claiming MELDEFI:', error);
// 	  res.status(500).json({ error: 'Failed to claim MELDEFI.' });
// 	}
//   });
