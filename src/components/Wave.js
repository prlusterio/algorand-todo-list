import React, { useState } from "react";
import dayjs from "dayjs";

import { Reaction } from "../hooks/useWallet";

import "./Wave.css";

const ReactionEmojis = {
	[Reaction.Wave]: "👋",
	[Reaction.Cake]: "🍰",
	[Reaction.Hype]: "🔥",
};

export default function Wave({ message, status, onTodoAction }) {
	const [trigger, setTrigger] = useState(false)
	return (
		<div className="wave">
			<div onMouseOver={() => setTrigger(true)} onMouseOut={() => setTrigger(false)} onClick={() => status ? null : onTodoAction('complete', message)} className="reaction">{status ? <>✅</> : !trigger ? <>🔘</> : <>✅</>}</div>
			<div className="body">
				<dl>
					{/* <dt>From:</dt> */}
					{/* <dd>{waver}</dd> */}
					{/* <dt>Time:</dt>
					<dd>
						{formatDate(timestamp)} at {formatTime(timestamp)}
					</dd> */}
				</dl>
				<div className="message">{message}</div>
			</div>
			<div onClick={() => onTodoAction('remove', message)} className="reaction">{status === 1 && <>❌</>}</div>
		</div>
	);
}

function formatDate(timestamp) {
	return dayjs(timestamp).format("MMM D, YYYY");
}

function formatTime(timestamp) {
	return dayjs(timestamp).format("h:mm:ss a");
}
