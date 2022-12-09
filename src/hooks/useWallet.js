import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

import wavePortalAbi from "../contracts/WavePortal.json";
import useWindowFocus from "./useWindowFocus";
import algosdk, { waitForConfirmation } from "algosdk";
import { CONSTANTS } from './Constants';

const CONTRACT_ADDRESS = "0x08EDCa063262FD50c97C825110f1Ab71111f0759";
const appIndex = CONSTANTS.APP_ID;

export const Reaction = {
	Wave: 0,
	Cake: 1,
	Hype: 2,
};

let client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)

export const WriteStatus = {
	None: 0,
	Connect: 1,
	Request: 2,
	Pending: 3,
};

const EvmName = {
	80001: "Polygon Mumbai",
};

export default function useWallet(peraWallet) {
	const [loading, setLoading] = useState(true);
	const [writeLoading, setWriteLoading] = useState(WriteStatus.None);
	const [walletInstalled, setInstalled] = useState(true);
	const [walletConnected, setConnected] = useState(false);
	const [walletNetwork, setNetwork] = useState(null);
	const [walletAccount, setAccount] = useState("");
	const [optedIn, setOptedIn] = useState(false)
	const [walletError, setWalletError] = useState(null);
	const [waveList, setWaveList] = useState([]);
	const [totalWaves, setTotalWaves] = useState(null);
	const networkName = useMemo(() => {
		if (!walletNetwork) {
			return "";
		}
		return EvmName[walletNetwork?.chainId] || walletNetwork.name;
	}, [walletNetwork]);

	const isWindowFocused = useWindowFocus();

	const updateWaves = useCallback(() => {
		const runUpdates = async () => {
			setTotalWaves(await getTotalWaves());
			setWaveList(await getAllWaves());
		};
		runUpdates();
	}, [setTotalWaves, setWaveList]);

	useEffect(() => {
		subscribeToWaveEvents((newWave) => {
			updateWaves();
		});
		// SUBSCRICE ONCE when mounting the component
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isWindowFocused) {
			// check status whenever the window focus status changes
		}
		const runUpdates = async () => {
			setConnected(await getWalletConnected());
			setLoading(false);
		};
		runUpdates();
	}, [isWindowFocused, setInstalled, setConnected, updateWaves, setLoading]);

	const checkOptedIn = async (sender, index) => {
		try {
			let appInfo = await client.accountApplicationInformation(sender, index).do();
			if (appInfo['app-local-state']) {
				if (appInfo['app-local-state']['key-value']) {
					const todoList = appInfo['app-local-state']['key-value']
					if (todoList.length > 0) {
						const finalTodo = todoList.map(_ => ({ key: atob(_.key), value: _.value.uint }))
						setWaveList(finalTodo)
						setTotalWaves(finalTodo.length)
					} else {
						setWaveList([])
					}
				} else {
					setWaveList([])
				}

				setOptedIn(true)
			}
		} catch (e) {
			console.log(e)
			setOptedIn(false)
			// console.error(`There was an error calling the app: ${e}`);
		}
	}

	const connectWallet = () => {
		return peraWallet.connect().then((newAccounts) => {
			// setup the disconnect event listener
			/* eslint-disable */
			peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);
			checkOptedIn(newAccounts[0], CONSTANTS.APP_ID)
			setAccount(newAccounts)
			setConnected(true)
			return newAccounts
		});
	}

	const onTodoAction = async (action, message) => {
		return await noop(appIndex, action, message, walletAccount[0])
	}

	async function getWalletConnected() {
		return peraWallet.reconnectSession().then((accounts) => {
			// Setup disconnect event listener
			peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

			if (accounts.length) {
				setAccount(accounts)
				checkOptedIn(accounts[0], appIndex)
				return true
			}
		})
	}

	const optIn = async () => {
		try {
			const index = CONSTANTS.APP_ID
			const sender = walletAccount[0]
			const suggestedParams = await client.getTransactionParams().do();
			const optInTxn = algosdk.makeApplicationOptInTxn(
				sender,
				suggestedParams,
				index
			);
			const actionTxGroup = [{ txn: optInTxn, signers: [sender] }];
			console.log(actionTxGroup, peraWallet)
			const signedTx = await peraWallet.signTransaction([actionTxGroup]);
			console.log(signedTx);
			const { txId } = await client.sendRawTransaction(signedTx).do();
			const result = await waitForConfirmation(client, txId, 4);
			console.log(`Success`);
			setOptedIn(true)
		} catch (e) {
			setOptedIn(false)
			console.error(`There was an error calling the app: ${e}`);
		}
	}

	const noop = async (index, action, todo) => {
		try {
			const accounts = await peraWallet.reconnectSession()
			const sender = accounts[0]
			setWriteLoading(WriteStatus.Request)

			// console.log(index, action, todo, sender)
			const appArgs = []
			appArgs.push(
				new Uint8Array(Buffer.from(action)),
				new Uint8Array(Buffer.from(todo)),
			)
			const suggestedParams = await client.getTransactionParams().do();
			// create unsigned transaction
			// trigger smart contract
			let actionTx = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs)

			// const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
			const actionTxGroup = [{ txn: actionTx, signers: [sender] }];

			//   console.log('before')
			const signedTx = await peraWallet.signTransaction([actionTxGroup]);
			//   console.log('after')
			//   console.log(signedTx);
			setWriteLoading(WriteStatus.Pending)
			const { txId } = await client.sendRawTransaction(signedTx).do();
			const confirmedTxn = await waitForConfirmation(client, txId, 4);
			setWriteLoading(WriteStatus.None)

			//Get the completed Transaction
			console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

			// display results
			let transactionResponse = await client.pendingTransactionInformation(txId).do();
			console.log("Called app-id:", transactionResponse['txn']['txn']['apid'])
			if (transactionResponse['global-state-delta'] !== undefined) {
				console.log("Global State updated:", transactionResponse['global-state-delta']);
			}
			if (transactionResponse['local-state-delta'] !== undefined) {
				console.log("Local State updated:", transactionResponse['local-state-delta']);
			}
			checkOptedIn(sender, CONSTANTS.APP_ID)
			console.log('success')
		} catch (err) {
			console.log(err)
			setWriteLoading(WriteStatus.None)
		}
	}

	function handleDisconnectWalletClick() {
		localStorage.removeItem('walletconnect')
		localStorage.removeItem('PeraWallet.Wallet')
		setConnected(false)
		setAccount(null)
	}

	return {
		loading,
		writeLoading,
		walletInstalled,
		walletConnected,
		walletAccount,
		walletError,
		connectWallet,
		networkName,
		waveList,
		totalWaves,
		optedIn,
		peraWallet,
		optIn,
		onTodoAction,
		handleDisconnectWalletClick
	};
}

async function getTotalWaves() {
	if (!window.ethereum) {
		return;
	}

	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const wavePortalContract = new ethers.Contract(
		CONTRACT_ADDRESS,
		wavePortalAbi.abi,
		provider,
	);

	const totalWaves = await wavePortalContract.getTotalWaves();
	console.log({ totalWaves });
	return Number.parseInt(totalWaves.toString(), 10);
}

async function getAllWaves() {
	if (!window.ethereum) {
		return;
	}

	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const wavePortalContract = new ethers.Contract(
		CONTRACT_ADDRESS,
		wavePortalAbi.abi,
		provider,
	);

	const allWaves = await wavePortalContract.getAllWaves();
	if (!allWaves) {
		return [];
	}

	const normalizeWave = (wave) => ({
		reaction: wave.reaction,
		message: wave.message,
		waver: wave.waver,
		timestamp: new Date(wave.timestamp * 1000),
	});

	return allWaves.map(normalizeWave).sort((a, b) => b.timestamp - a.timestamp);
}

function subscribeToWaveEvents(callback) {
	if (!window.ethereum) {
		return;
	}

	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const wavePortalContract = new ethers.Contract(
		CONTRACT_ADDRESS,
		wavePortalAbi.abi,
		provider,
	);

	wavePortalContract.on("NewWave", (reaction, message, waver, timestamp) => {
		callback({ reaction, message, waver, timestamp });
	});
}
