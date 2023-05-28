// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "solidity-rlp/contracts/RLPReader.sol";
import "hardhat/console.sol";

contract LogVerifier {

	using RLPReader for bytes;
    using RLPReader for uint;
    using RLPReader for RLPReader.RLPItem;
    using RLPReader for RLPReader.Iterator;


	// --------------------------------------------------------------------------------------------
	// PUBLIC INTERFACE
	// --------------------------------------------------------------------------------------------

    function isReceiptPartOfBlock(
        bytes32 trustedBlockhash,
        bytes memory rlpEncodedBlockHeader,
        bytes memory rlpEncodedReceipt,
        bytes memory receiptPath,
        bytes memory receiptWitness
    ) public view returns(bool) {
        if(trustedBlockhash != keccak256(rlpEncodedBlockHeader)) return false;

        // extract the receipts from the verified block header
        bytes32 receiptsRoot = _extractReceiptsRoot(rlpEncodedBlockHeader);

        // use the root to prove inclusion of the receipt
        // return MerklePatriciaProof.verify(rlpEncodedReceipt, receiptPath, receiptWitness, receiptsRoot);
    }

	// --------------------------------------------------------------------------------------------
	// INTERNAL
	// --------------------------------------------------------------------------------------------

	function _extractReceiptsRoot(bytes memory rlpEncodedBlockHeader) internal view returns (bytes32 receiptRoot) {
		uint256 memPtr;
        assembly {
            memPtr := add(rlpEncodedBlockHeader, 188) // 188 = 32 (data pointer, skip length) + 3 (block header rlp length) + 33 (parentHash) + 33 (sha3Uncles) + 21 (coinbase) +33 (stateRoot) + 33 (transactionRoot)
        }


		// setup the rlp iterator
        // RLPReader.Iterator memory it = rlpEncodedBlockHeader.toRlpItem().iterator();
		// get the receiptRoot (5th bytes32 item in the blockHeader)
		// RLPReader.RLPItem memory item;
		// item = it.next();
		// item = it.next();
		// item = it.next();
		// item = it.next();
		// item = it.next();
		// item = it.next();
		// // parse it and return it as a bytes32
		// receiptRoot = bytes32(item.toUint());

		receiptRoot = bytes32(RLPReader.RLPItem({
			memPtr: memPtr,
			len: 33
		}).toUint());
	}

}
