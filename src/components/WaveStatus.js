import React from "react";

import { WriteStatus } from "../hooks/useWallet";
import Spinner from "./Spinner";

const WriteLoadingMessage = {
	[WriteStatus.Connect]: "Please connect your wallet to proceed...",
	[WriteStatus.Request]: "Check your wallet for the transaction...",
	[WriteStatus.Pending]: "Wave transaction in progress...",
};

export default function WaveStatus({ loading, writeLoading, totalWaves }) {
	if (loading) {
		return null;
	}

	if (writeLoading) {
		return (
			<div className="waveStatus">
				<p >{WriteLoadingMessage[writeLoading]}</p>
				<Spinner />
			</div>
		);
	}

	return (
		<div className="waveStatus fading">
			{totalWaves ? totalWaves : 0}/16 Tasks
		</div>
	);
}
