import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from "hardhat"
import { DeployFunction } from 'hardhat-deploy/types';
import { DiamondCutFacet } from "../typechain-types/contracts/facets/DiamondCutFacet"
import { UniswapV2Facet } from "../typechain-types/contracts/facets/UniswapV2Facet"


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { errors } = ethers
  const { getNamedAccounts, deployments, run } = hre
  const { deploy, get, log } = deployments
  const { deployer, } = await getNamedAccounts()

  const diamondDeployment = await get('AkkaDiamond')

  const uniswapV2Facet = await deploy('UniswapV2Facet', {
    from: deployer,
    log: true,
  })
  const UniswapV2Facet = await ethers.getContractAt<UniswapV2Facet>("UniswapV2Facet", uniswapV2Facet.address)
  const uniswapV2FacetSelectors = Object.keys(UniswapV2Facet.interface.functions).map(selector => UniswapV2Facet.interface.getSighash(selector))
  log({uniswapV2FacetSelectors})
  const DiamondCutFacet = await ethers.getContractAt<DiamondCutFacet>("DiamondCutFacet", diamondDeployment.address)

  try {
    const diamondCutTx = await DiamondCutFacet.diamondCut(
      [
        {
          action: 0,
          facetAddress: uniswapV2Facet.address,
          functionSelectors: uniswapV2FacetSelectors
        },
      ],
      ethers.constants.AddressZero,
      ethers.constants.HashZero,
    )
    log('diamondCutTx for UniswapV2Facet:', diamondCutTx.hash)
  } catch (_e: any) {
    log("Failed to call diamondCut:", _e.reason)

  }
};
func.tags = ["DeployUniswapV2Facet"]
export default func;