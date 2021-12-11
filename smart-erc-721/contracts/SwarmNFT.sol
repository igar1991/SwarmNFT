// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";

/**
 * @title SwarmNFT
 * SwarmNFT - a contract for my non-fungible tokens.
 */
contract SwarmNFT is ERC721Tradable {
    constructor()
        ERC721Tradable("Memezzz", "MMZZZ")
    {}

    function baseTokenURI() override public pure returns (string memory) {
        return "https://myurl.io/api/creature/";
    }

    function contractURI() public pure returns (string memory) {
        return "https://myurl.io/contract/creatures";
    }
}
