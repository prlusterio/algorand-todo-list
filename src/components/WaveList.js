import React from "react";

import Wave from "./Wave";

import "./WaveList.css";

export default function WaveList({ waveList, onTodoAction }) {
	if (!waveList) {
		return null;
	}

	return (
		<div className="waveList">
			{waveList.map((wave, i) => (
				<Wave
					key={i}
					message={wave.key}
					status={wave.value}
					onTodoAction={onTodoAction}
				/>
			))}
		</div>
	);
}
