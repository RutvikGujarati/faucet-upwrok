'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import styles from './page.module.css';
import meld from "./meld.png";
import meldlens from "./meldlens.jpg";
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
const dotenv = require('dotenv');
import faucetABI from "./ABI.json"

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
	const faucetContractAddress = process.env.NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS;


	const faucetContract = new ethers.Contract(faucetContractAddress, faucetABI, wallet);

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

	const claimTokens = async () => {
		if (!address) {
			setErrorMessage('Please enter a wallet address.');
			return;
		}

		setIsClaiming(true);

		try {
			// Call the claimTokens function of the contract
			const tx = await faucetContract.claimTokens(address);
			await tx.wait();

			setMessage('Tokens claimed successfully!');

			// Optionally reset the form or update local storage here

		} catch (error) {
			console.error('Error claiming tokens:', error);
	
			// Check if the error contains the message about the 24-hour limit
			if (error.message.includes("You can only claim once every 24 hours")) {
				setErrorMessage('You can only claim tokens once every 24 hours.');
			} else {
				setErrorMessage('Failed to claim tokens.');
			}
		} finally {
			setIsClaiming(false);
		}
	};
	const claimNEWTokens = async () => {
		if (!address) {
			setErrorMessage('Please enter a wallet address.');
			return;
		}

		setIsClaiming(true);

		try {
			// Call the claimTokens function of the contract
			const tx = await faucetContract.claimTokens(address);
			await tx.wait();

			setMessage('Tokens claimed successfully!');

			// Optionally reset the form or update local storage here

		} catch (error) {
			console.error('Error claiming tokens:', error);
			setErrorMessage('Failed to claim tokens.');
		} finally {
			setIsClaiming(false);
		}
	};

	return (
		<div className={`container-fluid ${styles.page}`}>
			<h4 className="text-center my-3">
				Welcome to MELDLENS: Your MELD Analytics Powerhouse <br />  <br />  Enter your address to claim free gMELD to cover your gas fees, MLENS tokens, and potential other MELD ecosystem tokens
			</h4>

			<main className="row justify-content-center g-4 mt-5 ">
				<div className={`col-12 col-md-6 col-lg-3 ${styles.box} ${styles.newBackground}`}>
					<h4 className={`text-center  `}>Tokens that you will receive</h4><br />
					<Image src={meld} alt="MELD_Logo" className={` justify-content-center align-items-center ${styles.tokenIcon} `} />
					<p className={` text-center  ${styles.para} `}>
						gMELD: 1  <br />
						MLENS: 1000  <br />
						EDNAMODE: 100,000
					</p>
				</div>

				<div className={`${styles.middle} col-12 col-md-6 col-lg-5 `}>
					<div className={styles.box_middle}>
						<div className={styles.inputContainer}>
							<input
								type="text"
								value={address}
								onChange={handleAddressChange}
								placeholder="Enter EVM Address"
								className={`${styles.input} form-control`}
							/>
						</div>
						{!isVerified && <p className='text-center' style={{ color: "black" }}>Please solve the CAPTCHA to continue.</p>}
						<div className="mx-5">
							<HCaptcha
								className={`${styles.cap} mx-auto`}
								sitekey={process.env.NEXT_PUBLIC_SITE_KEY}
								onVerify={() => setIsVerified(true)}
							/>
						</div>
						<div className="d-grid gap-2 mt-3 mx-5">
							<button
								className={`btn btn-primary mx-5 ${styles.button}`}
								onClick={claimTokens}
								disabled={isClaiming || !isValidEthereumAddress(address) || !isVerified}
							>
								{isClaiming ? 'Claiming...' : 'Claim Tokens'}
							</button>
						</div>
						{errorMessage && <p className='mx-5 mt-4' style={{ color: 'red' }}>{errorMessage}</p>}
						<p style={{ color: "green" }}>{Message}</p>
					</div>
				</div>

				<div className={`col-12 col-md-6 col-lg-3 ${styles.box} ${styles.newBackground}`}>
					<div><h3 className="text-center">Sponsors</h3><br />
						<Image src={meld} alt="MELD_Logo" className={styles.tokenIcon} />
						<p className={`text-center ${styles.para} `}>gMELD <br /> MELDLENS <br /> EDNAMODE  </p>
					</div>
				</div>
			</main>

			<footer className="text-center mt-5 ">
				<p className={styles.fontS}>
					MELDLENS is a comprehensive analytics tool for the MELD DeFi ecosystem. It allows users to track wallets,
					monitor token balances, view transaction histories, including whale activity and add custom alerts. Hold 100,000 MLENS or stake your tokens to receive exclusive NFTs that unlock full access to MeldLens features and enhance your user experience. If you want to sponsor and send your tokens, reach out to us on telegram.
				</p>
				<a className="link-primary" href="https://t.me/meldlens">https://t.me/meldlens</a>
			</footer>
		</div>
	);
}
