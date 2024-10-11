// pages/api/claimTokens.js
import { ethers } from 'ethers';
import faucetABI from '../../ABI.json';
import { NextRequest,NextResponse } from 'next/server';

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const faucetContractAddress = process.env.NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS;

const faucetContract = new ethers.Contract(faucetContractAddress, faucetABI, wallet);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' }); // Handle non-POST requests
    }

    const { address, deviceId } = req.body;

    if (!address || !deviceId) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        const tx = await faucetContract.claimTokens(address, deviceId);
        await tx.wait();
        return res.status(200).json({ message: 'Tokens claimed successfully!' });
    } catch (error) {
        console.error('Error claiming tokens:', error);

        if (error.message.includes("You can only claim once every 24 hours")) {
            return res.status(400).json({ error: 'You can only claim tokens once every 24 hours.' });
        }
        return res.status(500).json({ error: 'Failed to claim tokens.' });
    }
}
