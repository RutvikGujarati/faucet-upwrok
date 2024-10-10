'use client'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokenFaucetABI from '../ABI.json'; // Adjust the path as needed
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap

const TOKEN_FAUCET_ADDRESS = '0x3Ecf22406D615FB86FC17b095D737c7EfEa9b633'; // Replace with your deployed contract address

const OwnerPage = () => {
	const [balance, setBalance] = useState(0);
	const [gmeldValue, setGmeldValue] = useState(0);
	const [Address, setAddress] = useState("");
	const [mlenseValue, setMlenseValue] = useState(0);
	const [echanaValue, setEchanaValue] = useState(0);
	const [gmeldNewValue, setNewGmeldValue] = useState('');
	const [mlenseNewValue, setNewMlenseValue] = useState('');
	const [echanaNewValue, setNewEchanaValue] = useState('');
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [depositAmount, setDepositAmount] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [tokenFaucetContract, setTokenFaucetContract] = useState(null);
	const [walletAddress, setWalletAddress] = useState('');

	// Function to connect the wallet
	const connectWallet = async () => {
		if (window.ethereum) {
			try {
				const newProvider = new ethers.BrowserProvider(window.ethereum);
				const accounts = await newProvider.send("eth_requestAccounts", []);
				const newSigner = await newProvider.getSigner();
				setProvider(newProvider);
				setSigner(newSigner);
				setWalletAddress(accounts[0]);

				// Create an instance of the contract
				const contractInstance = new ethers.Contract(TOKEN_FAUCET_ADDRESS, TokenFaucetABI, newSigner);
				setTokenFaucetContract(contractInstance);
			} catch (error) {
				console.error('Error connecting to wallet:', error);
			}
		} else {
			alert('Please install MetaMask or another Ethereum wallet!');
		}
	};

	useEffect(() => {
		const fetchContractDetails = async () => {
			if (!tokenFaucetContract || !provider) return;

			try {
				const contractBalance = await provider.getBalance(TOKEN_FAUCET_ADDRESS);
				const values = await tokenFaucetContract.getTokenValues();

				setBalance(ethers.formatEther(contractBalance));
				setGmeldValue(ethers.formatEther(values[0]));
				setMlenseValue(ethers.formatEther(values[1]));
				setEchanaValue(ethers.formatEther(values[2]));
			} catch (error) {
				console.error('Error fetching contract details:', error);
			}
		};

		if (walletAddress) {
			fetchContractDetails();
		}
	}, [tokenFaucetContract, walletAddress]);

	const handleWithdraw = async (e) => {
		e.preventDefault();
		if (!withdrawAmount) {
			setErrorMessage('Please enter an amount to withdraw.');
			return;
		}
		try {
			const tx = await tokenFaucetContract.withdraw(ethers.parseEther(withdrawAmount));
			await tx.wait();
			setSuccessMessage('Withdrawal successful!');
			setWithdrawAmount('');
		} catch (error) {
			console.error('Error withdrawing:', error);
			setErrorMessage('Failed to withdraw. Please check the amount and try again.');
		}
	};
	const handleUpdateTokenValues = async (e) => {
		e.preventDefault();
		if (!gmeldNewValue || !mlenseNewValue || !echanaNewValue) {
			setErrorMessage('Please enter values for all token amounts.');
			return;
		}
		try {
			const tx = await tokenFaucetContract.updateTokenValue(
				ethers.parseUnits(gmeldNewValue),
				ethers.parseUnits(mlenseNewValue),
				ethers.parseUnits(echanaNewValue)
			);
			await tx.wait();
			setSuccessMessage('Token values updated successfully!');
			setNewGmeldValue('');
			setNewMlenseValue('');
			setNewEchanaValue('');
		} catch (error) {
			console.error('Error updating token values:', error);
			setErrorMessage('Failed to update. Please check the values and try again.');
		}
	};
	const UpdateSenderAddress = async (e) => {
		e.preventDefault();
		if (Owner) {
			setErrorMessage('Please enter address!.');
			return;
		}
		try {
			const tx = await tokenFaucetContract.updateAddress(
				Address
			);
			await tx.wait();
			setSuccessMessage('Address changed successfully!');
			
		} catch (error) {
			console.error('Error updating Address:', error);
			setErrorMessage('Failed to update. Please check the Address and try again.');
		}
	};

	const handleDeposit = async (e) => {
		e.preventDefault();
		if (!depositAmount) {
			setErrorMessage('Please enter an amount to deposit.');
			return;
		}

		try {
			const tx = await signer.sendTransaction({
				to: TOKEN_FAUCET_ADDRESS,
				value: ethers.parseUnits(depositAmount),
			});

			await tx.wait();
			setSuccessMessage('Deposit successful!');
			setDepositAmount('');
		} catch (error) {
			console.error('Error depositing:', error);
			setErrorMessage('Failed to deposit. Please check the amount and try again.');
		}
	};

	return (
		<div className="container mt-5">
			<div className="text-center my-4">
				{!walletAddress ? (
					<button className="btn btn-primary" onClick={connectWallet}>
						Connect Wallet
					</button>
				) : (
					<p>Connected: {walletAddress}</p>
				)}
			</div>

			<h1 className="mb-4">Owner Dashboard</h1>
			<h2 className="mb-3">Contract Balance: {balance} ETH</h2>
			<h2>Token Values</h2>
			<ul className="list-group mb-4">
				<li className="list-group-item">gMELD Value: {gmeldValue} gMELD</li>
				<li className="list-group-item">MLENS Value: {mlenseValue} MLENS</li>
				<li className="list-group-item">ECHANAMODE Value: {echanaValue} ECHANAMODE</li>
			</ul>

			<form onSubmit={handleWithdraw} className="mb-4">
				<h2>Withdraw</h2>
				<div className="form-group">
					<input
						type="text"
						className="form-control"
						placeholder="Amount to withdraw"
						value={withdrawAmount}
						onChange={(e) => setWithdrawAmount(e.target.value)}
					/>
				</div>
				<button type="submit" className="btn btn-primary mt-2">Withdraw</button>
			</form>
			<form onSubmit={UpdateSenderAddress} className="mb-4">
				<h2>Withdraw</h2>
				<div className="form-group">
					<input
						type="text"
						className="form-control"
						placeholder="Address who is sending faucet tokens"
						value={Address}
						onChange={(e) => setAddress(e.target.value)}
					/>
				</div>
				<button type="submit" className="btn btn-primary mt-2">Update Address</button>
			</form>
			<form onSubmit={handleUpdateTokenValues} className="mb-4">
				<h2>Update Token Values</h2>
				<div className="form-group">
					<input
						type="text"
						className="form-control"
						placeholder="gMELD Value"
						value={gmeldNewValue}
						onChange={(e) => setNewGmeldValue(e.target.value)}
					/>
				</div>
				<div className="form-group">
					<input
						type="text"
						className="form-control"
						placeholder="MLENS Value"
						value={mlenseNewValue}
						onChange={(e) => setNewMlenseValue(e.target.value)}
					/>
				</div>
				<div className="form-group">
					<input
						type="text"
						className="form-control"
						placeholder="ECHANAMODE Value"
						value={echanaNewValue}
						onChange={(e) => setNewEchanaValue(e.target.value)}
					/>
				</div>
				<button type="submit" className="btn btn-primary mt-2">Update Token Values</button>
			</form>


			<form onSubmit={handleDeposit} className="mb-4">
				<h2>Deposit</h2>
				<div className="form-group">
					<input
						type="text"
						className="form-control"
						placeholder="Amount to deposit"
						value={depositAmount}
						onChange={(e) => setDepositAmount(e.target.value)}
					/>
				</div>
				<button type="submit" className="btn btn-primary mt-2">Deposit</button>
			</form>

			{errorMessage && <p className="text-danger">{errorMessage}</p>}
			{successMessage && <p className="text-success">{successMessage}</p>}
		</div>
	);
};

export default OwnerPage;
