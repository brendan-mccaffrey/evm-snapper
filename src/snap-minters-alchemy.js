// importing the Alchemy SDK
const { Alchemy, Network } = require("alchemy-sdk");
const fs = require("fs");

// configuring the Alchemy SDK
const config = {
    apiKey: "API_KEY_HERE", // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with the network your NFT contract is deployed to.
  };
const alchemy = new Alchemy(config);

// This is the address of the NFT Contract
const nftAddress = "CONTRACT_ADDRESS_HERE"; // Replace with your NFT contract address.

// Creating an empty array to store the minters of the NFT Collection
let minters = [];

let pageKey; // Variable for pageKey that will be used to paginate through the API call.

// function to get all the minters of the NFT Collection
async function getMinters() {
  // Boolean variable to check if it is the first call to the API call.
  // We need this because the first time we make the API call, the pageKey will be undefined.
  let firstCall = true;

  // Looping through the API call until the pageKey is not null/undefined.
  while (firstCall || pageKey) {
    let res;
    if (pageKey) {
      // Making a call to the getAssetTransfers method to get all the transfers in which the `fromAddress` is 0x0000000000000000000000000000000000000000
  		// If the `fromAddress` is 0x0000000000000000000000000000000000000000, it means that the NFT was minted to the `toAddress` in the transfer.
      res = await alchemy.core.getAssetTransfers({
        fromAddress: "0x0000000000000000000000000000000000000000",
        category: ["erc721"], // Replace with the category of your NFT contract. BAYC is an ERC721 token.
        contractAddresses: [nftAddress], // Replace with the address of your NFT contract.
        pageKey: pageKey, // The pageKey is used to paginate through the API call.
      });
    } else {
      // Making a call to the getAssetTransfers method to get all the transfers in which the `fromAddress` is 0x0000000000000000000000000000000000000000
 		 // If the `fromAddress` is 0x0000000000000000000000000000000000000000, it means that the NFT was minted to the `toAddress` in the transfer.
      res = await alchemy.core.getAssetTransfers({
        fromAddress: "0x0000000000000000000000000000000000000000",
        category: ["erc721"], // Replace with the category of your NFT contract. BAYC is an ERC721 token.
        contractAddresses: [nftAddress], // Replace with the address of your NFT contract.
      });
    }

    firstCall = false; // Setting the `firstCall` variable to false, because it is not the first call anymore.

    // The API call returns an object with a `transfers` key, which is an array of all the transfers.

    // Looping through the response of the API call, that is, the transfers and pushing the `to` address to the `minters` array.
    // Because the `to` is the address that minted the NFT.
    for (let i = 0; i < res.transfers.length; i++) {
      const transfer = res.transfers[i];
      minters.push(transfer.to); // adding the `to` address to the `minters` array.
    }

    pageKey = res.pageKey; // Setting the pageKey from the response of the API call.
  }

  let filename = "data/snapshot.json";
  fs.writeFileSync(filename, JSON.stringify(minters, null, 2));

  unique = [...new Set(minters)]; // Removing the duplicate addresses from the `minters` array. This is done because the API call returns the same `to` address multiple times if an address minted multiple NFTs.
  console.log("Number of unique minters:", unique.length);
  let filename_unique = "data/snapshot-unique.json";
  fs.writeFileSync(filename_unique, JSON.stringify(unique, null, 2));
}

async function main() {
  await getMinters(); // Calling the `getMinters` function.
}

main();