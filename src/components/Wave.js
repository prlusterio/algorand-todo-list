import React, { useState } from "react";
import "./Wave.css";

export default function Wave({ message, status, onTodoAction }) {
	const [trigger, setTrigger] = useState(false)
	return (
		<div className="wave" role='button'>
			<div onMouseOver={() => setTrigger(true)} onMouseOut={() => setTrigger(false)} onClick={() => status ? null : onTodoAction('complete', message)} className="reaction">{status ? <>✅</> : !trigger ? <span role='button'>🔘</span> : <>✅</>}</div>
			<div className="body">
				<div className="message">{message}</div>
			</div>
			<div onClick={() => onTodoAction('remove', message)} className="reaction">{status === 1 && <>❌</>}</div>
		</div>
	);
}