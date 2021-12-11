const { ethers } = require('ethers')
const swarmNFT721ABI = require('../smart-erc-721/build/contracts/SwarmNFT.json').abi

export default class SwarmNFT {
  /**
   * Bee instance
   * @type Bee
   */
  bee = null
  /**
   * Ethers provider
   * @type {BaseProvider}
   */
  provider = null
  /**
   * Bee postage batch id
   * @type string
   */
  postageBatchId = ''
  /**
   *
   * @type {{type: string}}
   */
  createNFTConfig = {
    type: '721',
  }
  contractConfig = {}
  erc721Contract = null
  /**
   * Bee gateway template
   * @type {string}
   */
  gatewayUrlTemplate = 'https://bee-0.gateway.ethswarm.org/bzz/{reference}/'
  /**
   * Gateway postage batch id
   * @type {string}
   */
  gatewayPostageBatchId = '0000000000000000000000000000000000000000000000000000000000000000'
  /**
   * ERC721 ABI
   * @type {Array}
   */
  swarmNFT721ABI = swarmNFT721ABI

  /**
   *
   * @param {Bee} bee Bee-js instance
   * @param {BaseProvider} provider Ethers provider
   * @param {Signer} signer Ethers signer
   * @param {{erc721Address: string}} config
   */
  constructor(bee, provider, signer, config) {
    this.bee = bee
    this.provider = provider

    if (signer && config) {
      this.setContractConfig(signer, config)
    }
  }

  /**
   * Set ERC721 ABI
   * @param {Array} abi
   */
  setSwarmNFT721ABI(abi) {
    this.swarmNFT721ABI = abi
  }

  /**
   *
   * @param {string} gatewayUrlTemplate
   */
  setGatewayUrlTemplate(gatewayUrlTemplate) {
    this.gatewayUrlTemplate = gatewayUrlTemplate
  }

  /**
   * Set contract config and create new instance of the contract
   * @param {Signer} signer
   * @param {{erc721Address: string}} config
   */
  setContractConfig(signer, config) {
    if (!(signer && config)) {
      throw new Error('Empty config')
    }

    this.contractConfig = config
    this.erc721Contract = new ethers.Contract(config.erc721Address, this.swarmNFT721ABI, signer)
  }

  /**
   * Set gateway postage batch id
   */
  setGatewayPostageBatchId() {
    this.setPostageBatchId(this.gatewayPostageBatchId)
  }

  /**
   * Set custom postage batch id
   * @param {string} batchId
   */
  setPostageBatchId(batchId) {
    this.postageBatchId = batchId
  }

  /**
   * Upload NFT meta information to a swarm node
   * @param {object} meta
   * @param options
   * @returns {Promise<UploadResult>}
   */
  async uploadNFTMeta(meta, options = {}) {
    if (!this.postageBatchId) {
      throw new Error('Empty postageBatchId')
    }

    if (!meta) {
      throw new Error('Empty meta')
    }

    return this.bee.uploadFile(this.postageBatchId, JSON.stringify(meta), 'meta.json', options)
  }

  /**
   * Upload NFT meta information to a swarm node
   * @param {any} file
   * @param {string} extension
   * @param {object} options
   * @returns {Promise<UploadResult>}
   */
  async uploadNFTContent(file, extension = '.jpg', options = {}) {
    if (!this.postageBatchId) {
      throw new Error('Empty postageBatchId')
    }

    if (!file) {
      throw new Error('Empty file')
    }

    return this.bee.uploadFile(this.postageBatchId, file, `content${extension}`, options)
  }

  /**
   * Upload NFT content and meta
   * @param {any} file NFT content
   * @param {string} extension NFT content extension
   * @param {object} meta NFT meta content
   * @param {object} options Upload options
   * @param {boolean} gatewayPreview Output preview url type
   * @returns {Promise<{meta: Reference, imageUrl: Reference, metaUrl: string, content: Reference}>}
   */
  async uploadNFT(file, extension, meta, options = {}, gatewayPreview = true) {
    const uploadedContentInfo = await this.uploadNFTContent(file, extension, options)
    let imageUrl = uploadedContentInfo.reference
    const getUrl = (image, gatewayPreview) => {
      if (gatewayPreview) {
        image = this.gatewayUrlTemplate.replace('{reference}', image)
      } else {
        image = `bzz://${image}`
      }

      return image
    }

    imageUrl = getUrl(imageUrl, gatewayPreview)
    meta = { ...meta, image: imageUrl }
    const uploadedMetaInfo = await this.uploadNFTMeta(meta, options)
    const metaUrl = getUrl(uploadedMetaInfo.reference, gatewayPreview)

    return {
      meta: uploadedMetaInfo.reference,
      content: uploadedContentInfo.reference,
      imageUrl,
      metaUrl,
    }
  }

  /**
   * NFT config validator
   * @param config
   * @private
   */
  _checkNftConfig(config) {
    if (config.type !== '721') {
      throw new Error('Incorrect type. Should be 721')
    }

    if (config.type === '721' && !this.erc721Contract) {
      throw new Error('Empty ERC721 contract')
    }
  }

  /**
   * Mint new NFT to `toAddress` with meta information located on `nftMetaUri`
   * @param toAddress
   * @param nftMetaUri
   * @param config
   * @returns {Promise<*>}
   */
  async mintNFT(toAddress, nftMetaUri, config = this.createNFTConfig) {
    if (!nftMetaUri || !nftMetaUri.length) {
      throw new Error('Incorrect length of nftMetaUri')
    }

    if (toAddress.length !== 42) {
      throw new Error('Incorrect length of address. Should be 42')
    }

    this._checkNftConfig(config)

    if (config.type === '721') {
      return await this.erc721Contract.mintTo(toAddress, nftMetaUri)
    } else {
      throw new Error('Incorrect config type')
    }
  }

  /**
   * Mint NFT created off chain
   * @param to
   * @param externalId
   * @param uri
   * @param signature
   * @returns {Promise<*>}
   */
  async mintOffchain(to, externalId, uri, signature) {
    return this.erc721Contract.mintOffchain(to, externalId, uri, signature)
  }

  /**
   * Get total supply of NFT
   * @returns {Promise<*>}
   */
  async getTotalSupply() {
    return (await this.erc721Contract.totalSupply()).toNumber()
  }

  /**
   * Create DESC list of NFT ids
   * @param total
   * @returns {number[]}
   */
  createIdsList(total) {
    return [...Array(total).keys()].map(x => x + 1).reverse()
  }

  /**
   * Download all meta info for ids
   * @param ids
   * @returns {Promise<*>}
   */
  async getMetaForIds(ids) {
    const uris = {}
    for (let id of ids) {
      uris[id] = await this.erc721Contract.uris(id)
    }

    return ids.map(id => ({ id, metaUri: uris[id] }))
  }

  /**
   * Get list of user's tokens with meta information
   * @param userAddress
   * @param config
   * @returns {Promise<*>}
   */
  async getUserTokens(userAddress, config = this.createNFTConfig) {
    this._checkNftConfig(config)

    const filter = this.erc721Contract.filters.Transfer(null, userAddress)
    const filtered = await this.erc721Contract.queryFilter(filter)
    const tokenIds = filtered.map(item => Number(item.args.tokenId.toString()))
    const tokenUri = {}
    for (let tokenId of tokenIds) {
      const uri = await this.erc721Contract.uris(tokenId)
      let meta = ''
      try {
        meta = await (await fetch(uri)).json()
        // eslint-disable-next-line no-empty
      } catch (e) {}

      tokenUri[tokenId] = { uri, meta }
    }

    return tokenIds.map(item => ({ tokenId: item, ...tokenUri[item] }))
  }

  /**
   * Transfer NFT to address
   * @param from
   * @param to
   * @param tokenId
   * @param config
   * @returns {Promise<*>}
   */
  async safeTransferFrom(from, to, tokenId, config = this.createNFTConfig) {
    this._checkNftConfig(config)

    return this.erc721Contract['safeTransferFrom(address,address,uint256)'](from, to, tokenId)
  }
}
