// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../LogChecker.sol";

contract LogCheckerUnderTest is LogChecker {
	function extractReceiptsRoot(bytes memory rlpEncodedBlockHeader) external pure returns (bytes32 receiptRoot) {
		return _extractReceiptsRoot(rlpEncodedBlockHeader);
	}

}
