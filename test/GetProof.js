const {encode} = require('eth-util-lite');
const {promisfy} = require('promisfy');

const Tree = require('merkle-patricia-tree');

const Rpc = require('isomorphic-rpc');

const {Header, Proof, Receipt, Transaction} = require('eth-object');

module.exports = class GetProof {
	constructor() {}
	async receiptProof(receipts) {
		let tree = new Tree();

		await Promise.all(
			receipts.map((siblingReceipt, index) => {
				let siblingPath = encode(index);
				let serializedReceipt = Receipt.fromRpc(siblingReceipt).serialize();
				return promisfy(tree.put, tree)(siblingPath, serializedReceipt);
			})
		);

		let [_, __, stack] = await promisfy(tree.findPath, tree)(encode(targetReceipt.transactionIndex));

		return {
			header: Header.fromRpc(rpcBlock),
			receiptProof: Proof.fromStack(stack),
			txIndex: targetReceipt.transactionIndex,
		};
	}
};
