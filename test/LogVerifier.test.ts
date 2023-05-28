import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts, network} from 'hardhat';
import {Dummy, LogVerifierUnderTest} from '../typechain';
import {setupUsers} from './utils';
import {EIP1193Provider, EIP1193Block} from 'eip-1193';
import rlp from 'rlp';

function toRLPHeader(block: EIP1193Block) {
	return rlp.encode([
		block.parentHash,
		block.sha3Uncles,
		block.miner,
		block.stateRoot,
		block.transactionsRoot,
		block.receiptsRoot,
		block.logsBloom,
		block.difficulty,
		block.number,
		block.gasLimit,
		block.gasUsed,
		block.timestamp,
		block.extraData,
		(block as any).mixHash, // TODO add mixHash to EIP1193Block
		block.nonce,
	]);
}

const setup = deployments.createFixture(async () => {
	const {deployer} = await getNamedAccounts();
	await deployments.fixture(['Dummy']);
	await deployments.deploy('LogVerifier', {
		contract: 'LogVerifierUnderTest',
		from: deployer,
		args: [],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});
	const contracts = {
		Dummy: <Dummy>await ethers.getContract('Dummy'),
		LogVerifier: <LogVerifierUnderTest>await ethers.getContract('LogVerifier'),
	};
	const users = await setupUsers(await getUnnamedAccounts(), contracts);
	return {
		...contracts,
		users,
	};
});

describe('LogVerifier', function () {
	it('receiptsRoot', async function () {
		const {users, LogVerifier} = await setup();
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

		console.log({
			receiptBlockHash: receipt.blockHash,
			blockHash: block.hash,
			receiptsRoot: block.receiptsRoot,
		});
		const rlpEncodedHeader = toRLPHeader(block);
		const receiptRootFromVerifier = await LogVerifier.callStatic.extractReceiptsRoot(rlpEncodedHeader);

		expect(receiptRootFromVerifier).to.equal(block.receiptsRoot);
	});
});
