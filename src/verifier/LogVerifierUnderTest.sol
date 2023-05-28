// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "./LogVerifier.sol";
import "hardhat/console.sol";

contract LogVerifierUnderTest is LogVerifier {
	function extractReceiptsRoot(bytes memory rlpEncodedBlockHeader) external view returns (bytes32 receiptRoot) {
		return _extractReceiptsRoot(rlpEncodedBlockHeader);
	}

}
