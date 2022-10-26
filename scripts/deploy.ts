import { ethers } from "hardhat";
import hre from 'hardhat';

async function deployLibrary(libraryName: any) {
  await hre.run('compile');
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
  console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

  const Library = await ethers.getContractFactory("Library");
  const library = await Library.deploy(libraryName);
  await library.deployed();

  console.log("Library name:", libraryName);
  console.log("Library deployed to:", library.address);
  await hre.run('print', { message: "Done!" })
}

module.exports = deployLibrary;
