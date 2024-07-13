import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';
import { Buffer } from 'buffer';
import { GameMarketAddress, GameMarketAddressABI } from './constants';
export const GameContext = React.createContext();

const ethers = require('ethers');

const fetchContract = signerorProvider =>
  new ethers.Contract(
    GameMarketAddress,
    GameMarketAddressABI,
    signerorProvider
  );

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.API_KEY_SECRET;
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString(
  'base64'
)}`;

export const GameProvider = ({ children }) => {
  console.log('auth: ', auth);
  const client = useRef({});
  console.log('client: ', client);
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const [fileURL, setFileURL] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [accessID, setAccessID] = useState('');
  const [boughtNFTs, setBoughtNFTs] = useState([]);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const nftCurrency = 'ETH';

  const generateAccessId = () => {
    const timestamp = Date.now();
    const randomPart = Math.random()
      .toString(36)
      .substring(7);
    const ABC = `${timestamp}_${randomPart}`;
    setAccessID(ABC);
    return ABC;
  };

  const hasBoughtNFT = accessId => {
    return boughtNFTs.includes(accessId);
  };

  const handleFileUpload = async file => {
    console.log('---+++========>>>>>>>>>', file);
    const formData = new FormData();
    formData.append('file', file, file.name);
    console.log('formData ======>>>>>>', formData);
    const subdomain = 'https://gateway.pinata.cloud';

    const JWT =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMzJkMGViNy05MmEwLTQ3OTctODgxNi0wMTMzZTI3M2I3MjYiLCJlbWFpbCI6InZpc2hhbGR1YmV5ODEzMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMmViMzY5ZjE2YmIwY2RhN2UyZjQiLCJzY29wZWRLZXlTZWNyZXQiOiJmNGUzNTYzODllNmM4NGRjYjY1OGNkZGJkNmNiOTAwNzRiMGVmNDE1NGU1YThjNTEwMzQ2NTM4ZTJkODU4YTcyIiwiaWF0IjoxNzE0MDM3MDQ4fQ.zhaM6JNFaVIWN2smCdRzPHviMEO8IFMklO9Vl2S8G5s';

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      const url = `${subdomain}/ipfs/${response.data.IpfsHash}`;
      console.log('File URL:', url);
      setFileURL(url);
      // console.log("file url ----->>>>>", url)
    } catch (error) {
      console.error('Error uploading file:', error.response.data);
    }
  };

  const handleImageUpload = async image => {
    const formData = new FormData();
    // console.log("image=====>>>>>", image)
    formData.append('file', image, image.name);
    const subdomain = 'https://gateway.pinata.cloud';

    const JWT =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMzJkMGViNy05MmEwLTQ3OTctODgxNi0wMTMzZTI3M2I3MjYiLCJlbWFpbCI6InZpc2hhbGR1YmV5ODEzMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMmViMzY5ZjE2YmIwY2RhN2UyZjQiLCJzY29wZWRLZXlTZWNyZXQiOiJmNGUzNTYzODllNmM4NGRjYjY1OGNkZGJkNmNiOTAwNzRiMGVmNDE1NGU1YThjNTEwMzQ2NTM4ZTJkODU4YTcyIiwiaWF0IjoxNzE0MDM3MDQ4fQ.zhaM6JNFaVIWN2smCdRzPHviMEO8IFMklO9Vl2S8G5s';

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      const url = `${subdomain}/ipfs/${response.data.IpfsHash}`;
      console.log('Image URL:', url);
      setImageURL(url);
    } catch (error) {
      console.error('Error uploading image:', error.response.data);
    }
  };

  const handleSubmit = async (formInput, accessID) => {
    // const accessId = await generateAccessId();
    // Handle form submission to Pinata IPFS
    // Combine finalImageURL, finalFileURL, name, and description into JSON object
    const { name, description, price } = formInput ?? {};
    const formData = {
      name: name,
      fileURL: fileURL,
      imageURL: imageURL,
      description: description,
      price: price,
      accessId: accessID,
    };
    // e.preventDefault();
    const subdomain = 'https://gateway.pinata.cloud';

    const JWT =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMzJkMGViNy05MmEwLTQ3OTctODgxNi0wMTMzZTI3M2I3MjYiLCJlbWFpbCI6InZpc2hhbGR1YmV5ODEzMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMmViMzY5ZjE2YmIwY2RhN2UyZjQiLCJzY29wZWRLZXlTZWNyZXQiOiJmNGUzNTYzODllNmM4NGRjYjY1OGNkZGJkNmNiOTAwNzRiMGVmNDE1NGU1YThjNTEwMzQ2NTM4ZTJkODU4YTcyIiwiaWF0IjoxNzE0MDM3MDQ4fQ.zhaM6JNFaVIWN2smCdRzPHviMEO8IFMklO9Vl2S8G5s';

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        formData,
        {
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
        }
      );
      const finalURL = `${subdomain}/ipfs/${response.data.IpfsHash}`;
      console.log('Final URL:', finalURL);
      return finalURL;
    } catch (error) {
      console.error('Error submitting form data:', error.response.data);
    }
  };

  const createGameNft = async (accessId, finalURL, formInputPrice) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    console.log('connection: ', connection);
    const provider = new ethers.BrowserProvider(connection);
    const signer = await provider.getSigner();
    console.log(typeof formInputPrice);
    const price = ethers.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);

    setIsTransactionInProgress(true);

    try {
      // const transaction = await contract.publishNFT(accessId, +parseInt(price), finalURL);
      const transaction = await contract.publishNFT(accessId, price, finalURL);
      console.log('transaction', transaction);

      // setIsLoadingNFT(true);
      await transaction.wait();
      setIsTransactionInProgress(false); // Clear flag when transaction is confirmed
      window.location.reload();
    } catch (error) {
      console.error('Error creating Game NFT:', error);
      setIsTransactionInProgress(false);
    }
  };

  const buyNftWithaccessID = async (accessId, priceInEther) => {
    setIsTransactionInProgress(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(connection);
    const signer = await provider.getSigner();
    const contract = fetchContract(signer);

    try {
      if (hasBoughtNFT(accessId)) {
        throw new Error(
          "Error: You can't buy this NFT because you already own it."
        );
      }

      const transaction = await contract.buyNFT(accessId, {
        value: priceInEther,
      });

      // setIsLoadingNFT(true);
      await transaction.wait();
      setIsTransactionInProgress(false);
      window.location.reload();
      // setIsLoadingNFT(false);
      console.log('NFT bought successfully');

      setBoughtNFTs(prevBoughtNFTs => {
        const updatedBoughtNFTs = [...prevBoughtNFTs, accessId];
        console.log('Updated boughtNFTs:', updatedBoughtNFTs);
        return updatedBoughtNFTs;
      });
    } catch (error) {
      console.error('Error buying NFT:', error);
      setIsTransactionInProgress(false);
      // setIsLoadingNFT(false);
      throw error;
    }
  };

  const fetchMyBoughtNFTs = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const contract = fetchContract(signer);

      // Get the current connected account
      const myAddress = await signer.getAddress();
      console.log('myAddress: ', myAddress);

      // Check if myAddress is a string
      if (typeof myAddress !== 'string') {
        console.error('Invalid address format.');
        return [];
      }

      // Fetch bought NFTs for the connected account
      const boughtNFTs = await contract.fetchMyBoughtNFTs();
      // const boughtNFTs = [];
      console.log('fetchMyBoughtNFTs', boughtNFTs);

      // Initialize an array to store fetched NFTs
      const myBoughtNFTs = [];

      // Iterate over each bought NFT
      for (let i = 0; i < boughtNFTs.length; i++) {
        const nft = boughtNFTs[i];
        const owner = nft[0];
        const sellingPrice = nft[1];
        const seller = nft[2];
        const tokenId = nft[3];
        const accessId = nft[4];

        // Fetch additional metadata for the bought NFT
        // const accessIdlist = await contract.getaccessIdslist();
        // console.log('accessIdlist', accessIdlist);

        const GametokenURI = await contract.getTokenURI(accessId, tokenId);
        console.log('GametokenURI', GametokenURI);

        const response = await axios.get(GametokenURI);
        const { data } = response;
        console.log('NFT metadata:', data);

        const { name, fileURL, imageURL, description, price } = data;

        // Construct the bought NFT object with metadata
        myBoughtNFTs.push({
          owner,
          sellingPrice,
          seller,
          tokenId,
          name,
          fileURL,
          imageURL,
          description,
          price,
          accessId,
          GametokenURI,
        });
      }

      return myBoughtNFTs;
    } catch (error) {
      console.error('Error fetching bought NFTs:', error);
      return [];
    }
  };

  const fetchGameNFTs = async () => {
    setIsLoadingNFT(true);

    try {
      const provider = new ethers.JsonRpcProvider(
        'https://dchaintestnet-2713017997578000-1.jsonrpc.testnet.sagarpc.io'
      );

      const contract = fetchContract(provider);

      // Fetch last NFTs
      const lastNFTs = await contract.fetchLastNFTs();
      // const lastNFTs = {};
      console.log('fetchGameItems data:', lastNFTs);

      // Set to keep track of fetched combinations of accessId and tokenId
      const fetchedCombinations = new Set();

      // Array to store fetched NFTs
      const nfts = [];

      // Get the list of accessIds for this tokenId
      const accessIdlist = await contract.getaccessIdslist();
      console.log('accessIdlist', accessIdlist);

      // Iterate over each fetched NFT
      for (let i = 0; i < lastNFTs.length; i++) {
        const nftProxy = lastNFTs[i];
        const owner = nftProxy[0];
        const sellingPrice = nftProxy[1];
        const seller = nftProxy[2];
        const tokenId = nftProxy[3];
        const accessId = nftProxy[4];
        const GametokenURI = await contract.getTokenURI(accessId, tokenId);
        console.log('GametokenURI', GametokenURI);

        const response = await axios.get(GametokenURI);
        const { data } = response;
        console.log('NFT metadata:', data);

        const { name, fileURL, imageURL, description, price } = data;

        nfts.push({
          owner,
          sellingPrice,
          seller,
          tokenId,
          name,
          fileURL,
          imageURL,
          description,
          price,
          accessId,
          GametokenURI,
        });
      }
      console.log('fetchedCombinations', fetchedCombinations);
      console.log('nfts', nfts);

      setIsLoadingNFT(false);
      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setIsLoadingNFT(false);
      return [];
    }
  };

  const mergeNFTs = (gameNFTs, myBoughtNFTs) => {
    // Create a set of bought tokenIds for fast lookup
    const boughtTokenIds = new Set(myBoughtNFTs.map(nft => nft.accessId));
    console.log('boughtTokenIds', boughtTokenIds);

    // Merge the arrays of NFTs
    const mergedNFTs = gameNFTs.map(nft => ({
      ...nft,
      isBought: boughtTokenIds.has(nft.accessId), // Check if the tokenId is in the set
    }));

    return mergedNFTs;
  };
  const testing = async () => {
    const gameNFTs = await fetchGameNFTs();
    console.log('gameNFTs', gameNFTs);
    const myBoughtNFTs = await fetchMyBoughtNFTs();
    console.log('myBoughtNFTs', myBoughtNFTs);
    const mergedNFTs = mergeNFTs(gameNFTs, myBoughtNFTs);
    console.log('mergedNFTs', mergedNFTs);
    return mergedNFTs;
  };

  return (
    <GameContext.Provider
      value={{
        nftCurrency,
        isLoadingNFT,
        boughtNFTs,
        hasBoughtNFT,
        isTransactionInProgress,
        handleImageUpload,
        handleFileUpload,
        handleSubmit,
        createGameNft,
        buyNftWithaccessID,
        fetchMyBoughtNFTs,
        fetchGameNFTs,
        generateAccessId,
        testing,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
