import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from "hardhat"
import { DeployFunction } from 'hardhat-deploy/types';
import { DiamondCutFacet } from "../typechain-types/contracts/facets/DiamondCutFacet";
import { DiamondLoupeFacet } from "../typechain-types/contracts/facets/DiamondLoupeFacet";
import { OwnershipFacet } from "../typechain-types/contracts/facets/OwnershipFacet";
import { DiamondInit } from "../typechain-types/contracts/upgradeInitializers/DiamondInit";
import { IDiamondCut } from "../typechain-types/contracts/interfaces/IDiamondCut";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, run } = hre
  const { deploy, execute, log } = deployments
  const { deployer, } = await getNamedAccounts()

  const diamondCutFacet = await deploy('DiamondCutFacet', {
    from: deployer,
    log: true,
  })
  const DiamondCutFacet = await ethers.getContractAt<DiamondCutFacet>("DiamondCutFacet", diamondCutFacet.address)
  const diamondCutFacetSelectors = Object.keys(DiamondCutFacet.interface.functions).map(selector => DiamondCutFacet.interface.getSighash(selector))


  const diamondLoupeFacet = await deploy('DiamondLoupeFacet', {
    from: deployer,
    log: true,
  })
  const DiamondLoupeFacet = await ethers.getContractAt<DiamondLoupeFacet>("DiamondLoupeFacet", diamondLoupeFacet.address)
  const diamondLoupeFacetSelectors = Object.keys(DiamondLoupeFacet.interface.functions).map(selector => DiamondLoupeFacet.interface.getSighash(selector))

  const diamondInit = await deploy('DiamondInit', {
    from: deployer,
    log: true,
  })
  const DiamondInitInitializer = await ethers.getContractAt<DiamondInit>("DiamondInit", diamondLoupeFacet.address)


  const ownershipFacet = await deploy('OwnershipFacet', {
    from: deployer,
    log: true,
  })


  const OwnershipFacet = await ethers.getContractAt<OwnershipFacet>("OwnershipFacet", ownershipFacet.address)
  const ownershipFacetSelectors = Object.keys(OwnershipFacet.interface.functions).map(selector => OwnershipFacet.interface.getSighash(selector))

  try {
    const Diamond = await deploy('Diamond', {
      from: deployer,
      args: [
        [
          {
            action: 0,
            facetAddress: diamondCutFacet.address,
            functionSelectors: diamondCutFacetSelectors
          },
          {
            action: 0,
            facetAddress: diamondLoupeFacet.address,
            functionSelectors: diamondLoupeFacetSelectors
          },
          {
            action: 0,
            facetAddress: ownershipFacet.address,
            functionSelectors: ownershipFacetSelectors
          }
        ],
        diamondInit.address,
        DiamondInitInitializer.interface.encodeFunctionData('init')
      ] as Parameters<IDiamondCut['diamondCut']>,
      log: true,
    })
  } catch (e: any) {
    log("Failed to call Diamond constructor:", e.reason)

  }


};

func.tags = ["DiamondFirst"]
export default func;