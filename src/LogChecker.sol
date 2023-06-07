// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "solidity-rlp/contracts/RLPReader.sol";

contract LogChecker {
	using RLPReader for bytes;
    using RLPReader for uint;
    using RLPReader for RLPReader.RLPItem;
    using RLPReader for RLPReader.Iterator;


	// --------------------------------------------------------------------------------------------
	// PUBLIC INTERFACE
	// --------------------------------------------------------------------------------------------

	// TODO
    // function isReceiptPartOfBlock(
    //     bytes32 trustedBlockhash,
    //     bytes memory rlpEncodedBlockHeader,
    //     bytes memory rlpEncodedReceipt,
    //     bytes memory receiptPath,
    //     bytes memory receiptWitness
    // ) public view returns(bool) {
    //     if(trustedBlockhash != keccak256(rlpEncodedBlockHeader)) return false;

    //     // extract the receipts from the verified block header
    //     bytes32 receiptsRoot = _extractReceiptsRoot(rlpEncodedBlockHeader);

    //     // use the root to prove inclusion of the receipt
    //     // return MerklePatriciaProof.verify(rlpEncodedReceipt, receiptPath, receiptWitness, receiptsRoot);
    // }

	// --------------------------------------------------------------------------------------------
	// INTERNAL
	// --------------------------------------------------------------------------------------------

	function _extractReceiptsRoot(bytes memory rlpEncodedBlockHeader) internal pure returns (bytes32 receiptRoot) {
		uint256 memPtr;
        assembly {
            memPtr := add(rlpEncodedBlockHeader, 188) // 188 = 32 (data pointer, skip length) + 3 (block header rlp length) + 33 (parentHash) + 33 (sha3Uncles) + 21 (coinbase) +33 (stateRoot) + 33 (transactionRoot)
        }

		receiptRoot = bytes32(RLPReader.RLPItem({
			memPtr: memPtr,
			len: 33
		}).toUint());
	}

}


