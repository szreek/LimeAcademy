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

  })

})