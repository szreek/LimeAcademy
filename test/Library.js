const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Library', () => {
  let library
  const libraryName = 'Poznan City Library'

  beforeEach(async () => {
    // Load contract
    const Library = await ethers.getContractFactory('Library')

    // Deploy contract
    library = await Library.deploy('Poznan City Library')
  })

  describe('Deployment', () => {

    it('sets the name of the Library', async () => {
      expect(await library.libraryName()).to.equal('Poznan City Library')
    })

  })

  describe('Library', () => {
    
    it('reads the books from the "getListOfBooks()" function', async () => {
      expect(await library.getListOfBooks()).to.have.all.members([])
    })

    it('adds book position with the usage of "addBook()" function', async () => {
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