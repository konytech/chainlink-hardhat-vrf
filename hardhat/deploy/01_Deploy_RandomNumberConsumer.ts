import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { networkConfig } from '../../helper-hardhat-config';

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId
}: HardhatRuntimeEnvironment) => {

    const { deploy, get, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId() as keyof typeof networkConfig
    let linkTokenAddress:string
    let vrfCoordinatorAddress:string
    let additionalMessage = ""

    if (+chainId == 31337) {
        let linkToken = await get('LinkToken')
        let VRFCoordinatorMock = await get('VRFCoordinatorMock')
        linkTokenAddress = linkToken.address
        vrfCoordinatorAddress = VRFCoordinatorMock.address
        additionalMessage = " --linkaddress " + linkTokenAddress
    } else {
        linkTokenAddress = networkConfig[chainId]['linkToken']
        vrfCoordinatorAddress = networkConfig[chainId]['vrfCoordinator']
    }
    const keyHash:string = networkConfig[chainId]['keyHash']
    const fee:string = networkConfig[chainId]['fee']

    const randomNumberConsumer = await deploy('RandomNumberConsumer', {
        from: deployer,
        args: [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee],
        log: true
    })

    log("Run the following command to fund contract with LINK:")
    log("npx hardhat fund-link --contract " + randomNumberConsumer.address + " --network " + networkConfig[chainId]['name'] + additionalMessage)
    log("Then run RandomNumberConsumer contract with the following command")
    log("npx hardhat request-random-number --contract " + randomNumberConsumer.address + " --network " + networkConfig[chainId]['name'])
    log("----------------------------------------------------")
}

module.exports.tags = ['all', 'vrf']
