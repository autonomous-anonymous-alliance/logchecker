// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Dummy {
	event DummyEvent(uint256 indexed a, uint256 b);

	function emitDummy(uint256 a, uint256 b) external {
		emit DummyEvent(a,b);
	}
}
