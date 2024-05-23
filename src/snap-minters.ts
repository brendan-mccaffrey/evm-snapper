import { JsonRpcProvider, ethers } from "ethers";
import fs from "fs";
import path from "path";

import erc721Abi from "./erc721Abi.json";

type ChainConfig = {
    contractAddress: string;
    rpcUrl: string;
};

/////////////////////////////////////////////////////
// config

const config: Record<number, ChainConfig> = {
    [1]: {
        contractAddress: "CONTRACT_ADDRESS_HERE",
        rpcUrl: "RPC_URL_HERE",
    },
    [41337]: {
        contractAddress: "CONTRACT_ADDRESS_HERE",
        rpcUrl: "RPC_URL_HERE",
    },
    [10]: {
        contractAddress: "CONTRACT_ADDRESS_HERE",
        rpcUrl: "RPC_URL_HERE",
    },
    [56]: {
        contractAddress: "CONTRACT_ADDRESS_HERE",
        rpcUrl: "RPC_URL_HERE",
    },
    [43114]: {
        contractAddress: "CONTRACT_ADDRESS_HERE",
        rpcUrl: "RPC_URL_HERE",
    },
    [137]: {
        contractAddress: "CONTRACT_ADDRESS_HERE",
        rpcUrl: "RPC_URL_HERE",
    },
    [250]: {
        contractAddress: "CONTRACT_ADDRESS_HERE",
        rpcUrl: "RPC_URL_HERE",
    },
};

async function getMinters(contractAddress: string, rpcurl: string) {
    const provider = new JsonRpcProvider(rpcurl);
    const contract = new ethers.Contract(contractAddress, erc721Abi, provider);

    const minters: { [key: string]: string } = {};

    // need a small range of blocks, so loop if we want to query a wide range
    // note these params depend on the chain
    let currBlock = 50000; // start
    let step = 1000;
    let stop = 1000000; // end

    while (currBlock < stop) {
        currBlock += step;

        const transferEvents = await contract.queryFilter("Transfer", currBlock, currBlock + step);
        if (transferEvents.length === 0) continue;

        for (const event of transferEvents) {
            if (!("args" in event)) continue;

            const from = event.args.getValue("from");
            const to = event.args.getValue("to");
            const tokenId = event.args.getValue("tokenId").toString();
            // console.log("From:", from, "To:", to, "TokenId:", tokenId);

            if (from === "0x0000000000000000000000000000000000000000") {
                // this signifies a mint
                minters[tokenId] = to;
            }
        }
    }
    return minters;
}

async function main() {
    for (const key in config) {
        // get minters for chain
        console.log("Doing", key);
        const res = await getMinters(config[key].contractAddress, config[key].rpcUrl);
        let minters = Object.values(res);

        // write to json
        let filename = "../data/" + key + "-minters.json";
        fs.writeFileSync(filename, JSON.stringify(minters, null, 2));
        console.log("Minters for " + key + " saved to file");

        // calc and write unique to json
        let unique = [...new Set(minters)];
        let filename_unique = "../data/" + key + "-unique-minters.json";
        fs.writeFileSync(filename_unique, JSON.stringify(unique, null, 2));
        console.log("Unique minters for " + key + " saved to file");
        console.log("Number of unique minters:", unique.length);
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
