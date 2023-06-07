import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, network, getNamedAccounts} from 'hardhat';
import {Dummy, EventProof} from '../typechain';
import {setupUsers} from './utils';
import {EIP1193Provider} from 'eip-1193';
import {GetProof} from './GetProof';

function prepareReceiptProof(proof: any) {
	// the path is HP encoded
	const indexBuffer = proof.txIndex.slice(2);
	const hpIndex = '0x' + (indexBuffer.startsWith('0') ? '1' + indexBuffer.slice(1) : '00' + indexBuffer);

	// the value is the second buffer in the leaf (last node)
	const value = '0x' + Buffer.from(proof.receiptProof[proof.receiptProof.length - 1][1]).toString('hex');
	// the parent nodes must be rlp encoded
	const parentNodes = ethers.utils.RLP.encode(proof.receiptProof);

	return {
		path: hpIndex,
		rlpEncodedReceipt: value,
		witness: parentNodes,
	};
}

const setup = deployments.createFixture(async () => {
	await deployments.fixture(['Dummy', 'EventProof']);

	const {deployer} = await getNamedAccounts();
	await deployments.deploy('EventProof', {
		from: deployer,
		args: [],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});
	const contracts = {
		Dummy: <Dummy>await ethers.getContract('Dummy'),
		EventProof: <EventProof>await ethers.getContract('EventProof'),
	};
	const users = await setupUsers(await getUnnamedAccounts(), contracts);
	return {
		...contracts,
		users,
	};
});
describe('Dummy', function () {
	it('dummy event works', async function () {
		const {users, Dummy} = await setup();
		const a = 2;
		const b = 3;
		await expect(users[0].Dummy.emitDummy(a, b)).to.emit(Dummy, 'DummyEvent').withArgs(a, b);
	});

	it.skip('dummy event proved', async function () {
		const prover = new GetProof();
		const {users, Dummy} = await setup();
		const a = 2;
		const b = 3;
		const tx = await users[0].Dummy.emitDummy(a, b);
		await tx.wait();

		const block = await (network.provider as EIP1193Provider).request({
			method: 'eth_getBlockByHash',
			params: [tx.blockHash as `0x${string}`, false],
		});

		const receipt = await (network.provider as EIP1193Provider).request({
			method: 'eth_getTransactionReceipt',
			params: [tx.hash as `0x${string}`],
		});

		const pr = await prover.receiptProof([receipt], receipt, block);
		const receiptProof = prepareReceiptProof(pr);

		// console.log({
		// 	rlpEncodedReceipt: receiptProof.rlpEncodedReceipt,
		// 	path: receiptProof.path,
		// 	witness: receiptProof.witness,
		// 	receiptsRoot: block.receiptsRoot,
		// });

		const result = await users[0].EventProof.merkleProof(
			receiptProof.rlpEncodedReceipt,
			'0x10', //receiptProof.path,
			receiptProof.witness,
			block.receiptsRoot
		);

		expect(result).to.be.true;
	});
});
