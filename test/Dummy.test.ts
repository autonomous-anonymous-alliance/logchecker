import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, network} from 'hardhat';
import {Dummy} from '../typechain';
import {setupUsers} from './utils';

const {GetProof} = require('eth-proof');

const setup = deployments.createFixture(async () => {
	await deployments.fixture('Dummy');
	const contracts = {
		Dummy: <Dummy>await ethers.getContract('Dummy'),
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

	it('dummy event proved', async function () {
		const {users, Dummy} = await setup();
		const a = 2;
		const b = 3;
		const tx = await users[0].Dummy.emitDummy(a, b);
		await tx.wait();

		const block = await network.provider.request({
			method: 'eth_getBlockByHash',
			params: [tx.blockHash, false],
		});
		const pr = await prover.receiptProof(txHash);
		const receiptProof = prepareReceiptProof(pr);

		const result = await eventProof.functions.merkleProof(
			receiptProof.rlpEncodedReceipt,
			receiptProof.path,
			receiptProof.witness,
			block.receiptsRoot
		);

		expect(result).to.be.true;
	});
});
