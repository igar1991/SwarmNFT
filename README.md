# SwarmNFT.js

It is a JavaScript library for creating NFTs on Ethereum-compatible blockchains and storing content on Swarm. The
library contains the source codes of a smart contract for creating NFT in the ERC-721 standard and a JS library for
interacting with this contract. The library helps to correctly connect the meta-data of the content and the content
itself uploaded into Swarm.

The library allows you to interact with both private Swarm nodes and the public gateway. To mint NFT, you can use
Metamask, a seed phrase and a private key.

Demo project based on this library: https://github.com/igar1991/SwarmNFTDemo

## Installation and examples

Installation

`yarn add https://github.com/igar1991/SwarmNFT.git`

`yarn add @ethersphere/bee-js`

`yarn add ethers`


Using 

`import SwarmNFT from "swarm-nft/SwarmNFT.min";`

Using with Metamask

```js
// using Bee js for uploading
import {Bee} from "@ethersphere/bee-js";
// provider for interacting with contracts
const {providers} = require('ethers');

// chech if metamask attached to the page
if (typeof window.ethereum === 'undefined') {
    return;
}

let userAddress = null;
// instance of Bee with gateway url or private node url
const bee = new Bee('https://api.gateway.ethswarm.org');
// create provider from metamask
const provider = new providers.Web3Provider(window.ethereum, 'any');
// get user address from metamask
const addresses = await provider.send("eth_requestAccounts", []);
userAddress = addresses[0];
// get metamask signer
const signer = provider.getSigner();
// create instance of SwarmNFT
const instance = new SwarmNFT(bee, provider, signer, {
    erc721Address: '0xc5caC9F4610fb874F54aF5B12c19Cc5fECF75469'
});
// set gateway mode for free data uploading
instance.setGatewayPostageBatchId();
```

Upload file and metadata to the swarm

```js
const uploadResult = await swarmNftInstance.uploadNFT(file, '.jpg', {
    title: "My super title",
    description: "My super description"
})
```

Minting NFT via Metamask

```js
await swarmNftInstance.mintNFT(userAddress, uploadResult.metaUrl);
```

Also, you can upload only file to the Swarm

```js
await swarmNftInstance.uploadNFTContent(file, '.jpg');
```

Or just metadata

```js
await swarmNftInstance.uploadNFTMeta({
    title: "Hello",
    description: "World"
}, '.jpg');
```

Get total amount of NFTs

```js
await swarmNftInstance.getTotalSupply();
```

Or get NFTs for specific user

```js
await swarmNftInstance.getUserTokens(address);
```

Transfer NFT from owner to other user

```js
await swarmNftInstance.safeTransferFrom(fromAddress, toAddress, tokenId);
```

Get metadata for all NFTs

```js
await swarmNftInstance.getMetaForIds([1, 2, 3]);
```



## Contracts

The smart contract for NFT creation is located in the `smart-erc-721` directory. The contract allows you to create NFTs in the
ERC-721 standard. Tokens can be minted either directly from the user or using off-chain signatures from a trusted
address.

For each new project or collection of tokens, it is necessary to deploy the contract to the blockchain. All issued NFT tokens will have the specified description and token symbol. All these parameters can be changed during contract deployment.

`cd smart-erc-1155`


### Deploying

`cd smart-erc-721`

`cp example.env .env` - fill env params

Deploying to testnet

`truffle deploy --network=poa`

Deploying to mainnet

`truffle deploy --network=xdai`

The contracts have already been published on two networks, so these contracts can be used for testing.

POA address: 0xd91bce0E976ef5941a7da0eb09A6E09122A1B46A

xDai address: 0xc5caC9F4610fb874F54aF5B12c19Cc5fECF75469
