const serverless = require("serverless-http");
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Claim = require('../models/Claim'); // Import the Claim model

// Load your environment variables from a .env file
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Set up your provider and wallet
const provider = new ethers.JsonRpcProvider('https://rpc-1.meld.com'); // Use your chain's RPC URL
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY; // Store your private key in environment variables
const wallet = new ethers.Wallet(privateKey, provider);

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to validate Ethereum address
const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Check if the user can claim tokens
const canClaimTokens = async (address) => {
    const claim = await Claim.findOne({ address });
    if (!claim) return true; // If the user hasn't claimed before, allow
    const currentTime = new Date().getTime();
    const lastClaimTime = claim.lastClaimTime.getTime();
    const timeSinceLastClaim = currentTime - lastClaimTime;

    return timeSinceLastClaim >= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

// Save the claim time for a user
const saveClaimTime = async (address) => {
    const currentTime = new Date();
    await Claim.findOneAndUpdate(
        { address },
        { lastClaimTime: currentTime },
        { upsert: true } // Create if not exists
    );
};

// Claim GMELD tokens (with 24-hour cooldown check)
app.post('/api/claimGmeld', async (req, res) => {
    const { address } = req.body;

    try {
        // Ensure it's a valid Ethereum address
        if (!isValidEthereumAddress(address)) {
            throw new Error("Invalid Ethereum address.");
        }

        // Check if the user has already claimed within the last 24 hours
        if (!(await canClaimTokens(address))) {
            return res.status(400).json({ error: 'You can only claim once every 24 hours.' });
        }

        // Sending the native currency (GMELD) directly
        const tx = await wallet.sendTransaction({
            to: address,
            value: '100000000000000'  // Sending 0.001 GMELD (native currency)
        });

        await tx.wait(); // Wait for the transaction to be mined

        // Save the current claim time
        await saveClaimTime(address);

        const MLENSTokenAddress = '0xF463A50a2C51453cF6004f330aF34FB895Fc65aF';
        const erc20Abi = ['function transfer(address to, uint amount) public returns (bool)'];

        const MLENSContract = new ethers.Contract(MLENSTokenAddress, erc20Abi, wallet);
        const tx2 = await MLENSContract.transfer(address, ethers.parseUnits("1", "ether"));
        await tx2.wait();

        // Save the current claim time again (this might be redundant)
        await saveClaimTime(address);

        res.json({ message: 'Successfully claimed 0.01 GMELD and 10,000 MELDEFI!' });
        console.log(address, "claimed tokens");
    } catch (error) {
        console.error('Error claiming GMELD:', error);
        res.status(500).json({ error: 'Failed to claim GMELD.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`Faucet server running on port ${PORT}`);
});

module.exports.handler = serverless(app);
