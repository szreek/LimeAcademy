const { ethers } = require("ethers");
const Library = require('../artifacts/contracts/Library.sol/Library.json')

const run = async function() {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")


    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const balance = await wallet.getBalance();
    console.log(ethers.utils.formatEther(balance, 18))

    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
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