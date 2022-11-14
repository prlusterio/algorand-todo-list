import React from "react";
import classNames from "classnames";

export default function Wallet({
	loading,
	walletInstalled,
	walletConnected,
	networkName,
	isMumbai,
	optedIn,
	optIn,
	connectWallet,
	handleDisconnectWalletClick
}) {
	if (loading) {
		return <div className="buttonGroup" />;
	}

	return (
		<div className="buttonGroup justifyCenter fading">
			{!walletInstalled && (
				<a
					className="button buttonNoWallet"
					href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn/related"
					target="_blank"
					rel="noopener noreferrer"
				>
					Install MetaMask
				</a>
			)}
			{!walletConnected && (
				<button className="button buttonMetaMask" onClick={connectWallet}>
					Connect Wallet
				</button>
			)}
			{walletConnected && (
				<div>
					<div>
						<span className="dotConnected" />
						Wallet Connected
					</div>
					{/* <div
						className={classNames(
							"network",
							isMumbai ? "networkValid" : "networkInvalid",
						)}
					>
						Network: <span className="networkName">{networkName}</span>
					</div>
					{!isMumbai && (
						<div className="network networkInvalid">
							Please switch to Polygon Mumbai
						</div>
					)} */}
				</div>
			)}
			{walletConnected && (
				<button className="button buttonMetaMask" onClick={handleDisconnectWalletClick}>
					Disconnect Wallet
				</button>
			)}
			<div>
				<div>
					{walletConnected && !optedIn && (
						<button className="button buttonMetaMask" onClick={optIn}>
							Register
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
