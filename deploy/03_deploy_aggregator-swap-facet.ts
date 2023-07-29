import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from "hardhat"
import { DeployFunction } from 'hardhat-deploy/types';
import { DiamondCutFacet } from "../typechain-types/contracts/facets/DiamondCutFacet"
import { AggregatorSwapFacet } from "../typechain-types/contracts/facets/AggregatorSwapFacet"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { errors } = ethers
  const { getNamedAccounts, deployments, run } = hre
  const { deploy, get, log } = deployments
  const { deployer, } = await getNamedAccounts()

  const diamondDeployment = await get('AkkaDiamond')

  const aggregatorSwapFacet = await deploy('AggregatorSwapFacet', {
    from: deployer,
    log: true,
  })
  const AggregatorSwapFacet = await ethers.getContractAt<AggregatorSwapFacet>("AggregatorSwapFacet", aggregatorSwapFacet.address)
  const aggregatorSwapFacetSelectors = Object.keys(AggregatorSwapFacet.interface.functions).map(selector => AggregatorSwapFacet.interface.getSighash(selector))
  log({ aggregatorSwapFacetSelectors })

  const DiamondCutFacet = await ethers.getContractAt<DiamondCutFacet>("DiamondCutFacet", diamondDeployment.address)

  try {
    const diamondCutTx = await DiamondCutFacet.diamondCut(
      [
        {
          action: 0,
          facetAddress: aggregatorSwapFacet.address,
          functionSelectors: aggregatorSwapFacetSelectors
        },
      ],
      ethers.constants.AddressZero,
      ethers.constants.HashZero,
    )
    log('diamondCutTx for AggregatorSwapFacet:', diamondCutTx.hash)
  } catch (_e: any) {
    log("Failed to call diamondCut:", _e.reason)

  }
};
func.tags = ["DeployAggregatorSwapFacet"]
export default func;