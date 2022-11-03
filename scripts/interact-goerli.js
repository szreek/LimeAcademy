const { ethers } = require("ethers");
const Library = require('../artifacts/contracts/Library.sol/Library.json')
require('dotenv').config({path: './process.env'});
const { PRIVATE_KEY, INFURA_API_KEY } = process.env;

const run = async function() {
    const provider = new ethers.providers.InfuraProvider("goerli", INFURA_API_KEY)

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const balance = await wallet.getBalance();
    console.log(ethers.utils.formatEther(balance, 18))

    const contractAddress = "0x82E0f4BF61f139A9BaDCe64D0AcFbA32cB0B5E63"
    const libraryContract = new ethers.Contract(contractAddress, Library.abi, wallet)

    const emptyCollection = await libraryContract.getListOfBooks();
    console.log(emptyCollection)

    let bookTitle = 'Green Mile'
    let nrCopies = ethers.BigNumber.from("10");
    let transaction =  await libraryContract.addBook(bookTitle, nrCopies)
    
    const transactionReceipt = await transaction.wait();
    if (transactionReceipt.status != 1) { // 1 means success
        console.log("Transaction was not successful")
        return 
    }

    let transactionBorrowing = await libraryContract.borrowBook(bookTitle)
    transactionBorrowing.wait();

    let BookId = await libraryContract.borrowerToBookId("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    console.log(ethers.BigNumber.from(BookId).toString())

    let transactionReturning = await libraryContract.returnBook(bookTitle)
    transactionReturning.wait();

    BookId = await libraryContract.borrowerToBookId("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    console.log(ethers.BigNumber.from(BookId).toString())
}
    
run()