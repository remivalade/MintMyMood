// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title OnChainJournal
 * @author MintMyMood Team
 * @notice A UUPS upgradeable smart contract for minting on-chain journal entries as NFTs.
 * @dev This contract uses UUPS upgradeability pattern and is prepared for LayerZero V2
 * cross-chain functionality (to be added when specifications are finalized).
 *
 * Key Features:
 * - On-chain SVG generation (no IPFS dependencies)
 * - Chain-specific gradient colors hardcoded per deployment
 * - Input validation (400 byte text limit, 64 byte mood limit)
 * - XML escaping for security
 * - UUPS upgradeable for future enhancements
 * - Simplified minting (no backend signature verification required)
 * - Native SVG text wrapping (V2.5.0)
 *
 * Deployment Strategy: One contract instance per chain, each with chain-specific gradient colors.
 *
 * Chain Colors:
 * - Bob: Orange gradient #FF6B35 → #F7931E
 * - Ink: Purple #5D3FD3
 * - Base: Blue #0052FF
 * - HyperEVM: Green #00F0A0
 */
contract OnChainJournal is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using Strings for uint256;

    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Counter for token IDs
    uint256 private _nextTokenId;

    /// @notice Chain-specific gradient colors (set during initialization)
    string public color1;
    string public color2;

    /// @notice Chain name identifier
    string public chainName;

    /// @notice Cost to mint an entry (in wei)
    uint256 public mintPrice;

    /// @notice Master switch for minting
    bool public mintActive;

    /// @notice Journal entry data structure
    struct JournalEntry {
        string text;
        string mood;
        uint256 timestamp;
        uint256 blockNumber;    // Block number when NFT was minted
        address owner;
        uint256 originChainId;  // Chain ID where NFT was originally minted
        uint8 styleId;          // 0 = Chain Native, 1 = Classic
    }

    /// @notice Mapping from token ID to journal entry
    mapping(uint256 => JournalEntry) public journalEntries;

    // ============================================
    // EVENTS
    // ============================================

    event EntryMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string mood,
        uint256 timestamp,
        uint8 styleId
    );

    // ============================================
    // ERRORS
    // ============================================

    error TextTooLong(uint256 length, uint256 maxLength);
    error MoodTooLong(uint256 length, uint256 maxLength);
    error TokenDoesNotExist(uint256 tokenId);
    error InvalidStyle(uint8 styleId);
    error MintingPaused();
    error InsufficientPayment();
    error TransferFailed();

    // ============================================
    // CONSTANTS
    // ============================================

    uint256 public constant MAX_TEXT_LENGTH = 400;
    uint256 public constant MAX_MOOD_LENGTH = 64;
    uint256 public constant LINE_LENGTH_CHARS = 45;

    // Precomputed chain name hashes for gas optimization
    bytes32 private constant HASH_INK = keccak256("INK");
    bytes32 private constant HASH_Ink = keccak256("Ink");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the contract with chain-specific colors
     * @param _color1 Primary gradient color (hex format with #)
     * @param _color2 Secondary gradient color (hex format with #)
     * @param _chainName Name of the chain (e.g., "Bob", "Base")
     * @param _owner Address of the contract owner
     */
    function initialize(
        string memory _color1,
        string memory _color2,
        string memory _chainName,
        address _owner
    ) public initializer {
        __ERC721_init("MintMyMood", "MMM");
        __Ownable_init(_owner);

        color1 = _color1;
        color2 = _color2;
        chainName = _chainName;
        mintActive = true;
        mintPrice = 0;
    }

    // ============================================
    // MINTING FUNCTIONS
    // ============================================

    /**
     * @notice Mints a new journal entry NFT
     * @param _text The journal entry text (max 400 bytes)
     * @param _mood The mood emoji or text (max 64 bytes)
     * @param _styleId The style ID (0 = Chain Native, 1 = Classic)
     */
    function mintEntry(
        string memory _text,
        string memory _mood,
        uint8 _styleId
    ) public payable {
        if (!mintActive) revert MintingPaused();
        if (msg.value < mintPrice) revert InsufficientPayment();
        if (_styleId > 1) revert InvalidStyle(_styleId);

        // Input validation
        uint256 textLength = bytes(_text).length;
        if (textLength > MAX_TEXT_LENGTH) {
            revert TextTooLong(textLength, MAX_TEXT_LENGTH);
        }

        uint256 moodLength = bytes(_mood).length;
        if (moodLength > MAX_MOOD_LENGTH) {
            revert MoodTooLong(moodLength, MAX_MOOD_LENGTH);
        }

        // Mint the NFT
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        journalEntries[tokenId] = JournalEntry({
            text: _text,
            mood: _mood,
            timestamp: block.timestamp,
            blockNumber: block.number,
            owner: msg.sender,
            originChainId: block.chainid,
            styleId: _styleId
        });

        emit EntryMinted(tokenId, msg.sender, _mood, block.timestamp, _styleId);
    }

    // ============================================
    // METADATA & SVG GENERATION
    // ============================================

    /**
     * @notice Generates the token URI with on-chain SVG
     * @param tokenId The token ID to generate URI for
     * @return Base64-encoded JSON metadata with embedded SVG
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist(tokenId);
        }

        JournalEntry memory entry = journalEntries[tokenId];
        string memory svg = generateSVG(entry);
        string memory encodedSvg = Base64.encode(bytes(svg));

        string memory json = string(
            abi.encodePacked(
                '{"name": "Journal Entry #', tokenId.toString(), '",',
                '"description": "', _buildDescription(entry), '",',
                '"attributes": ', _buildAttributes(entry, tokenId), ',',
                '"image": "data:image/svg+xml;base64,', encodedSvg, '"',
                '}'
            )
        );

        return string(
            abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json)))
        );
    }

    /**
     * @notice Builds the description for the NFT metadata
     * @param entry The journal entry
     * @return JSON description string
     */
    function _buildDescription(JournalEntry memory entry) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "A personal journal entry minted at timestamp ",
                entry.timestamp.toString(),
                "."
            )
        );
    }

    /**
     * @notice Builds the attributes array for the NFT metadata
     * @param entry The journal entry
     * @param tokenId The token ID
     * @return JSON attributes array string
     */
    function _buildAttributes(
        JournalEntry memory entry,
        uint256 tokenId
    ) internal view returns (string memory) {
        string memory styleName = entry.styleId == 1 ? "Classic" : "Chain Native";
        return string(
            abi.encodePacked(
                '[',
                '{"trait_type": "Mood", "value": "', _escapeString(entry.mood), '"},',
                '{"trait_type": "Timestamp", "value": ', entry.timestamp.toString(), '},',
                '{"trait_type": "Origin Chain", "value": "', chainName, '"},',
                '{"trait_type": "Style", "value": "', styleName, '"},',
                '{"trait_type": "Token ID", "value": ', tokenId.toString(), '}',
                ']'
            )
        );
    }

    /**
     * @notice Generates the on-chain SVG for a journal entry
     * @param entry The journal entry to generate SVG for
     * @return Complete SVG markup as a string
     */
    function generateSVG(JournalEntry memory entry) public view returns (string memory) {
        string memory escapedMood = _escapeString(entry.mood);

        // Create short chain-specific ID suffix (lowercase chain name)
        string memory chainId = _toLowercase(chainName);

        return string(abi.encodePacked(
            _generateSVGPart1(entry.styleId, chainId),
            _generateSVGPart2(escapedMood, entry.blockNumber, entry.text, entry.styleId)
        ));
    }

    /**
     * @notice Generates the first part of the SVG (defs and background)
     * @dev Split into multiple functions due to stack depth limitations
     * @dev Uses short chain-specific IDs (e.g., d-base, g1-bob) to prevent conflicts
     */
    function _generateSVGPart1(
        uint8 styleId,
        string memory chainId
    ) internal view returns (string memory) {
        // Classic Style (ID 1)
        if (styleId == 1) {
             return string(abi.encodePacked(
                '<svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">',
                '<defs>',
                    '<filter id="d-', chainId, '" x="-20%" y="-20%" width="140%" height="140%">',
                        '<feDropShadow dx="4" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.4"/>',
                    '</filter>',
                    '<clipPath id="c-', chainId, '">',
                        '<rect x="8" y="8" width="484" height="484" rx="15" ry="15"/>',
                    '</clipPath>',
                '</defs>',
                '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#d-', chainId, ')"/>',
                '<g clip-path="url(#c-', chainId, ')">',
                    '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="#F9F7F1"/>'
            ));
        }

        // Chain Native Style (ID 0)
        string memory background;
        
        // Chain-specific background logic (case-insensitive checks)
        bytes32 chainHash = keccak256(bytes(chainName));
        bool isInk = chainHash == HASH_INK || chainHash == HASH_Ink;

        if (isInk) {
            background = string(abi.encodePacked(
                '<g transform="translate(8, 8) scale(0.968)">',
                '<rect width="500" height="500" fill="', color1, '"/>',
                '<path d="M0,0L500,0v100.43c0-48.29-60.95-41.79-60.95,0v234.04c0,65.01-83.58,65.94-84.51,0v-255.4c0-36.68-54.79-34.51-54.79,0v112.38c0,58.55-79.87,58.55-79.87,0v-91.01c0-37.15-73.67-37.15-73.67,0v162.53c0,66.87-97.83,66.87-97.83,0v-162.53c0-35.22-48.37-35.22-48.37,0" fill="#0d0c52"/>',
                '</g>'
            ));
        } else {
            // Standard gradient background (Base, Bob, etc)
            background = string(abi.encodePacked(
                '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="', color1, '"/>',
                '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#g2-', chainId, ')"/>',
                '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#g1-', chainId, ')"/>',
                '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#f-', chainId, ')" opacity="0.66" style="mix-blend-mode: soft-light"/>'
            ));
        }

        return string(abi.encodePacked(
            '<svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">',
                '<defs>',
                    '<filter id="d-', chainId, '" x="-20%" y="-20%" width="140%" height="140%">',
                        '<feDropShadow dx="4" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.4"/>',
                    '</filter>',
                    _generateGradients(chainId),
                    _generateFilter(chainId),
                    '<clipPath id="c-', chainId, '">',
                        '<rect x="8" y="8" width="484" height="484" rx="15" ry="15"/>',
                    '</clipPath>',
                '</defs>',
                '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#d-', chainId, ')"/>',
                '<g clip-path="url(#c-', chainId, ')">',
                    background
        ));
    }

    /**
     * @notice Generates the second part of the SVG (content)
     */
    function _generateSVGPart2(
        string memory escapedMood,
        uint256 blockNumber,
        string memory rawText,
        uint8 styleId
    ) internal view returns (string memory) {
        // Determine font and colors based on chain and style
        bool isClassic = (styleId == 1);
        string memory fontFamily = "Georgia, serif";
        string memory footerColor = "white";
        string memory mainTextColor = "white";
        string memory moodColor = "white";
        string memory shadowEffect = 'style="text-shadow: -1px -1px 1px rgba(0,0,0,0.4), 1px 1px 1px rgba(255,255,255,0.15);"';
        
        if (isClassic) {
            fontFamily = "Georgia, serif";
            footerColor = "#8B7355";
            mainTextColor = "#2D2D2D";
            moodColor = "#2D2D2D";
            shadowEffect = 'style="text-shadow: 1px 1px 2px rgba(0,0,0,0.2), -1px -1px 2px rgba(255,255,255,0.9);"';
        } else {
            // Chain Native Style - use constants for case-insensitive checks
            bytes32 h = keccak256(bytes(chainName));
            bool isInkStyle = h == HASH_INK || h == HASH_Ink;

            if (isInkStyle) {
                fontFamily = "Arial, sans-serif";
            }
        }

        // Calculate wrapped text lines
        (string[] memory lines, uint256 lineCount) = _wrapText(rawText);
        
        // Calculate vertical centering
        // Target center Y is approx 285px
        // Formula: startY = 285 - (lines.length * 12)
        uint256 startY = 285 - (lineCount * 12);
        
        string memory textContent = "";
        for (uint256 i = 0; i < lineCount; i++) {
            uint256 dy = (i == 0) ? 0 : 24;
            textContent = string(abi.encodePacked(
                textContent,
                '<tspan x="250" dy="', dy.toString(), '">', _escapeString(lines[i]), '</tspan>'
            ));
        }

        string memory blockInfo = "";
        if (isClassic) {
             blockInfo = string(abi.encodePacked(
                 '<text x="35" y="45" font-family="monospace" font-size="14" fill="#5A5A5A" fill-opacity="0.7">minted on block</text>',
                 '<text x="35" y="65" font-family="monospace" font-size="16" fill="#8B7355" fill-opacity="0.8">#', blockNumber.toString(), '</text>'
             ));
        } else {
             blockInfo = string(abi.encodePacked(
                 '<text x="35" y="45" font-family="monospace" font-size="14" fill="white" fill-opacity="0.7">minted on block</text>',
                 '<text x="35" y="65" font-family="monospace" font-size="16" fill="white" fill-opacity="0.8">#', blockNumber.toString(), '</text>'
             ));
        }

        // Count open <g> tags: Classic/Bob/Base = 2, INK = 3
        bytes32 h2 = keccak256(bytes(chainName));
        bool isInkChain = h2 == HASH_INK || h2 == HASH_Ink;
        bool needsExtraClose = !isClassic && isInkChain;

        // closingTags closes: content <g>, clip-path <g>, and optionally background <g>
        string memory closingTags = needsExtraClose ? '</g></g></svg>' : '</g></svg>';

        return string(abi.encodePacked(
            '<g>',
                '<text x="450" y="90" font-family="sans-serif" font-size="70" text-anchor="end" fill="', moodColor, '">', escapedMood, '</text>',
                blockInfo,

                // Native Text Wrapping
                '<text x="250" y="', startY.toString(), '" font-family="', fontFamily, '" font-size="18" fill="', mainTextColor, '" text-anchor="middle" ', shadowEffect, '>',
                    textContent,
                '</text>',

                '<text x="35" y="475" font-family="monospace" font-size="16" fill="', footerColor, '" fill-opacity="0.7" text-anchor="start">', chainName, '</text>',
                '<text x="465" y="475" font-family="monospace" font-size="16" fill="', footerColor, '" fill-opacity="0.7" text-anchor="end">MintMyMood</text>',
            '</g>',
            closingTags
        ));
    }

    /**
     * @notice Wraps text into lines of approx LINE_LENGTH_CHARS length
     * @param text The text to wrap
     * @return lines Array of text lines
     * @return count Number of lines
     */
    function _wrapText(string memory text) internal pure returns (string[] memory lines, uint256 count) {
        bytes memory textBytes = bytes(text);
        uint256 len = textBytes.length;
        
        // Max possible lines is length / 1 (worst case) but realistically much lower
        // We allocate a safe upper bound
        string[] memory tempLines = new string[](20); 
        uint256 lineIndex = 0;
        
        if (len == 0) {
            return (tempLines, 0);
        }

        uint256 currentLineStart = 0;
        uint256 lastSpace = 0;
        uint256 currentLineLength = 0;

        for (uint256 i = 0; i < len; i++) {
            if (textBytes[i] == ' ') {
                lastSpace = i;
            }
            
            currentLineLength++;
            
            // If we exceed line length
            if (currentLineLength > LINE_LENGTH_CHARS) {
                if (lastSpace > currentLineStart) {
                    // Break at last space
                    tempLines[lineIndex] = _substring(text, currentLineStart, lastSpace);
                    currentLineStart = lastSpace + 1;
                    currentLineLength = i - lastSpace;
                } else {
                    // No space found, force break at current char
                    tempLines[lineIndex] = _substring(text, currentLineStart, i);
                    currentLineStart = i;
                    currentLineLength = 1;
                }
                lineIndex++;
                if (lineIndex >= 20) break; // Safety break
            }
        }
        
        // Add remaining text
        if (currentLineStart < len && lineIndex < 20) {
            tempLines[lineIndex] = _substring(text, currentLineStart, len);
            lineIndex++;
        }

        return (tempLines, lineIndex);
    }

    /**
     * @notice Helper to extract substring
     */
    function _substring(string memory str, uint256 startIndex, uint256 endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    /**
     * @notice Generates the gradient definitions for the SVG with short chain-specific IDs
     */
    function _generateGradients(string memory chainId) internal view returns (string memory) {
        return string(abi.encodePacked(
            '<linearGradient gradientTransform="rotate(-202, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="g1-', chainId, '">',
                '<stop stop-color="', color2, '" stop-opacity="1" offset="-0%"/>',
                '<stop stop-color="rgba(255,255,255,0)" stop-opacity="0" offset="100%"/>',
            '</linearGradient>',
            '<linearGradient gradientTransform="rotate(202, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="g2-', chainId, '">',
                '<stop stop-color="#f9f7f1ff" stop-opacity="1"/>',
                '<stop stop-color="rgba(255,255,255,0)" stop-opacity="0" offset="40%"/>',
            '</linearGradient>'
        ));
    }

    /**
     * @notice Generates the grain filter for the SVG with short chain-specific ID
     */
    function _generateFilter(string memory chainId) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<filter id="f-', chainId, '" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">',
                '<feTurbulence type="fractalNoise" baseFrequency="0.63" numOctaves="2" seed="2" stitchTiles="stitch" result="turbulence"/>',
                '<feColorMatrix type="saturate" values="0" in="turbulence" result="colormatrix"/>',
                '<feComponentTransfer in="colormatrix" result="componentTransfer">',
                    '<feFuncR type="linear" slope="3"/>',
                    '<feFuncG type="linear" slope="3"/>',
                    '<feFuncB type="linear" slope="3"/>',
                '</feComponentTransfer>',
                '<feColorMatrix in="componentTransfer" result="colormatrix2" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -12"/>',
            '</filter>'
        ));
    }

    /**
     * @notice Escapes special XML characters in a string
     * @param _str The string to escape
     * @return Escaped string safe for XML/SVG
     */
    function _escapeString(string memory _str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);

        // First pass: calculate exact size needed
        uint256 finalSize = 0;
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == '&') {
                finalSize += 5; // &amp;
            } else if (strBytes[i] == '<' || strBytes[i] == '>') {
                finalSize += 4; // &lt; or &gt;
            } else if (strBytes[i] == '"' || strBytes[i] == '\'') {
                finalSize += 6; // &quot; or &apos;
            } else {
                finalSize += 1;
            }
        }

        // Allocate exact size (no trimming needed)
        bytes memory result = new bytes(finalSize);
        uint256 resultIndex = 0;

        // Second pass: build escaped string
        for (uint256 i = 0; i < strBytes.length; i++) {
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

        return string(result);
    }

    /**
     * @notice Converts a string to lowercase (for ASCII characters only)
     * @param _str The string to convert
     * @return Lowercase version of the string
     */
    function _toLowercase(string memory _str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        bytes memory result = new bytes(strBytes.length);

        for (uint256 i = 0; i < strBytes.length; i++) {
            // If uppercase letter (A-Z), convert to lowercase
            if (strBytes[i] >= 0x41 && strBytes[i] <= 0x5A) {
                result[i] = bytes1(uint8(strBytes[i]) + 32);
            } else {
                result[i] = strBytes[i];
            }
        }

        return string(result);
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Required by UUPS pattern - authorizes upgrades
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @notice Updates chain colors (emergency use only)
     * @param _color1 New primary color
     * @param _color2 New secondary color
     */
    function updateColors(string memory _color1, string memory _color2) external onlyOwner {
        color1 = _color1;
        color2 = _color2;
    }

    /**
     * @notice Updates the chain name
     * @param _newChainName New name for the chain
     */
    function updateChainName(string memory _newChainName) external onlyOwner {
        chainName = _newChainName;
    }

    /**
     * @notice Updates the mint price
     * @param _newPrice New price in wei
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
    }

    /**
     * @notice Toggles minting status
     * @param _isActive True to enable minting, false to pause
     */
    function setMintActive(bool _isActive) external onlyOwner {
        mintActive = _isActive;
    }

    /**
     * @notice Withdraws collected fees to the owner
     */
    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Returns the current contract version
     * @return Version string
     */
    function version() external pure returns (string memory) {
        return "2.5.2";
    }
}
