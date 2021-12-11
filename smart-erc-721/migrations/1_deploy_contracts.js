const SwarmNft = artifacts.require("SwarmNft");

module.exports = async function (deployer, network) {
    await deployer.deploy(SwarmNft, {gas: 5000000});
};
