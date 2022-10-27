const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe('Library', () => {
  let library
  const libraryName = 'Poznan City Library'

  async function deployLibraryFixture() {
        const Library = await ethers.getContractFactory('Library')
        library = await Library.deploy('Poznan City Library')
        await library.deployed();
        return { Library, library};
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
      console.log("a", books)
      expect(await library.idToBook(idExpected)).to.have.deep.members(insertedBook)
    })

  })

})