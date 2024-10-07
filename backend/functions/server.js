const serverless = require('serverless-http');
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Set up your Ethereum provider and wallet
const provider = new ethers.JsonRpcProvider('https://testnet-rpc.meld.com');
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to validate Ethereum address
const isValidEthereumAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

// Route to claim GMELD
app.post('/claimGmeld', async (req, res) => {
	const { address } = req.body;
	console.log("app is running....")
	res.send("app is running")

	try {
		if (!isValidEthereumAddress(address)) {
			throw new Error('Invalid Ethereum address.');
		}
		console.log("sending tokens....")
		res.send("sending tokens...")
		// Sending the native GMELD token directly
		const tx = await wallet.sendTransaction({
			to: address,
			value: '10000000000000000'  // 0.01 GMELD
		});

		await tx.wait();
		res.json({ message: 'Successfully claimed 0.01 GMELD!' });
		console.log(`${address} claimed tokens`);
	} catch (error) {
		console.error('Error claiming GMELD:', error);
		res.status(500).json({ error: 'Failed to claim GMELD.' });
	}
});

// Route to claim MELDEFI (ERC-20 token)
app.post('/claimMeldefi', async (req, res) => {
	const { address } = req.body;

	try {
		if (!isValidEthereumAddress(address)) {
			throw new Error('Invalid Ethereum address.');
		}

		const meldefiTokenAddress = '0xMeldefiTokenAddress';  // Replace with real contract address
		const erc20Abi = ['function transfer(address to, uint amount) public returns (bool)'];
		const meldefiContract = new ethers.Contract(meldefiTokenAddress, erc20Abi, wallet);

		// Send MELDEFI tokens
		const tx = await meldefiContract.transfer(address, ethers.utils.parseUnits('10000', 18));
		await tx.wait();

		res.json({ message: 'Successfully claimed 10,000 MELDEFI!' });
	} catch (error) {
		console.error('Error claiming MELDEFI:', error);
		res.status(500).json({ error: 'Failed to claim MELDEFI.' });
	}
});

app.use('/.netlify/functions/server', app)
// Export the handler for serverless functions
module.exports.handler = serverless(app);
