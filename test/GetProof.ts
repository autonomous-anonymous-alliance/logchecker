const {encode} = require('eth-util-lite');
const {promisfy} = require('promisfy');

const Tree = require('merkle-patricia-tree');

const Rpc = require('isomorphic-rpc');

const {Header, Proof, Receipt, Transaction} = require('eth-object');

export class GetProof {
	constructor() {}
	async receiptProof(receipts: any, targetReceipt: any, block: any) {
		let tree = new Tree();

		await Promise.all(
			receipts.map((siblingReceipt: any, index: any) => {
				let siblingPath = encode(index);
				let serializedReceipt = Receipt.fromRpc(siblingReceipt).serialize();
				return promisfy(tree.put, tree)(siblingPath, serializedReceipt);
			})
		);

		let [_, __, stack] = await promisfy(tree.findPath, tree)(encode(targetReceipt.transactionIndex));

		return {
			header: Header.fromRpc(block),
			receiptProof: Proof.fromStack(stack),
			txIndex: targetReceipt.transactionIndex,
		};
	}
}
