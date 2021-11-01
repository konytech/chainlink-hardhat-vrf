import type { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types';
import { task } from "hardhat/config";

task("request-random-number", "Requests a random number for a Chainlink VRF enabled smart contract")
    .addParam("contract", "The address of the API Consumer contract that you want to call")
    .setAction(async (taskArgs:TaskArguments, hre:HardhatRuntimeEnvironment) => {

        const contractAddr = taskArgs.contract
        const networkId = hre.network.name
        console.log("Requesting a random number using VRF consumer contract ", contractAddr, " on network ", networkId)
        const RandomNumberConsumer = await hre.ethers.getContractFactory("RandomNumberConsumer")

        //Get signer information
        const accounts = await hre.ethers.getSigners()
        const signer = accounts[0]

        //Create connection to VRF Contract and call the getRandomNumber function
        const vrfConsumerContract = new hre.ethers.Contract(contractAddr, RandomNumberConsumer.interface, signer)
        var result = await vrfConsumerContract.getRandomNumber()
        console.log('Contract ', contractAddr, ' random number request successfully called. Transaction Hash: ', result.hash)
        console.log("Run the following to read the returned random number:")
        console.log("npx hardhat read-random-number --contract " + contractAddr + " --network " + hre.network.name)
    })

module.exports = {}
