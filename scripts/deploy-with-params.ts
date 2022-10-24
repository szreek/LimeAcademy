import { ethers } from "hardhat";
import hre from 'hardhat';


async function deployLibrary(_privateKey: any) {
  await hre.run('compile');
  const [deployer] = await ethers.getSigners();

  const wallet = new ethers.Wallet(_privateKey, hre.ethers.provider) // New wallet with the privateKey passed from CLI as param

  console.log('Deploying contracts with the account:', wallet.address); // We are printing the address of the deployer
  console.log('Account balance:', (await wallet.getBalance()).toString()); // We are printing the account balance


  console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
  console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

  const Library = await ethers.getContractFactory("Library", wallet);
  const library = await Library.deploy();
  await library.deployed();
  console.log("Library deployed to:", library.address);
  await hre.run('print', { message: "Done!" })
}

module.exports = deployLibrary;