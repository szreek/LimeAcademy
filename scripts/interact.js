const { ethers } = require("ethers");
const Library = require('../artifacts/contracts/Library.sol/Library.json')
require('dotenv').config({path: './process.env'});
const { PRIVATE_KEY_LOCAL, PUBLIC_KEY_LOCAL, LIBRARY_CONTRACT_ADDRESS_LOCAL } = process.env;



//REMEMBER to start localhost node not hardhat node, and deploy the contract, then update LIBRARY_CONTRACT_ADDRESS in .env :)
const run = async function() {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")


    const wallet = new ethers.Wallet(PRIVATE_KEY_LOCAL, provider);
    const balance = await wallet.getBalance();
    console.log(ethers.utils.formatEther(balance, 18))

    const libraryContract = new ethers.Contract(LIBRARY_CONTRACT_ADDRESS_LOCAL, Library.abi, wallet)

    const emptyCollection = await libraryContract.getListOfBooks();
    console.log(emptyCollection)

    let bookTitle = 'Green Mile'
    let nrCopies = ethers.BigNumber.from(10);
    let idExpected = await libraryContract.callStatic.addBook(bookTitle, nrCopies);
    console.log(ethers.BigNumber.from(idExpected).toString())
    let transaction =  await libraryContract.addBook(bookTitle, nrCopies)
    
    const transactionReceipt = await transaction.wait();
    if (transactionReceipt.status != 1) { // 1 means success
        console.log("Transaction was not successful")
        return 
    }

    let transactionBorrowing = await libraryContract.borrowBook(bookTitle)
    transactionBorrowing.wait();

    let BookId = await libraryContract.borrowerToBookId(PUBLIC_KEY_LOCAL);
    console.log(ethers.BigNumber.from(BookId).toString())

    let copiesLeft = await libraryContract.idToNumberLeft(BookId)
    console.log(ethers.BigNumber.from(copiesLeft).toString())


    let transactionReturning = await libraryContract.returnBook(bookTitle)
    transactionReturning.wait();

    copiesLeft = await libraryContract.idToNumberLeft(BookId)
    console.log(ethers.BigNumber.from(copiesLeft).toString())

    BookId = await libraryContract.borrowerToBookId(PUBLIC_KEY_LOCAL);
    console.log(ethers.BigNumber.from(BookId).toString())
}
    
run()