// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;
import "@openzeppelin/contracts/access/Ownable.sol";

// currently deployed to 0x243d54B9BE0c63d374fE3c9CB68be7312A7E3F56
contract Library is Ownable {

    string public libraryName;
    Book[] public books;
    address[] public borrowers;

    mapping (uint => Book) public idToBook;
    mapping (uint => uint) public idToNumberLeft;

    struct Book {
        uint id;
        uint copiesCount;
        string tittle;
    }

    constructor(string memory _libraryName) {
        libraryName = _libraryName;
    }

    modifier onlyIfBookAvailable(string memory _tittle) {
        uint _bookId = _generateID(_tittle);
        require(idToNumberLeft[_bookId] > 0, "This Book is not available at the moment");
        _;
    }

    modifier onlyIfNotAddedALready(string memory _tittle) {
        uint _bookId = _generateID(_tittle);
        require(keccak256( abi.encode(idToBook[_bookId].tittle)) != keccak256(abi.encode(_tittle)), "Book already added to Library"); 
        _;
    }

    modifier OnlyIfReturnable(uint _bookId) {
        require(idToNumberLeft[_bookId] < idToBook[_bookId].copiesCount, "All copies already returned");
        _;
    }

    function addBook(string memory _tittle, uint _copiesCount) public onlyOwner onlyIfNotAddedALready(_tittle) returns(uint _id){
        uint _bookId = _generateID(_tittle);
        books.push(Book(_bookId, _copiesCount, _tittle));
        uint index = books.length - 1;
        Book storage a = books[index];
        idToBook[_bookId] = a; 
        idToNumberLeft[_bookId] = a.copiesCount;
        return _bookId; 
    }

    function getListOfBooks() external view returns(Book[] memory) {
        return books;
    }

    function borrowBook(string memory _tittle) external onlyIfBookAvailable(_tittle) {
        uint _bookId = _generateID(_tittle);
        idToNumberLeft[_bookId] = idToNumberLeft[_bookId] - 1;
        borrowers.push(msg.sender);
    }

    function returnBook(uint _bookId) external OnlyIfReturnable(_bookId) {
        idToNumberLeft[_bookId] = idToNumberLeft[_bookId] + 1;
    }

    //############/PRIVATE_HELPER_FUNCTIONS#####################################
    function _generateID(string memory _tittle) private pure returns (uint) {
        uint mask = 10 ** 8;
        uint id = uint(keccak256(abi.encodePacked(_tittle)));
        return id % mask;
    }
}