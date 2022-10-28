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
      let idExpected = ethers.BigNumber.from("76275329");
      await library.addBook(bookTitle, nrCopies)
      const insertedBook = [idExpected, nrCopies, bookTitle]

      let books = await library.getListOfBooks()
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
      let nrCopies = ethers.BigNumber.from("10")
      await expect(library.connect(deployer).borrowBook(bookTitle)).to.be.revertedWith("This Book is not available at the moment");
    })
  })

})