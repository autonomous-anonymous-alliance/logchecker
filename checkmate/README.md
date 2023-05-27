# checkmate

`checkmate` is a Javascript tool that checks membership of events in blocks off-chain.

## CLI

### `encode`

Inputs:

1. `--abi` - ABI for a smart contract
2. `--event` - Name of an event that can be fired by that smart contract
3. `--params` - Parameters for the event, in the correct order, provided as a space-separated list.

Output: The encoded event (as represented in Ethereum logs).

### `prove`

Inputs:

1. `--blockhash` - Hash of the block in which the transaction was mined.
2. `--txhash` - Hash of the transaction that fired the event.

Output: Merkle proof that the transaction was mined in the block.

### `verify`

Inputs:

1. `--blockhash` - Hash of the block in which the transaction was mined.
2. `--txproof` - Merkle proof that the transaction was mined in the block.
3. `--logindex` - Index of the log in the transaction.
4. `--log` - Encoded event (as represented in Ethereum logs).

Output: True if the event with the given log was fired in the transaction, false otherwise.
