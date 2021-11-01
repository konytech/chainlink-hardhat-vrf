import chai, { expect } from 'chai';
import BN from 'bn.js';
import { developmentChains } from '../../../helper-hardhat-config';
import { deployments, network, ethers } from 'hardhat';
import { RandomNumberConsumer } from '../../typechain';
import chainBN from "chai-bn";

const skipIf = require('mocha-skip-if')
chai.use(chainBN(BN))

skipIf.if(developmentChains.includes(network.name)).
  describe('RandomNumberConsumer Integration Tests', async function () {

    let randomNumberConsumer:RandomNumberConsumer;

    beforeEach(async () => {
      const RandomNumberConsumer = await deployments.get('RandomNumberConsumer')
      randomNumberConsumer = await ethers.getContractAt('RandomNumberConsumer', RandomNumberConsumer.address)
    })

    it('Should successfully make a VRF request and get a result', async () => {
      const transaction = await randomNumberConsumer.getRandomNumber()
      const tx_receipt = await transaction.wait()
      const requestId = tx_receipt.events![2].topics[1]

      //wait 60 secs for oracle to callback
      await new Promise(resolve => setTimeout(resolve, 60000))

      const result = await randomNumberConsumer.randomResult()
      console.log("VRF Result: ", ethers.BigNumber.from(result._hex).toString())
      expect(ethers.BigNumber.from(result._hex).toString()).to.be.a.bignumber.that.is.greaterThan(ethers.BigNumber.from(0).toString())
    })
  })
