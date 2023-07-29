import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from "hardhat"
import { DeployFunction } from 'hardhat-deploy/types';
import { DiamondCutFacet } from "../typechain-types/contracts/facets/DiamondCutFacet";
import { ProtocolManagerFacet } from "../typechain-types/contracts/facets/ProtocolManagerFacet";
import { DiamondInit } from "../typechain-types/contracts/upgradeInitializers/DiamondInit";
import { IDiamondCut } from "../typechain-types/contracts/interfaces/IDiamondCut";
import { Logger } from "@ethersproject/logger"
import DexIds from "../constants/confg/DexIds.json"
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { errors } = ethers
  const { getNamedAccounts, deployments, run } = hre
  const { deploy, get, log } = deployments
  const { deployer, } = await getNamedAccounts()

  const diamondDeployment = await get('AkkaDiamond')

  const protocolManagerFacetDeployment = await deploy('ProtocolManagerFacet', {
    from: deployer,
    log: true,
  })
  const ProtocolManagerFacet = await ethers.getContractAt<ProtocolManagerFacet>("ProtocolManagerFacet", diamondDeployment.address)
  const protocolManagerFacetSelectors = Object.keys(ProtocolManagerFacet.interface.functions).map(selector => ProtocolManagerFacet.interface.getSighash(selector))
  log({ protocolManagerFacetSelectors })
  log(Object.keys(DexIds))
  log(Object.values(DexIds))
  const DiamondCutFacet = await ethers.getContractAt<DiamondCutFacet>("DiamondCutFacet", diamondDeployment.address)
  try {
    const diamondCutTx = await DiamondCutFacet.diamondCut(
      [
        {
          action: 0,
          facetAddress: protocolManagerFacetDeployment.address,
          functionSelectors: protocolManagerFacetSelectors
        },
      ],
      ethers.constants.AddressZero,
      ethers.constants.HashZero,
    )
    // await diamondCutTx.wait(5)
    log('diamondCutTx for ProtocolManagerFacet:', diamondCutTx.hash)
  } catch (_e: any) {
    log("Failed to call diamondCut:", _e.reason)

  }
  try {
    const gasLimit = await ProtocolManagerFacet.estimateGas.addDex('1', "0xa9595e96")
    log(gasLimit)
    const addDexsBatchTx = await ProtocolManagerFacet.addDex(1, "0xa9595e96", { gasLimit })
    log('addDexsBatchTx for ProtocolManagerFacet:', addDexsBatchTx.hash)
  } catch (_e: any) {
    log("Failed to call addDexsBatchTx:", _e.reason)

  }
};

func.tags = ["DeployProtocolManagerFacet"]
export default func;