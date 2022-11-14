import React from "react";

import Wave from "./Wave";

import "./WaveList.css";

export default function WaveList({ waveList, onTodoAction }) {
	if (!waveList) {
		return null;
	}

	return (
		<div className="waveList">
			{waveList.map((wave,i) => (
				<Wave
					key={i}
					// key={wave.timestamp}
					// reaction={wave.reaction}
					message={wave.key}
					status={wave.value}
					onTodoAction={onTodoAction}
					// waver={wave.waver}
					// timestamp={wave.timestamp}
				/>
			))}
		</div>
	);
}
