'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import styles from './page.module.css';
import meld from "./meld.png"
import meldlens from "./meldlens.jpg"
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
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
				value: ethers.parseUnits("1", "ether"),
			});
			await tx.wait();
			const MLENSTokenAddress = '0xF463A50a2C51453cF6004f330aF34FB895Fc65aF';
			const erc20Abi = ['function transfer(address to, uint amount) public returns (bool)'];

			const MLENSContract = new ethers.Contract(MLENSTokenAddress, erc20Abi, wallet);
			const tx2 = await MLENSContract.transfer(address, ethers.parseUnits("1000", "ether"));
			await tx2.wait();

			const EDNAMODETokenAddress = '0x660296b5fb3fd49319e7d7655e4ad0cea33ffbc7';
			const erc20Abi1 = ['function transfer(address to, uint amount) public returns (bool)'];

			const EDNAMODEContract = new ethers.Contract(EDNAMODETokenAddress, erc20Abi1, wallet);
			const tx3 = await EDNAMODEContract.transfer(address, ethers.parseUnits("100000", "ether"));
			await tx3.wait();

			setMessage('Tokens Claim Successful!');
			saveLastClaimedTime(address, now);

			localStorage.setItem('lastClaimed', now.toISOString());
		} catch (error) {
			console.error('Error claiming GMELD and EDNAMODE:', error);
			setErrorMessage('Failed to claim');
		} finally {
			setIsClaiming(false);
		}
	};

	return (
		<div className={`container-fluid ${styles.page}`}>
			{/* <Image src={meldlens} alt="MELD_Logo" className={`${styles.TopIcon} `} /> */}

			<h4 className="text-center my-3">
				Welcome to MELDLENS: Your MELD Analytics Powerhouse <br />  <br />  Enter your address to claim free gMELD to cover your gas fees, MLENS tokens, and potential other MELD ecosystem tokens
			</h4>

			<main className="row justify-content-center g-4 mt-5 ">
				<div className={`col-12 col-md-6 col-lg-3 ${styles.box} ${styles.newBackground}`}>
					<h4 className={`text-center  `}>Tokens that you will receive</h4><br />
					<Image src={meld} alt="MELD_Logo" className={` justify-content-center align-items-center ${styles.tokenIcon} `} />
					<p className={` text-center  ${styles.para} `} >
						
						gMELD: 1  <br />
						MLENS: 1000  <br />
						EDNAMODE: 100,000
					</p>
				</div>

				<div className={`${styles.middle} col-12 col-md-6 col-lg-5 `}> {/* Increased col-lg size to 5 */}
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
								onClick={claimGMELD}
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
					<div ><h3 className="text-center">Sponsors</h3><br />
						<Image src={meld} alt="MELD_Logo" className={styles.tokenIcon} />
						
                       <p className={`text-center ${styles.para} `}>gMELD <br /> MELDLENS <br /> EDNAMODE  </p>
					</div>
				</div>
			</main>

			<footer className="text-center mt-5 ">
				<p className={styles.fontS}>
					MELDLENS is a comprehensive analytics tool for the MELD DeFi ecosystem. It allows users to track wallets,
					monitor token balances, view transaction histories, including whale activity and add  custom alerts. Hold 100,000 MLENS or stake your tokens to receive exclusive NFTs that unlock full access to MeldLens features and enhance your user experience. If you want to sponsor and send your tokens, reach out to us on telegram.
				</p>
				<a className="link-primary" href="https://t.me/meldlens">https://t.me/meldlens</a>
			</footer>
		</div>

	);
}