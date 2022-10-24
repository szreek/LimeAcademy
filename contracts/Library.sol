// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;
import "./Ownable.sol";

contract Library is Ownable {

    Book[] public books;
    address[] public borrowers;

    mapping (uint => Book) public idToBook;
    mapping (uint => uint) public idToNumberLeft;

    struct Book {
        uint id;
        uint copiesCount;
        string tittle;
    }

    modifier onlyIfBookAvailable(uint _bookId) {
        require(idToNumberLeft[_bookId] > 0, "No more copies left to be borrowed");
        _;
    }

    modifier OnlyIfReturnable(uint _bookId) {
        require(idToNumberLeft[_bookId] < idToBook[_bookId].copiesCount, "All copies already returned");
        _;
    }

    function addBook(string memory _tittle, uint _copiesCount) public onlyOwner {
        uint id = _generateID(_tittle);
        books.push(Book(id, _copiesCount, _tittle));
        uint index = books.length - 1;
        Book storage a = books[index];
        idToBook[id] = a; 
        idToNumberLeft[id] = a.copiesCount; 
    }

    function _generateID(string memory _tittle) private pure returns (uint) {
        uint id = uint(keccak256(abi.encodePacked(_tittle)));
        return id;
    }

    function getListOfBooks() external view returns(Book[] memory) {
        return books;
    }

    function borrowBook(uint _bookId) external onlyIfBookAvailable(_bookId) {
        idToNumberLeft[_bookId] = idToNumberLeft[_bookId] - 1;
        borrowers.push(msg.sender);
    }

    function returnBook(uint _bookId) external OnlyIfReturnable(_bookId) {
        idToNumberLeft[_bookId] = idToNumberLeft[_bookId] + 1;
    } 
}
