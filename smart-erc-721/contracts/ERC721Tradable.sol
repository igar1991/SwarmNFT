// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./common/meta-transactions/ContentMixin.sol";
import "./common/meta-transactions/NativeMetaTransaction.sol";
import "./VerifySignature.sol";

contract OwnableDelegateProxy {}

/**
 * Used to delegate ownership of a contract to another address, to save on unneeded transactions to approve contract use for users
 */
contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

/**
 * @title ERC721Tradable
 * ERC721Tradable - ERC721 contract that whitelists a trading address, and has minting functionality.
 */
abstract contract ERC721Tradable is ERC721, ContextMixin, NativeMetaTransaction, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    address public _trustedSigner;
    // external to internal
    mapping(uint256 => uint256) public externalIdConnections;
    // internal to external
    mapping(uint256 => uint256) public internalIdConnections;
    // internal ID with JSON uri
    mapping(uint256 => string) public uris;

    /**
     * We rely on the OZ Counter util to keep track of the next available ID.
     * We track the nextTokenId instead of the currentTokenId to save users on gas costs.
     * Read more about it here: https://shiny.mirror.xyz/OUampBbIz9ebEicfGnQf5At_ReMHlZy0tB4glb9xQ0E
     */
    Counters.Counter private _nextTokenId;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        // nextTokenId is initialized to 1, since starting at 0 leads to higher gas cost for the first minter
        _nextTokenId.increment();
        _initializeEIP712(_name);
        _trustedSigner = msg.sender;
    }

    /**
     * @dev Mints tokens for any user without external id
     * @param _to address of the future owner of the token
     */
    function mintTo(address _to, string memory _uri) public {
        uint256 currentTokenId = _nextTokenId.current();
        _nextTokenId.increment();
        _safeMint(_to, currentTokenId);
        uris[currentTokenId] = _uri;
    }

    function setTrustedSigner(address _signer) public onlyOwner {
        _trustedSigner = _signer;
    }

    // todo create some basic security-check tests
    /**
    * Mint token created offchain
    **/
    function mintOffchain(address _to, uint _externalId, string memory _uri, bytes memory _signature) public {
        VerifySignature verifySignature = new VerifySignature();
        require(verifySignature.verify(_trustedSigner, _to, _externalId, _uri, 0, _signature), "Signature isn't from trusted address");
        require(externalIdConnections[_externalId] == 0, "External ID is already used");

        uint256 currentTokenId = _nextTokenId.current();
        _nextTokenId.increment();
        _safeMint(_to, currentTokenId);

        externalIdConnections[_externalId] = currentTokenId;
        internalIdConnections[currentTokenId] = _externalId;
        uris[currentTokenId] = _uri;
    }

    /**
        @dev Returns the total tokens minted so far.
        1 is always subtracted from the Counter since it tracks the next available tokenId.
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId.current() - 1;
    }

    function baseTokenURI() virtual public pure returns (string memory);

    function tokenURI(uint256 _tokenId) override public view returns (string memory) {
        return uris[_tokenId];
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender()
    internal
    override
    view
    returns (address sender)
    {
        return ContextMixin.msgSender();
    }
}
