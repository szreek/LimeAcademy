const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe('Library', () => {
  let library
  const libraryName = 'Poznan City Library'

  async function deployLibraryFixture() {
        const [deployer, otherAccount] = await ethers.getSigners();
        const Library = await ethers.getContractFactory('Library')
        library = await Library.deploy('Poznan City Library')
        await library.deployed();
        return { library, deployer, otherAccount};
  }

  describe('Deployment', async () => {
    it('sets the name of the Library', async () => {
      const { library } = await loadFixture(deployLibraryFixture);
      expect(await library.libraryName()).to.equal('Poznan City Library')
    })

  })

  describe('Library', () => {
    
    it('reads the books from the "getListOfBooks()" function', async () => {
      const { library } = await loadFixture(deployLibraryFixture);
      expect(await library.getListOfBooks()).to.have.all.members([])
    })

    it('adds book position with the usage of "addBook()" function', async () => {
      const { library } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10");
      let idExpected = await library.callStatic.addBook(bookTitle, nrCopies); // in order to obtain id from a function that is not view nor pure hack like this. 
      await library.addBook(bookTitle, nrCopies) // above static call does not change state of the contract that is why we need also the non static invocation of addBook method
      const insertedBook = [idExpected, nrCopies, bookTitle]

      expect(await library.idToBook(idExpected)).to.have.deep.members(insertedBook)
    })

    it('should fail on attempt of adding book no by Other account with "addBook()" method ', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10");
      await expect(library.connect(otherAccount).addBook(bookTitle, nrCopies)).to.be.revertedWith("Ownable: caller is not the owner");
    })

    it('should fail on attempt of adding book thats in library already with "addBook()" method  ', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      library.connect(deployer).addBook(bookTitle, nrCopies)
      await expect(library.connect(deployer).addBook(bookTitle, nrCopies)).to.be.revertedWith("Book already added to Library");
    })

    it('should fail on attempt of borrowing book "borrowBook()"  thats in library that is not added', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      await expect(library.connect(deployer).borrowBook(bookTitle)).to.be.revertedWith("This Book is not available at the moment");
    })

    it('should be able to borrow book "borrowBook()" that is in the library', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      let idExpected = await library.callStatic.addBook(bookTitle, nrCopies); // in order to obtain id from a function that is not view nor pure hack like this. 
      await library.connect(deployer).addBook(bookTitle, nrCopies)
      await library.connect(otherAccount).borrowBook(bookTitle)
      expect(await library.connect(otherAccount).borrowerToBookId(otherAccount.address)).to.equal(idExpected)
    })

    it('should number of copies decrease when book has been borrowed', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      let idExpected = await library.callStatic.addBook(bookTitle, nrCopies); // in order to obtain id from a function that is not view nor pure hack like this. 
      await library.connect(deployer).addBook(bookTitle, nrCopies)
      await library.connect(otherAccount).borrowBook(bookTitle)
      expect(await library.connect(otherAccount).idToNumberLeft(idExpected)).to.equal(nrCopies - 1)
    })

    it('should be able to return borrowed book "returnBook()"', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      await library.connect(deployer).addBook(bookTitle, nrCopies)
      await library.connect(otherAccount).borrowBook(bookTitle)
      await library.connect(otherAccount).returnBook(bookTitle)
      expect(await library.connect(otherAccount).borrowerToBookId(otherAccount.address)).to.equal(0)
    })

    it('should number of copies increase when book has been returned', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      let idExpected = await library.callStatic.addBook(bookTitle, nrCopies); // in order to obtain id from a function that is not view nor pure hack like this. 
      await library.connect(deployer).addBook(bookTitle, nrCopies)
      await library.connect(otherAccount).borrowBook(bookTitle)
      await library.connect(otherAccount).returnBook(bookTitle)
      expect(await library.connect(otherAccount).idToNumberLeft(idExpected)).to.equal(nrCopies)
    })

    it('user should not borrow the same book twice', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      await library.connect(deployer).addBook(bookTitle, nrCopies)
      await library.connect(deployer).borrowBook(bookTitle)
      await expect(library.connect(deployer).borrowBook(bookTitle)).to.be.revertedWith("The user has already borrowed a book, only 1 book can be borrowed at a time by the given user");
    })

    it('user should not borrow different book because only one per user can be borrowed at a time', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      let bookTitle2 = 'Little Prince'
      let nrCopies2 = ethers.BigNumber.from("10")
      await library.connect(deployer).addBook(bookTitle, nrCopies)
      await library.connect(deployer).addBook(bookTitle2, nrCopies2)
      await library.connect(deployer).borrowBook(bookTitle)
      await expect(library.connect(deployer).borrowBook(bookTitle2)).to.be.revertedWith("The user has already borrowed a book, only 1 book can be borrowed at a time by the given user");
    })

    it('user should not return the same book twice', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      await library.connect(deployer).addBook(bookTitle, nrCopies)
      await library.connect(deployer).borrowBook(bookTitle)
      await library.connect(deployer).returnBook(bookTitle)
      await expect(library.connect(deployer).returnBook(bookTitle)).to.be.revertedWith("This book is currently not borrowed by this user");
    })

    it('user should not return if borrowed other book', async () => {
      const { library, deployer, otherAccount } = await loadFixture(deployLibraryFixture);
      let bookTitle = 'Green Mile'
      let nrCopies = ethers.BigNumber.from("10")
      await library.connect(deployer).addBook(bookTitle, nrCopies)
      let bookTitle2 = 'Little Prince'
      let nrCopies2 = ethers.BigNumber.from("10")
      await library.connect(deployer).addBook(bookTitle2, nrCopies2)

      await library.connect(deployer).borrowBook(bookTitle)
      await expect(library.connect(deployer).returnBook(bookTitle2)).to.be.revertedWith("This book is currently not borrowed by this user");
    })

  })

})