'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
	const [account, setAccount] = useState(null);
	const [address, setAddress] = useState(''); // State to hold the input address
	const [li, setLimit] = useState("0");
	const [errorMessage, setErrorMessage] = useState("");
	const [lastClaimed, setLastClaimed] = useState(null); // State to track last claimed date


	// Claim GMELD from backend server
	const claimGMELD = async () => {
		if (!address) {
			setErrorMessage('Please enter a wallet address.');
			return;
		}

		// Check if the user is trying to claim again within 24 hours
		const now = new Date();
		if (lastClaimed && (now - lastClaimed) < 86400000) {
			setErrorMessage('You can only claim once every 24 hours.');
			return;
		}

		try {
			const response = await fetch('http://localhost:3001/api/claimGmeld', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ address: address }),
			});

			const result = await response.json();
			if (response.ok) {
				alert('Successfully claimed GMELD!');
				setLastClaimed(now); // Update last claimed date
			} else {
				setErrorMessage(result.error || 'Failed to claim GMELD.');
			}
		} catch (error) {
			console.error('Error claiming GMELD:', error);
			setErrorMessage('Failed to claim GMELD.');
		}
	};

	// Claim MELDEFI from backend server
	const claimMELDEFI = async () => {
		if (!address) {
			setErrorMessage('Please enter a wallet address.');
			return;
		}


		try {
			const response = await fetch('http://localhost:3001/api/claimMeldefi', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ address: address }),
			});

			const result = await response.json();
			if (response.ok) {
				alert('Successfully claimed MELDEFI!');
			} else {
				setErrorMessage(result.error || 'Failed to claim MELDEFI.');
			}
		} catch (error) {
			console.error('Error claiming MELDEFI:', error);
			setErrorMessage('Failed to claim MELDEFI.');
		}
	};

	return (
		<div className={styles.page}>
			<h1 className={styles.h1}>Gmeld and MelDefi faucet - only working for kanazawa network</h1>
			<main className={styles.main}>
				<div className={styles.inputContainer}>
					<input
						type="text"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						placeholder="Enter Ethereum Address"
						className={styles.input}
					/>
				</div>

				<div className={styles.ctas}>
					<button className={styles.primary} onClick={claimGMELD}>
						Claim GMELD
					</button>
					<button className={styles.secondary} onClick={claimMELDEFI}>
						Claim MELDEFI
					</button>
				</div>

				{errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
			</main>
				<footer>@Rutvik</footer>
		</div>
	);
}
