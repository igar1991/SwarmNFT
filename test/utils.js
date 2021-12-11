require('dotenv').config();
/**
 *
 * @type {SwarmNFT}
 */
const SwarmNFT = require('../SwarmNFT.develop');
const {providers, Wallet} = require('ethers');
import {Bee} from "@ethersphere/bee-js"

console.log('process.env.JSON_RPC_PROVIDER', process.env.JSON_RPC_PROVIDER);
const provider = new providers.JsonRpcProvider(process.env.JSON_RPC_PROVIDER);
const signer = new Wallet(process.env.PRIVATE_KEY, provider);
console.log(`Signer address: ${signer.address} - current user`);
const bee = new Bee("https://bee-0.gateway.ethswarm.org");
// 0xd91bce0E976ef5941a7da0eb09A6E09122A1B46A - poa contract
// check token image - https://blockscout.com/poa/sokol/token/0xd91bce0e976ef5941a7da0eb09a6e09122a1b46a/instance/1/token-transfers
module.exports.swarmNFT = new SwarmNFT(bee, provider, signer, {
    erc721Address: process.env.CONTRACT_ADDRESS
});
