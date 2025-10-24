// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

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
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

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

    /// @notice Trusted signer address for ENS verification
    address public trustedSigner;

    /// @notice Nonces for signature replay protection
    mapping(address => uint256) public nonces;

    /// @notice Journal entry data structure
    struct JournalEntry {
        string text;
        string mood;
        uint256 timestamp;
        uint256 blockNumber;    // Block number when NFT was minted
        address owner;
        uint256 originChainId;  // Chain ID where NFT was originally minted
        string ensName;         // Optional ENS name (empty if not provided)
        bool ensVerified;       // Whether the ENS name was cryptographically verified
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
        uint256 timestamp
    );

    // ============================================
    // ERRORS
    // ============================================

    error TextTooLong(uint256 length, uint256 maxLength);
    error MoodTooLong(uint256 length, uint256 maxLength);
    error TokenDoesNotExist(uint256 tokenId);
    error SignatureExpired(uint256 expiry, uint256 currentTime);
    error InvalidNonce(uint256 provided, uint256 expected);
    error InvalidSignature();

    // ============================================
    // CONSTANTS
    // ============================================

    uint256 public constant MAX_TEXT_LENGTH = 400;
    uint256 public constant MAX_MOOD_LENGTH = 64;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the contract with chain-specific colors and trusted signer
     * @param _color1 Primary gradient color (hex format with #)
     * @param _color2 Secondary gradient color (hex format with #)
     * @param _chainName Name of the chain (e.g., "Bob", "Base")
     * @param _owner Address of the contract owner
     * @param _trustedSigner Address of the backend signer for ENS verification
     */
    function initialize(
        string memory _color1,
        string memory _color2,
        string memory _chainName,
        address _owner,
        address _trustedSigner
    ) public initializer {
        __ERC721_init("MintMyMood", "MMM");
        __Ownable_init(_owner);

        color1 = _color1;
        color2 = _color2;
        chainName = _chainName;
        trustedSigner = _trustedSigner;
    }

    // ============================================
    // MINTING FUNCTIONS
    // ============================================

    /**
     * @notice Mints a new journal entry NFT with ENS verification
     * @param _text The journal entry text (max 400 bytes)
     * @param _mood The mood emoji or text (max 64 bytes)
     * @param _ensName Optional ENS name (pass empty string if none)
     * @param _signature Signature from trusted backend verifying ENS name
     * @param _nonce Current nonce for the minter (prevents replay attacks)
     * @param _expiry Signature expiry timestamp
     */
    function mintEntry(
        string memory _text,
        string memory _mood,
        string memory _ensName,
        bytes memory _signature,
        uint256 _nonce,
        uint256 _expiry
    ) public {
        // Input validation
        uint256 textLength = bytes(_text).length;
        if (textLength > MAX_TEXT_LENGTH) {
            revert TextTooLong(textLength, MAX_TEXT_LENGTH);
        }

        uint256 moodLength = bytes(_mood).length;
        if (moodLength > MAX_MOOD_LENGTH) {
            revert MoodTooLong(moodLength, MAX_MOOD_LENGTH);
        }

        // Signature verification
        if (block.timestamp > _expiry) {
            revert SignatureExpired(_expiry, block.timestamp);
        }

        if (_nonce != nonces[msg.sender]) {
            revert InvalidNonce(_nonce, nonces[msg.sender]);
        }

        // Recreate the hash that was signed by the backend
        // MUST match the backend signing logic exactly
        bytes32 messageHash = keccak256(
            abi.encode(msg.sender, _ensName, _nonce, _expiry)
        );

        // Verify the signature
        address recoveredSigner = messageHash.toEthSignedMessageHash().recover(_signature);
        if (recoveredSigner != trustedSigner) {
            revert InvalidSignature();
        }

        // Increment nonce to prevent replay attacks
        nonces[msg.sender]++;

        // Mint the NFT
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        // Determine if ENS is verified (non-empty string means it's verified)
        bool ensVerified = bytes(_ensName).length > 0;

        journalEntries[tokenId] = JournalEntry({
            text: _text,
            mood: _mood,
            timestamp: block.timestamp,
            blockNumber: block.number,
            owner: msg.sender,
            originChainId: block.chainid,
            ensName: _ensName,
            ensVerified: ensVerified
        });

        emit EntryMinted(tokenId, msg.sender, _mood, block.timestamp);
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
        return string(
            abi.encodePacked(
                '[',
                '{"trait_type": "Mood", "value": "', _escapeString(entry.mood), '"},',
                '{"trait_type": "Timestamp", "value": ', entry.timestamp.toString(), '},',
                '{"trait_type": "Origin Chain", "value": "', chainName, '"},',
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
        string memory escapedText = _escapeString(entry.text);
        string memory escapedMood = _escapeString(entry.mood);
        string memory displayAddress = _formatAddress(entry);

        // Generate chain-specific gradient IDs
        string memory gradientId = string(abi.encodePacked("gradient-", chainName));
        string memory gradientId2 = string(abi.encodePacked("gradient2-", chainName));
        string memory gradientId3 = string(abi.encodePacked("gradient3-", chainName));
        string memory filterId = string(abi.encodePacked("filter-", chainName));

        return string(abi.encodePacked(
            _generateSVGPart1(gradientId, gradientId2, gradientId3, filterId),
            _generateSVGPart2(escapedMood, entry.blockNumber, escapedText, displayAddress)
        ));
    }

    /**
     * @notice Generates the first part of the SVG (defs and background)
     * @dev Split into multiple functions due to stack depth limitations
     */
    function _generateSVGPart1(
        string memory gradientId,
        string memory gradientId2,
        string memory gradientId3,
        string memory filterId
    ) internal view returns (string memory) {
        return string(abi.encodePacked(
            '<svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">',
                '<defs>',
                    '<style>',
                        '@keyframes typewriter {',
                            '0% { width: 0; }',
                            '50% { width: 80px; }',
                            '80% { width: 80px; }',
                            '100% { width: 0; }',
                        '}',
                        '#block-clip-rect { animation: typewriter 4s steps(8) infinite; }',
                    '</style>',
                    '<filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">',
                        '<feDropShadow dx="4" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.4"/>',
                    '</filter>',
                    _generateGradients(gradientId2, gradientId3),
                    _generateFilter(filterId),
                    '<clipPath id="card-clip">',
                        '<rect x="8" y="8" width="484" height="484" rx="15" ry="15"/>',
                    '</clipPath>',
                    '<clipPath id="block-clip">',
                        '<rect id="block-clip-rect" x="35" y="50" height="20" width="80"/>',
                    '</clipPath>',
                '</defs>',
                '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#drop-shadow)"/>',
                '<g clip-path="url(#card-clip)">',
                    '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="', color1, '"/>',
                    '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#', gradientId3, ')"/>',
                    '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="url(#', gradientId2, ')"/>',
                    '<rect x="8" y="8" width="484" height="484" rx="15" ry="15" fill="transparent" filter="url(#', filterId, ')" opacity="0.66" style="mix-blend-mode: soft-light"/>'
        ));
    }

    /**
     * @notice Generates the second part of the SVG (content)
     */
    function _generateSVGPart2(
        string memory escapedMood,
        uint256 blockNumber,
        string memory escapedText,
        string memory displayAddress
    ) internal view returns (string memory) {
        return string(abi.encodePacked(
            '<g>',
                '<text x="450" y="90" font-family="sans-serif" font-size="70" text-anchor="end" fill="white">', escapedMood, '</text>',
                '<text x="35" y="45" font-family="monospace" font-size="14" fill="white" fill-opacity="0.7">minted on block</text>',
                '<g clip-path="url(#block-clip)">',
                    '<text x="35" y="65" font-family="monospace" font-size="16" fill="white" fill-opacity="0.8">#', blockNumber.toString(), '</text>',
                '</g>',
                '<foreignObject x="50" y="100" width="400" height="334">',
                    '<div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">',
                        '<div style="color: white; font-family: Georgia, serif; font-size: 18px; word-wrap: break-word; line-height: 1.5; text-shadow: -1px -1px 1px rgba(0,0,0,0.4), 1px 1px 1px rgba(255,255,255,0.15); text-align: left; max-width: 100%;">',
                            escapedText,
                        '</div>',
                        '<div style="margin-top: 20px; color: white; font-family: monospace; font-size: 14px; opacity: 0.8;">',
                            displayAddress,
                        '</div>',
                    '</div>',
                '</foreignObject>',
                '<text x="35" y="465" font-family="monospace" font-size="16" fill="white" fill-opacity="0.7" text-anchor="start">', chainName, '</text>',
                '<text x="465" y="465" font-family="monospace" font-size="16" fill="white" fill-opacity="0.7" text-anchor="end">MintMyMood</text>',
            '</g>',
        '</g>',
        '</svg>'
        ));
    }

    /**
     * @notice Generates the gradient definitions for the SVG
     */
    function _generateGradients(
        string memory gradientId2,
        string memory gradientId3
    ) internal view returns (string memory) {
        return string(abi.encodePacked(
            '<linearGradient gradientTransform="rotate(-202, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="', gradientId2, '">',
                '<stop stop-color="', color2, '" stop-opacity="1" offset="-0%"/>',
                '<stop stop-color="rgba(255,255,255,0)" stop-opacity="0" offset="100%"/>',
            '</linearGradient>',
            '<linearGradient gradientTransform="rotate(202, 0.5, 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="', gradientId3, '">',
                '<stop stop-color="#f9f7f1ff" stop-opacity="1"/>',
                '<stop stop-color="rgba(255,255,255,0)" stop-opacity="0" offset="40%"/>',
            '</linearGradient>'
        ));
    }

    /**
     * @notice Generates the grain filter for the SVG
     */
    function _generateFilter(string memory filterId) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<filter id="', filterId, '" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">',
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
     * @notice Formats an address for display with verification status
     * @param entry The journal entry
     * @return Formatted display string
     */
    function _formatAddress(JournalEntry memory entry) internal pure returns (string memory) {
        // If ENS name provided and verified, show with checkmark
        if (bytes(entry.ensName).length > 0 && entry.ensVerified) {
            // Truncate long ENS names to fit in SVG (max ~25 chars including checkmark)
            string memory truncatedEns = _truncateEnsName(entry.ensName, 23); // 23 chars + "✓ " = 25 total
            return string(abi.encodePacked(unicode"✓ ", truncatedEns));
        }

        // If ENS name provided but not verified (shouldn't happen with new logic)
        if (bytes(entry.ensName).length > 0) {
            return _truncateEnsName(entry.ensName, 25);
        }

        // Otherwise, format address as 0x1A2b...dE3F
        string memory addrStr = Strings.toHexString(uint256(uint160(entry.owner)), 20);
        bytes memory addrBytes = bytes(addrStr);

        // Extract first 6 chars (0x1A2b) and last 4 chars (dE3F)
        bytes memory result = new bytes(13); // "0x1A2b...dE3F" = 13 chars

        // Copy "0x" + first 4 hex chars
        for (uint i = 0; i < 6; i++) {
            result[i] = addrBytes[i];
        }

        // Add "..."
        result[6] = '.';
        result[7] = '.';
        result[8] = '.';

        // Copy last 4 hex chars
        for (uint i = 0; i < 4; i++) {
            result[9 + i] = addrBytes[38 + i]; // 42 total - 4 = 38
        }

        return string(result);
    }

    /**
     * @notice Truncates an ENS name if it's too long, adding "..." at the end
     * @param ensName The ENS name to truncate
     * @param maxLength Maximum length before truncation
     * @return Truncated ENS name with "..." if needed
     */
    function _truncateEnsName(string memory ensName, uint256 maxLength) internal pure returns (string memory) {
        bytes memory ensBytes = bytes(ensName);

        // If ENS name fits, return as-is
        if (ensBytes.length <= maxLength) {
            return ensName;
        }

        // Truncate and add "..."
        // We want to show first (maxLength - 3) chars + "..."
        bytes memory result = new bytes(maxLength);

        // Copy first (maxLength - 3) characters
        for (uint i = 0; i < maxLength - 3; i++) {
            result[i] = ensBytes[i];
        }

        // Add "..."
        result[maxLength - 3] = '.';
        result[maxLength - 2] = '.';
        result[maxLength - 1] = '.';

        return string(result);
    }

    /**
     * @notice Escapes special XML characters in a string
     * @param _str The string to escape
     * @return Escaped string safe for XML/SVG
     */
    function _escapeString(string memory _str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        // Allocate enough space for worst case (all chars need escaping)
        bytes memory result = new bytes(strBytes.length * 6);
        uint256 resultIndex = 0;

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

        // Trim result to actual size
        bytes memory finalResult = new bytes(resultIndex);
        for(uint256 i = 0; i < resultIndex; i++) {
            finalResult[i] = result[i];
        }
        return string(finalResult);
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
     * @notice Updates the trusted signer address
     * @param _newSigner Address of the new trusted signer
     */
    function updateTrustedSigner(address _newSigner) external onlyOwner {
        trustedSigner = _newSigner;
    }

    /**
     * @notice Returns the current contract version
     * @return Version string
     */
    function version() external pure returns (string memory) {
        return "2.3.0";
    }
}
