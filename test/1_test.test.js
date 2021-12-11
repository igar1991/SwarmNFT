const {swarmNFT} = require('./utils');
const fs = require('fs');

const nftOwner = '0x40F41c1F9C1b832A760735a130Cd3dA761475dA2';
const user2 = '0x980F5aC0Fe183479B87f78E7892f8002fB9D5401';
test('Upload NFT to gateway', async () => {
    swarmNFT.setGatewayPostageBatchId();
    const file = fs.createReadStream('./test/files/1_logo.png');
    const result = await swarmNFT.uploadNFT(file, '.png',{
        title: "Hey title",
        description: "Lol, joke"
    });
    console.log(result);
    // file 9ba08c88f28574dcaa52891fc9955550c027de652015cc1c05a45b0c0efc0e5f
    // meta 65ec83481bd6d6c1e5d1d141f18aa37f893bf4ef0913f3a61c29b69ccf771856
    const nftResult = await swarmNFT.mintNFT(nftOwner, result.metaUrl);
    await nftResult.wait();
    console.log(nftResult);
});

test('Transfer token to other user', async () => {
    let nftResult = await swarmNFT.safeTransferFrom(nftOwner, user2, 3);
    console.log(nftResult);
    nftResult = await nftResult.wait();
    console.log(nftResult);
});

test('Get user tokens', async () => {
    let nftResult = await swarmNFT.getUserTokens(nftOwner);
    console.log('nftResult', nftResult);
});

test('Get all memes', async () => {
    let totalSupply = await swarmNFT.getTotalSupply();
    console.log('totalSupply', totalSupply);
    let meta = await swarmNFT.getMetaForIds(swarmNFT.createIdsList(totalSupply));
    console.log('meta', meta);
});
