import { deployments, ethers, getNamedAccounts } from "hardhat"
import { DiamondCutFacet } from "../../typechain-types/contracts/facets/DiamondCutFacet"
import { ProtocolManagerFacet } from "../../typechain-types/contracts/facets/ProtocolManagerFacet"
import DexIds from "../../constants/confg/DexIds.json"
async function main() {
    const { get } = deployments;
    const akkaDiamondDeployment = await get("AkkaDiamond");
    const diamondCutFacetDeployment = await get("DiamondCutFacet");
    const protocolManagerFacetDeployment = await get("ProtocolManagerFacet");

    const { deployer, } = await getNamedAccounts()
    console.log(Object.keys(DexIds));
    


    const diamondCutFacet = await ethers.getContract<DiamondCutFacet>("DiamondCutFacet", akkaDiamondDeployment.address);
    const ProtocolManagerFacet = await ethers.getContract<ProtocolManagerFacet>("ProtocolManagerFacet", akkaDiamondDeployment.address);
    const protocolManagerFacetSelectors = Object.keys(ProtocolManagerFacet.interface.functions).map(selector => ProtocolManagerFacet.interface.getSighash(selector))
    console.log(protocolManagerFacetSelectors);
    // diamondCutFacet.diamondCut(
    //     [
    //         {
    //             action: 2,
    //             facetAddress: ethers.constants.AddressZero,
    //             functionSelectors: [
    //                 "0x66a99aca",
    //                 "0x652f7139",
    //                 "0x920c4304",
    //             ]
    //         },
    //         // {
    //         //     action: 1,
    //         //     facetAddress: protocolManagerFacetDeployment.address,
    //         //     functionSelectors: [
    //         //         "0x920c4304"
    //         //     ]
    //         // },
    //         {
    //             action: 0,
    //             facetAddress: protocolManagerFacetDeployment.address,
    //             functionSelectors: protocolManagerFacetSelectors
    //         }
    //     ],
    //     protocolManagerFacetDeployment.address,
    //     ProtocolManagerFacet.interface.encodeFunctionData("addDexsBatch",[],[]),
    // )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
