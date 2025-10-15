// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title OnChainJournal
 * @author Gemini
 * @notice A smart contract for minting on-chain journal entries as NFTs.
 * This is the final version, ready for deployment. The SVG image has a 
 * gradient border with a solid color background.
 */
contract OnChainJournal is ERC721 {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    struct JournalEntry {
        string text;
        string mood;
        uint256 timestamp;
        address owner;
    }

    mapping(uint256 => JournalEntry) public journalEntries;

    constructor() ERC721("On-Chain Journal", "JOURNAL") {}

    function _escapeString(string memory _str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        // FIX: Increased allocation from 5 to 6 to prevent buffer overflow from '&quot;' or '&apos;'
        bytes memory result = new bytes(strBytes.length * 6);
        uint resultIndex = 0;
        for (uint i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == '&') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'a';
                result[resultIndex++] = 'm';
                result[resultIndex++] = 'p';
                result[resultIndex++] = ';';
            } else if (strBytes[i] == '<') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'l';
                result[resultIndex++] = 't';
                result[resultIndex++] = ';';
            } else if (strBytes[i] == '>') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'g';
                result[resultIndex++] = 't';
                result[resultIndex++] = ';';
            } else if (strBytes[i] == '"') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'q';
                result[resultIndex++] = 'u';
                result[resultIndex++] = 'o';
                result[resultIndex++] = 't';
                result[resultIndex++] = ';';
            // FIX: Added escaping for single quotes for robustness
            } else if (strBytes[i] == '\'') {
                result[resultIndex++] = '&';
                result[resultIndex++] = 'a';
                result[resultIndex++] = 'p';
                result[resultIndex++] = 'o';
                result[resultIndex++] = 's';
                result[resultIndex++] = ';';
            } else {
                result[resultIndex++] = strBytes[i];
            }
        }
        bytes memory finalResult = new bytes(resultIndex);
        for(uint i = 0; i < resultIndex; i++) {
            finalResult[i] = result[i];
        }
        return string(finalResult);
    }

    function mintEntry(string memory _text, string memory _mood) public {
        // FIX: Added input validation to prevent Gas Griefing / DoS attacks
        require(bytes(_text).length <= 400, "OnChainJournal: Text exceeds 400 bytes.");
        require(bytes(_mood).length <= 64, "OnChainJournal: Mood exceeds 64 bytes.");

        uint256 newItemId = _tokenIdCounter.current();
        _safeMint(msg.sender, newItemId);
        journalEntries[newItemId] = JournalEntry({
            text: _text,
            mood: _mood,
            timestamp: block.timestamp,
            owner: msg.sender
        });
        _tokenIdCounter.increment();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        JournalEntry memory entry = journalEntries[tokenId];
        string memory svg = generateSVG(entry);
        string memory encodedSvg = Base64.encode(bytes(svg));
        string memory json = string(
            abi.encodePacked(
                '{"name": "Journal Entry #', tokenId.toString(), '",',
                '"description": "', string(abi.encodePacked("A personal journal entry minted at timestamp ", entry.timestamp.toString(), ".")), '",',
                '"attributes": [',
                    '{"trait_type": "Mood", "value": "', _escapeString(entry.mood), '"},',
                    '{"trait_type": "Timestamp", "value": "', entry.timestamp.toString(), '"},',
                    '{"trait_type": "Text", "value": "', _escapeString(entry.text), '"}',
                '],',
                '"image": "data:image/svg+xml;base64,', encodedSvg, '"',
                '}'
            )
        );
        return string(
            abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json)))
        );
    }

    /**
     * @notice A public function to generate and preview SVG code without minting.
     * @dev This function now includes the final gradient border design.
     * @param entry The JournalEntry struct containing the data to preview.
     * @return A string containing the complete SVG code.
     */
    function generateSVG(JournalEntry memory entry) public pure returns (string memory) {
        string memory escapedText = _escapeString(entry.text);
        string memory escapedMood = _escapeString(entry.mood);

        // --- CHAIN-SPECIFIC COLORS ---
        // These values MUST be changed for each chain-specific deployment.
        // This contract is configured for the 'Bob' chain as per the PRD.
        //
        // PRD Chain Palette:
        // - Bob: Orange Gradient (#FF6B35 -> #F7931E)
        // - Ink: Purple (#5D3FD3)
        // - Base: Blue (#0052FF)
        // ... and so on for other chains.
        string memory color1 = "#FF6B35";
        string memory color2 = "#F7931E";

        return string(abi.encodePacked(
            '<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">',
                '<defs>',
                    '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
                        '<stop offset="0%" style="stop-color:', color1, ';stop-opacity:1" />',
                        '<stop offset="100%" style="stop-color:', color2, ';stop-opacity:1" />',
                    '</linearGradient>',
                '</defs>',
                
                '',
                '<rect width="100%" height="100%" rx="20" ry="20" fill="url(#grad)"/>',
                
                '',
                // The inner fill uses the primary color of the gradient.
                '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="', color1, '"/>',

                '',
                '<text x="450" y="90" font-family="sans-serif" font-size="70" text-anchor="end" fill="white">', escapedMood, '</text>',
                
                '<text x="50" y="75" font-family="monospace" font-size="20" fill="white" fill-opacity="0.8">Timestamp: ', entry.timestamp.toString(), '</text>',
                
                '<foreignObject x="50" y="120" width="400" height="280">',
                    '<div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: sans-serif; font-size: 22px; word-wrap: break-word; line-height: 1.5;">',
                        escapedText,
                    '</div>',
                '</foreignObject>',
                
                '<text x="50" y="450" font-family="monospace" font-size="16" fill="white" fill-opacity="0.5">On-Chain Journal</text>',
            '</svg>'
        ));
    }
}