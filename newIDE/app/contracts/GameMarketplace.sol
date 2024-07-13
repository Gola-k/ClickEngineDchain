// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract GameMarketplace is ERC1155, ERC1155Holder {
    uint256 public constant MAX_SUPPLY = 100;

    // Struct to represent each NFT
    struct NFT {
        address owner;
        uint256 sellingPrice;
        address payable seller;
        uint256 tokenId;  
        string accessId;   
    }

    // Mapping from access ID to NFT details
    mapping(string => NFT) public nftsByAccessId;

    // Mapping from access ID to number of remaining NFTs
    mapping(string => uint256) public remainingNFTs;

    // Mapping from access ID and token ID to owner's address
    mapping(string => mapping(uint256 => address)) public ownersByAccessIdAndTokenId;

    // Mapping from access ID to mapping of token ID to URI
    mapping(string => mapping(uint256 => string)) public tokenURIs;

    string[] internal accessIds;

    // Events
    event NFTPublished(string accessId, address indexed owner);
    event NFTBought(string accessId, address indexed buyer);

    constructor() ERC1155("") {}

    // Publish/Listing Function
    function publishNFT(string memory _accessId, uint256 _sellingPrice, string memory _tokenURI) external {
        require(remainingNFTs[_accessId] == 0, "NFTs for this access ID already exist");
        
        // Initialize the array of token IDs and values
        uint256[] memory ids = new uint256[](MAX_SUPPLY);
        uint256[] memory values = new uint256[](MAX_SUPPLY);
        for (uint256 i = 0; i < MAX_SUPPLY; i++) {
            ids[i] = i;
            values[i] = 1;
        }
        // Mint the NFTs for the given access ID
        _mintBatch(address(this), ids, values, "");

        // Update NFT details
        nftsByAccessId[_accessId] = NFT(address(this), _sellingPrice, payable(msg.sender), 404, _accessId);
        remainingNFTs[_accessId] = MAX_SUPPLY;
        accessIds.push(_accessId);

        // Set the URI for the tokens
        setURIForAccessIdAndTokenId(_accessId, _tokenURI, ids);

        // Call createMarketItem function
        createMarketItem(_accessId, _sellingPrice);
        
        emit NFTPublished(_accessId, address(this));
    }

    // Set URI for Access ID and Token ID
    function setURIForAccessIdAndTokenId(string memory _accessId, string memory _tokenURI, uint256[] memory _tokenIds) private {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            tokenURIs[_accessId][_tokenIds[i]] = _tokenURI;
        }
    }

    // Buying function
    function buyNFT(string memory _accessId) external payable {
        require(remainingNFTs[_accessId] > 0, "No NFTs remaining for this access ID");
        require(msg.value >= nftsByAccessId[_accessId].sellingPrice, "Insufficient funds");

        address payable seller = nftsByAccessId[_accessId].seller;
        seller.transfer(msg.value);

        uint256 tokenId = MAX_SUPPLY - remainingNFTs[_accessId] + 1;
        require(tokenId <= MAX_SUPPLY, "All NFTs already sold");

        _safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        updateOwnerByAccessIdAndTokenId(_accessId, tokenId, msg.sender);

        remainingNFTs[_accessId]--;

        // If all NFTs for this access ID are sold, update the seller address
        if (remainingNFTs[_accessId] == 0) {
            nftsByAccessId[_accessId].seller = payable(address(0));
        }

        emit NFTBought(_accessId, msg.sender);
    }

    // Function to create market item
    function createMarketItem(string memory _accessId, uint256 _sellingPrice) private {
        require(_sellingPrice > 0, "Price must be greater than 0");

        nftsByAccessId[_accessId].sellingPrice = _sellingPrice;
        nftsByAccessId[_accessId].seller = payable(msg.sender);
    }

    // Function to fetch token URI for a specific access ID and token ID
    function getTokenURI(string memory _accessId, uint256 _tokenId) external view returns (string memory) {
        return tokenURIs[_accessId][_tokenId];
    }

    // Fetching last NFTs function
    function fetchLastNFTs() external view returns (NFT[] memory) {
        NFT[] memory lastNFTs = new NFT[](accessIds.length);
        
        for (uint256 i = 0; i < accessIds.length; i++) {
            string memory accessId = accessIds[i];
            
            if (remainingNFTs[accessId] > 0) {
                uint256 tokenId = MAX_SUPPLY - remainingNFTs[accessId] + 1;
                if (remainingNFTs[accessId] > 0 ) {
                    lastNFTs[i] = nftsByAccessId[accessId];
                    lastNFTs[i].tokenId = tokenId;
                }
            }
        }
        
        return lastNFTs;
    }

    function fetchMyBoughtNFTs() external view returns (NFT[] memory) {
        // Get the current connected account
        address myAddress = msg.sender;

        // Initialize an array to store fetched NFTs
        NFT[] memory boughtNFTs = new NFT[](accessIds.length);

        uint256 numOfBoughtNFTs = 0; // Counter for the number of bought NFTs

        // Iterate through all access IDs
        for (uint256 i = 0; i < accessIds.length; i++) {
            string memory accessId = accessIds[i];
            
            // Iterate through all token IDs for the current access ID
            for (uint256 j = 1; j <= MAX_SUPPLY; j++) {
                // Check if the current token is owned by the caller
                if (ownersByAccessIdAndTokenId[accessId][j] == myAddress) {
                    // Populate the boughtNFTs array with the NFT details
                    boughtNFTs[numOfBoughtNFTs] = nftsByAccessId[accessId];
                    boughtNFTs[numOfBoughtNFTs].tokenId = j;
                    numOfBoughtNFTs++; // Increment the counter for bought NFTs
                }
            }
        }

        // Resize the boughtNFTs array to the actual number of bought NFTs
        assembly {
            mstore(boughtNFTs, numOfBoughtNFTs)
        }

        return boughtNFTs;
    }

    function getaccessIdslist() external view returns(string[] memory) {
          return accessIds;
    }

    // Function to fetch remaining NFTs for a specific access ID
    function fetchRemainingNFTs(string memory _accessId) external view returns (uint256) {
        return remainingNFTs[_accessId];
    }

    // Function to update owner's address for a specific access ID and token ID
    function updateOwnerByAccessIdAndTokenId(string memory _accessId, uint256 _tokenId, address _newOwner) internal {
        ownersByAccessIdAndTokenId[_accessId][_tokenId] = _newOwner;
    }

    // Function to fetch owner's address for a specific access ID and token ID
    function fetchOwnerByAccessIdAndTokenId(string memory _accessId, uint256 _tokenId) external view returns (address) {
        return ownersByAccessIdAndTokenId[_accessId][_tokenId];
    }

    // Override the support interface function 
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC1155Holder) returns (bool) {
        return ERC1155.supportsInterface(interfaceId) || ERC1155Holder.supportsInterface(interfaceId);
    }
}