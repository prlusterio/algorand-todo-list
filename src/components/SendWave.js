import React, { useEffect, useState } from "react";
import classNames from "classnames";

import WaveStatus from "./WaveStatus";

import "./SendWave.css";
import { WriteStatus } from "../hooks/useWallet";

export default function SendWave({
	walletInstalled,
	walletConnected,
	loading,
	writeLoading,
	totalWaves,
	onTodoAction,
	optedIn
}) {
	const [message, setMessage] = useState("");
	const disableInput = Boolean(writeLoading) || !optedIn;
	const disableButtons =
		!optedIn ||
		!walletInstalled ||
		!walletConnected ||
		loading ||
		writeLoading ||
		message.length === 0;

	useEffect(() => {
		if (writeLoading === WriteStatus.None) {
			setMessage("");
		}
	}, [writeLoading]);

	return (
		<div>
			<div className="textWrapper">
				<label htmlFor="message">Write your task below:</label>
				<textarea
					id="message"
					className={classNames("textBox")}
					disabled={disableInput}
					value={message}
					onChange={(ev) => setMessage(ev.target.value)}
				/>
			</div>
			<section
				className={classNames("buttonGroup", disableButtons && "disabled")}
			>
				<button className="button buttonWave" onClick={() => onTodoAction('create', message)}>
					<span className="buttonEmoji" role="img" aria-label="Wave">
						✍🏻
					</span>
					Create a task
				</button>
			</section>
			<WaveStatus
				loading={loading}
				writeLoading={writeLoading}
				totalWaves={totalWaves}
			/>
		</div>
	);
}
