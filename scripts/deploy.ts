import { ethers } from "hardhat";

async function main() {

  const Akka = await ethers.getContractFactory("Akka");
  const akka = await Akka.deploy();

  await akka.deployed();

  console.log(`Akka deployed to ${akka.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
