'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import styles from './page.module.css';
const dotenv = require('dotenv');

dotenv.config();

export default function Home() {
	const [address, setAddress] = useState('');
	const [errorMessage, setErrorMessage] = useState("");
	const [Message, setMessage] = useState("");
	const [isVerified, setIsVerified] = useState(false);

	const [isClaiming, setIsClaiming] = useState(false);

	const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
	const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
	const wallet = new ethers.Wallet(privateKey, provider);

	const isValidEthereumAddress = (address) => {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	};

	const handleAddressChange = (e) => {
		const inputAddress = e.target.value;
		setAddress(inputAddress);

		if (!isValidEthereumAddress(inputAddress)) {
			setErrorMessage('Invalid Ethereum address.');
		} else {
			setErrorMessage('');
		}
	};

	const getLastClaimedTime = (addr) => {
		const claimedData = localStorage.getItem(`lastClaimed_${addr}`);
		return claimedData ? new Date(claimedData) : null;
	};

	const saveLastClaimedTime = (addr, time) => {
		localStorage.setItem(`lastClaimed_${addr}`, time.toISOString());
	};

	const claimGMELD = async () => {
		if (!address) {
			setErrorMessage('Please enter a wallet address.');
			return;
		}

		const now = new Date();
		const lastClaimed = getLastClaimedTime(address);

		if (lastClaimed && (now - lastClaimed) < 86400000) {
			setErrorMessage('You can only claim once every 24 hours.');
			return;
		}

		setIsClaiming(true);

		try {
			const tx = await wallet.sendTransaction({
				to: address,
				value: ethers.parseUnits("0.01", "ether"),
			});
			await tx.wait();
			const meldefiTokenAddress = '0x0cBeC4E908fB90D87FC65f4FCEA0ee60e263Ae78';
			const erc20Abi = ['function transfer(address to, uint amount) public returns (bool)'];

			const meldefiContract = new ethers.Contract(meldefiTokenAddress, erc20Abi, wallet);
			const tx2 = await meldefiContract.transfer(address, ethers.parseUnits("10000", "ether"));
			await tx2.wait();

			setMessage('Tokens Claim Successful!');
			saveLastClaimedTime(address, now);

			localStorage.setItem('lastClaimed', now.toISOString());
		} catch (error) {
			console.error('Error claiming GMELD and EDNAMODE:', error);
			setErrorMessage('Failed to claim GMELD and EDNAMODE.');
		} finally {
			setIsClaiming(false);
		}
	};

	return (
		<div className={styles.page}>
			<h1 className={styles.h1}>Welcome to MELDEFI Ecosystem , Enter your address to claim free gMELD to cover your gas fees, MELDEFI tokens and potential other MELD ecosystem tokens</h1>
			<main className={styles.main}>
				<div className={styles.inputContainer}>
					<input
						type="text"
						value={address}
						onChange={handleAddressChange}
						placeholder="Enter Ethereum Address"
						className={styles.input}
					/>
				</div>
				{!isVerified && (
					<p style={{ color: "black" }}>Please solve the CAPTCHA to continue.</p>
				)}
				<HCaptcha
					className={styles.cap}
					sitekey={process.env.NEXT_PUBLIC_SITE_KEY}
					onVerify={() => {
						setIsVerified(true);
					}}
				/>

				<div className={styles.ctas}>
					<button
						className={styles.primary}
						onClick={claimGMELD}
						disabled={isClaiming || !isValidEthereumAddress(address) || !isVerified}
					>
						{isClaiming ? 'Claiming...' : 'Claim Tokens'}
					</button>

				</div>

				{errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
				<p style={{ color: "green" }}>{Message}</p>
			</main>
			<footer className={styles.footer}>
				<div>
					<p>MELDEFI is a comprehensive analytics tool for the MELD DeFi ecosystem. It allows users to track wallets, monitor token balances, and view transaction histories, including whale activity. By holding 10,000 MELDEFI tokens, users can stake and receive exclusive NFTs that unlock full access to the application`s features, enhancing the overall user experience.

						If you want to sponsor and send your tokens , reach out to us on telegram  </p>
					<a className={styles.link} href="https://t.me/MELDEFItoken">https://t.me/MELDEFItoken</a>
				</div>
			</footer>
		</div>
	);
}