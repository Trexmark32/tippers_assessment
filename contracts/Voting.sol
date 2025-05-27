// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol"; // Optional: for debugging during development

contract Voting {
    struct Candidate {
        string name;
        uint voteCount;
    }

    address public owner;
    Candidate[] public candidates;
    mapping(address => bool) public voters;

    event CandidateAdded(uint indexed candidateId, string name);
    event Voted(address indexed voter, uint indexed candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "VotingContract: Not the owner.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Adds a new candidate to the election. Only the contract owner can call this.
     * @param name The name of the candidate.
     */
    function addCandidate(string memory name) public onlyOwner {
        uint candidateId = candidates.length;
        candidates.push(Candidate(name, 0));
        emit CandidateAdded(candidateId, name);
    }

    /**
     * @dev Allows a user to cast a vote for a candidate.
     * Each user can only vote once.
     * @param candidateIndex The index of the candidate to vote for.
     */
    function vote(uint candidateIndex) public {
        require(!voters[msg.sender], "VotingContract: You have already voted.");
        require(candidateIndex < candidates.length, "VotingContract: Invalid candidate index.");

        candidates[candidateIndex].voteCount++;
        voters[msg.sender] = true;
        emit Voted(msg.sender, candidateIndex);
    }

    /**
     * @dev Retrieves all candidates and their current vote counts.
     * @return An array of Candidate structs.
     */
    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    /**
     * @dev Determines and returns the name of the winning candidate.
     * If there are no candidates, returns an empty string.
     * In case of a tie, returns the name of the first candidate with the highest votes.
     * @return name The name of the winning candidate.
     */
    function getWinner() public view returns (string memory name) {
        if (candidates.length == 0) {
            return "";
        }

        uint winningVoteCount = 0;
        uint winningCandidateIndex = 0;

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningCandidateIndex = i;
            }
        }
        // If all candidates have 0 votes, it will return the first candidate by default.
        // keeping it simple as this is a simple contract.
        // A more robust solution can be made to handle "no votes cast" or "clear tie with 0 votes" differently.
        return candidates[winningCandidateIndex].name;
    }
}
