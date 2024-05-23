import { JsonRpcProvider, ethers } from "ethers";
import fs from "fs";
import path from "path";
import erc721Abi from "./erc721Abi.json";

type ChainConfig = {
    contractAddress: string;
    rpcUrl: string;
};

let tokenIdsChecked: Record<number, true> = {};
let tokenHolders: Record<string, number> = {};

/////////////////////////////////////////////////////
// config

// TODO what is the total supply?
const totalSupply = 10000;
const outputFile = path.resolve(__dirname, "../snapshot.json");

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

/////////////////////////////////////////////////////
// helpers

// flag true if running from a checkpoint
const useExistingFile = false;
if (useExistingFile) {
    const initialData = fs.readFileSync(outputFile, "utf-8");
    const data = JSON.parse(initialData);
    tokenIdsChecked = data.tokenIdsChecked || {};
    tokenHolders = data.tokenHolders || {};
    console.log("Length:", tokenHolders.length);
}

function getProviderForChain(chainId: number): JsonRpcProvider {
    if (!config[chainId]) throw new Error(`chainId ${chainId} is not valid`);
    return new JsonRpcProvider(config[chainId].rpcUrl);
}

function sanityCheck() {
    let totalCounted = 0;
    for (const key in tokenHolders) {
        totalCounted += tokenHolders[key];
    }
    if (totalCounted != totalSupply) {
        console.log(`Warning! Counted ${totalCounted} but should be a total supply of ${totalSupply}`);
    }
}

async function getCount() {
    const initialData = fs.readFileSync("example.json", "utf-8");
    const data = JSON.parse(initialData);
    tokenIdsChecked = data.tokenIdsChecked || {};
    tokenHolders = data.tokenHolders || {};
    console.log("Length:", tokenHolders.length);
}

/////////////////////////////////////////////////////
// logic

// run and query the contract for the token holders at specified block number
async function addTokenHoldersForChain(chainId: number, blockNumber: number): Promise<void> {
    const provider = getProviderForChain(chainId);
    const tokenContract = new ethers.Contract(config[chainId].contractAddress, erc721Abi, provider);

    for (let i = 0; i < totalSupply; i++) {
        if (tokenIdsChecked[i]) continue;
        console.log(" > ID:", i);

        try {
            const owner = (await tokenContract.ownerOf(i, { blockTag: blockNumber })).toLowerCase();
            // const owner = (await tokenContract.ownerOf(i)).toLowerCase(); // this for latest block

            tokenIdsChecked[i] = true;
            if (!tokenHolders[owner]) {
                tokenHolders[owner] = 1;
            } else {
                tokenHolders[owner] += 1;
            }
        } catch (e: any) {
            if (e?.shortMessage === "missing revert data") {
                console.log(`Error on chain id ${chainId}`);
                console.error({ e });
            }
        }
    }
}

async function start() {
    let blockNum = 99999;

    for (const key in config) {
        console.log(`Checking chain ${key}`);

        await addTokenHoldersForChain(parseInt(key), blockNum);
        const snapshot = JSON.stringify({ tokenHolders, tokenIdsChecked });

        let checkfile = key + ".json";
        fs.writeFileSync(checkfile, snapshot);
    }

    sanityCheck();
    const snapshot = JSON.stringify({ tokenHolders, tokenIdsChecked });

    fs.writeFileSync(outputFile, snapshot);
}

start()
    .then(() => console.log(`Success! Wrote output to ${outputFile}`))
    .catch(e => {
        console.error("Error!");
        console.error({ e });
    });
