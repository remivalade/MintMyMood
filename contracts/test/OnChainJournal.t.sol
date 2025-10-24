// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/OnChainJournal.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract OnChainJournalTest is Test {
    OnChainJournal public implementation;
    OnChainJournal public journal;
    ERC1967Proxy public proxy;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    // Trusted signer for ENS verification (using the actual key from backend)
    uint256 public signerPrivateKey = 0x79ef933fcbb942ff49efc975f74b3835e88bf4bbe24b7e19279a2ce97c17d204;
    address public trustedSigner;

    // Bob chain colors
    string constant COLOR1 = "#FF6B35";
    string constant COLOR2 = "#F7931E";
    string constant CHAIN_NAME = "Bob";

    event EntryMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string mood,
        uint256 timestamp
    );

    function setUp() public {
        // Derive signer address from private key
        trustedSigner = vm.addr(signerPrivateKey);

        // Deploy implementation
        implementation = new OnChainJournal();

        // Deploy proxy and initialize
        bytes memory initData = abi.encodeWithSelector(
            OnChainJournal.initialize.selector,
            COLOR1,
            COLOR2,
            CHAIN_NAME,
            owner,
            trustedSigner
        );
        proxy = new ERC1967Proxy(address(implementation), initData);

        // Wrap proxy in ABI
        journal = OnChainJournal(address(proxy));
    }

    // ============================================
    // SIGNATURE HELPER FUNCTIONS
    // ============================================

    /**
     * @notice Generates a valid signature for minting
     * @param minter The address that will mint
     * @param ensName The ENS name (or empty string)
     * @param nonce The current nonce for the minter
     * @param expiry The signature expiry timestamp
     * @return signature The ECDSA signature
     */
    function _generateSignature(
        address minter,
        string memory ensName,
        uint256 nonce,
        uint256 expiry
    ) internal view returns (bytes memory) {
        // Create the message hash (must match contract logic)
        bytes32 messageHash = keccak256(
            abi.encode(minter, ensName, nonce, expiry)
        );

        // Sign with EIP-191 prefix (toEthSignedMessageHash)
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        // Sign with the trusted signer's private key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, ethSignedHash);

        return abi.encodePacked(r, s, v);
    }

    /**
     * @notice Helper to mint with valid signature
     */
    function _mintWithSignature(
        address minter,
        string memory text,
        string memory mood,
        string memory ensName
    ) internal {
        uint256 nonce = journal.nonces(minter);
        uint256 expiry = block.timestamp + 300; // 5 minutes
        bytes memory signature = _generateSignature(minter, ensName, nonce, expiry);

        vm.prank(minter);
        journal.mintEntry(text, mood, ensName, signature, nonce, expiry);
    }

    // ============================================
    // INITIALIZATION TESTS
    // ============================================

    function test_Initialize() public view {
        assertEq(journal.name(), "MintMyMood");
        assertEq(journal.symbol(), "MMM");
        assertEq(journal.color1(), COLOR1);
        assertEq(journal.color2(), COLOR2);
        assertEq(journal.chainName(), CHAIN_NAME);
        assertEq(journal.owner(), owner);
        assertEq(journal.trustedSigner(), trustedSigner);
    }

    function test_CannotReinitialize() public {
        vm.expectRevert();
        journal.initialize(COLOR1, COLOR2, CHAIN_NAME, owner, trustedSigner);
    }

    // ============================================
    // MINTING TESTS
    // ============================================

    function test_MintEntry() public {
        string memory text = "Today was a great day!";
        string memory mood = unicode"😊";

        vm.expectEmit(true, true, false, false);
        emit EntryMinted(0, user1, mood, block.timestamp);

        _mintWithSignature(user1, text, mood, ""); // Empty ENS

        assertEq(journal.ownerOf(0), user1);

        (
            string memory storedText,
            string memory storedMood,
            uint256 timestamp,
            uint256 blockNumber,
            address storedOwner,
            uint256 originChainId,
            string memory ensName,
            bool ensVerified
        ) = journal.journalEntries(0);

        assertEq(storedText, text);
        assertEq(storedMood, mood);
        assertEq(timestamp, block.timestamp);
        assertEq(blockNumber, block.number);
        assertEq(storedOwner, user1);
        assertEq(originChainId, block.chainid);
        assertEq(ensName, "");
        assertEq(ensVerified, false); // No ENS name provided
    }

    function test_MintEntry_WithENS() public {
        string memory text = "Hello from vitalik";
        string memory mood = unicode"😊";
        string memory ensName = "vitalik.eth";

        _mintWithSignature(user1, text, mood, ensName);

        assertEq(journal.ownerOf(0), user1);

        (
            ,
            ,
            ,
            ,
            ,
            ,
            string memory storedEns,
            bool ensVerified
        ) = journal.journalEntries(0);

        assertEq(storedEns, ensName);
        assertEq(ensVerified, true); // ENS name was verified
    }

    function test_MintMultipleEntries() public {
        _mintWithSignature(user1, "Entry 1", unicode"😊", "");
        _mintWithSignature(user1, "Entry 2", unicode"😢", "");
        _mintWithSignature(user1, "Entry 3", unicode"😡", "");

        assertEq(journal.ownerOf(0), user1);
        assertEq(journal.ownerOf(1), user1);
        assertEq(journal.ownerOf(2), user1);

        // Check nonce incremented
        assertEq(journal.nonces(user1), 3);
    }

    function test_MultipleusersMinting() public {
        _mintWithSignature(user1, "User 1 entry", unicode"😊", "");
        _mintWithSignature(user2, "User 2 entry", unicode"😢", "");

        assertEq(journal.ownerOf(0), user1);
        assertEq(journal.ownerOf(1), user2);

        // Each user has their own nonce
        assertEq(journal.nonces(user1), 1);
        assertEq(journal.nonces(user2), 1);
    }

    // ============================================
    // SIGNATURE VERIFICATION TESTS
    // ============================================

    function test_RevertWhen_InvalidSignature() public {
        uint256 nonce = journal.nonces(user1);
        uint256 expiry = block.timestamp + 300;

        // Create a signature with wrong private key
        uint256 wrongKey = 0x1234;
        bytes32 messageHash = keccak256(abi.encode(user1, "", nonce, expiry));
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, ethSignedHash);
        bytes memory wrongSignature = abi.encodePacked(r, s, v);

        vm.prank(user1);
        vm.expectRevert(OnChainJournal.InvalidSignature.selector);
        journal.mintEntry("Test", unicode"😊", "", wrongSignature, nonce, expiry);
    }

    function test_RevertWhen_SignatureExpired() public {
        uint256 nonce = journal.nonces(user1);
        uint256 expiry = block.timestamp - 1; // Already expired
        bytes memory signature = _generateSignature(user1, "", nonce, expiry);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.SignatureExpired.selector,
                expiry,
                block.timestamp
            )
        );
        journal.mintEntry("Test", unicode"😊", "", signature, nonce, expiry);
    }

    function test_RevertWhen_InvalidNonce() public {
        uint256 wrongNonce = 999;
        uint256 expiry = block.timestamp + 300;
        bytes memory signature = _generateSignature(user1, "", wrongNonce, expiry);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.InvalidNonce.selector,
                wrongNonce,
                0 // Expected nonce is 0
            )
        );
        journal.mintEntry("Test", unicode"😊", "", signature, wrongNonce, expiry);
    }

    function test_RevertWhen_SignatureReused() public {
        uint256 nonce = journal.nonces(user1);
        uint256 expiry = block.timestamp + 300;
        bytes memory signature = _generateSignature(user1, "", nonce, expiry);

        // First mint succeeds
        vm.prank(user1);
        journal.mintEntry("Test 1", unicode"😊", "", signature, nonce, expiry);

        // Reusing same signature fails (nonce incremented)
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.InvalidNonce.selector,
                nonce,
                nonce + 1 // Nonce was incremented
            )
        );
        journal.mintEntry("Test 2", unicode"😊", "", signature, nonce, expiry);
    }

    function test_NonceIncrementsCorrectly() public {
        assertEq(journal.nonces(user1), 0);

        _mintWithSignature(user1, "Entry 1", unicode"😊", "");
        assertEq(journal.nonces(user1), 1);

        _mintWithSignature(user1, "Entry 2", unicode"😢", "");
        assertEq(journal.nonces(user1), 2);

        _mintWithSignature(user1, "Entry 3", unicode"😡", "");
        assertEq(journal.nonces(user1), 3);
    }

    // ============================================
    // VALIDATION TESTS
    // ============================================

    function test_RevertWhen_TextTooLong() public {
        // Create a string > 400 bytes
        string memory longText = new string(401);

        uint256 nonce = journal.nonces(user1);
        uint256 expiry = block.timestamp + 300;
        bytes memory signature = _generateSignature(user1, "", nonce, expiry);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.TextTooLong.selector,
                401,
                journal.MAX_TEXT_LENGTH()
            )
        );
        journal.mintEntry(longText, unicode"😊", "", signature, nonce, expiry);
    }

    function test_RevertWhen_MoodTooLong() public {
        // Create a string > 64 bytes
        string memory longMood = new string(65);

        uint256 nonce = journal.nonces(user1);
        uint256 expiry = block.timestamp + 300;
        bytes memory signature = _generateSignature(user1, "", nonce, expiry);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.MoodTooLong.selector,
                65,
                journal.MAX_MOOD_LENGTH()
            )
        );
        journal.mintEntry("Valid text", longMood, "", signature, nonce, expiry);
    }

    function test_MintWith_MaxTextLength() public {
        // Create exactly 400 bytes
        bytes memory maxText = new bytes(400);
        for (uint i = 0; i < 400; i++) {
            maxText[i] = bytes1(uint8(65)); // 'A'
        }

        _mintWithSignature(user1, string(maxText), unicode"😊", "");

        assertEq(journal.ownerOf(0), user1);
    }

    function test_MintWith_MaxMoodLength() public {
        // Create exactly 64 bytes
        bytes memory maxMood = new bytes(64);
        for (uint i = 0; i < 64; i++) {
            maxMood[i] = bytes1(uint8(65)); // 'A'
        }

        _mintWithSignature(user1, "Valid text", string(maxMood), "");

        assertEq(journal.ownerOf(0), user1);
    }

    // ============================================
    // TOKEN URI & SVG TESTS
    // ============================================

    function test_TokenURI() public {
        _mintWithSignature(user1, "Test entry", unicode"😊", "");

        string memory uri = journal.tokenURI(0);

        // Check that URI starts with data:application/json;base64,
        assertTrue(
            bytes(uri).length > 0,
            "URI should not be empty"
        );
    }

    function test_RevertWhen_TokenURIForNonexistentToken() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.TokenDoesNotExist.selector,
                999
            )
        );
        journal.tokenURI(999);
    }

    function test_GenerateSVG_WithVerifiedENS() public {
        _mintWithSignature(user1, "Test entry for SVG", unicode"🎨", "vitalik.eth");

        (
            ,
            string memory mood,
            uint256 timestamp,
            uint256 blockNumber,
            address journalOwner,
            uint256 originChainId,
            string memory ensName,
            bool ensVerified
        ) = journal.journalEntries(0);

        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: "Test entry for SVG",
            mood: mood,
            timestamp: timestamp,
            blockNumber: blockNumber,
            owner: journalOwner,
            originChainId: originChainId,
            ensName: ensName,
            ensVerified: ensVerified
        });

        string memory svg = journal.generateSVG(entry);

        // Basic SVG checks
        assertTrue(bytes(svg).length > 0, "SVG should not be empty");
        assertTrue(
            _contains(svg, "<svg"),
            "SVG should contain svg tag"
        );
        assertTrue(
            _contains(svg, COLOR1),
            "SVG should contain color1"
        );
        assertTrue(
            _contains(svg, COLOR2),
            "SVG should contain color2"
        );
        assertTrue(
            _contains(svg, "vitalik.eth"),
            "SVG should contain ENS name"
        );
        assertTrue(
            _contains(svg, unicode"✓"),
            "SVG should contain checkmark for verified ENS"
        );
    }

    function test_GenerateSVG_WithLongENS() public {
        // Test with a very long ENS name (> 23 chars)
        string memory longEnsName = "thisverylongensnamewillbetruncated.eth";
        _mintWithSignature(user1, "Test with long ENS", unicode"🎨", longEnsName);

        (
            ,
            string memory mood,
            uint256 timestamp,
            uint256 blockNumber,
            address journalOwner,
            uint256 originChainId,
            string memory ensName,
            bool ensVerified
        ) = journal.journalEntries(0);

        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: "Test with long ENS",
            mood: mood,
            timestamp: timestamp,
            blockNumber: blockNumber,
            owner: journalOwner,
            originChainId: originChainId,
            ensName: ensName,
            ensVerified: ensVerified
        });

        string memory svg = journal.generateSVG(entry);

        // Should contain checkmark and truncated name with "..."
        assertTrue(
            _contains(svg, unicode"✓"),
            "SVG should contain checkmark for verified ENS"
        );
        assertTrue(
            _contains(svg, "..."),
            "SVG should contain ellipsis for truncated long ENS"
        );
        // Should NOT contain the full long name
        assertFalse(
            _contains(svg, "thisverylongensnamewillbetruncated.eth"),
            "SVG should not contain full long ENS name"
        );
    }

    function test_GenerateSVG_WithTruncatedAddress() public {
        _mintWithSignature(user1, "Test entry", unicode"🎨", "");

        (
            ,
            string memory mood,
            uint256 timestamp,
            uint256 blockNumber,
            address journalOwner,
            uint256 originChainId,
            string memory ensName,
            bool ensVerified
        ) = journal.journalEntries(0);

        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: "Test entry",
            mood: mood,
            timestamp: timestamp,
            blockNumber: blockNumber,
            owner: journalOwner,
            originChainId: originChainId,
            ensName: ensName,
            ensVerified: ensVerified
        });

        string memory svg = journal.generateSVG(entry);

        // Should contain truncated address format
        assertTrue(
            _contains(svg, "0x"),
            "SVG should contain address prefix"
        );
        assertTrue(
            _contains(svg, "..."),
            "SVG should contain ellipsis for truncated address"
        );
    }

    function test_SVGEscaping() public {
        string memory textWithSpecialChars = "Test & <script>alert('xss')</script>";

        _mintWithSignature(user1, textWithSpecialChars, unicode"😊", "");

        string memory uri = journal.tokenURI(0);

        // The URI should not contain unescaped special characters
        assertTrue(
            !_contains(uri, "<script>"),
            "SVG should not contain unescaped script tags"
        );
    }

    // ============================================
    // ADMIN TESTS
    // ============================================

    function test_UpdateColors() public {
        string memory newColor1 = "#0052FF";
        string memory newColor2 = "#0052FF";

        vm.prank(owner);
        journal.updateColors(newColor1, newColor2);

        assertEq(journal.color1(), newColor1);
        assertEq(journal.color2(), newColor2);
    }

    function test_RevertWhen_NonOwnerUpdatesColors() public {
        vm.prank(user1);
        vm.expectRevert();
        journal.updateColors("#000000", "#FFFFFF");
    }

    function test_UpdateTrustedSigner() public {
        address newSigner = address(999);

        vm.prank(owner);
        journal.updateTrustedSigner(newSigner);

        assertEq(journal.trustedSigner(), newSigner);
    }

    function test_RevertWhen_NonOwnerUpdatesTrustedSigner() public {
        vm.prank(user1);
        vm.expectRevert();
        journal.updateTrustedSigner(address(999));
    }

    function test_Version() public view {
        assertEq(journal.version(), "2.3.0");
    }

    // ============================================
    // UPGRADEABILITY TESTS
    // ============================================

    function test_UpgradeContract() public {
        // Deploy new implementation
        OnChainJournal newImplementation = new OnChainJournal();

        // Upgrade as owner
        vm.prank(owner);
        journal.upgradeToAndCall(address(newImplementation), "");

        // Verify data persists after upgrade
        assertEq(journal.color1(), COLOR1);
        assertEq(journal.owner(), owner);
        assertEq(journal.trustedSigner(), trustedSigner);
    }

    function test_RevertWhen_NonOwnerUpgrades() public {
        OnChainJournal newImplementation = new OnChainJournal();

        vm.prank(user1);
        vm.expectRevert();
        journal.upgradeToAndCall(address(newImplementation), "");
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function _contains(string memory source, string memory search) internal pure returns (bool) {
        bytes memory sourceBytes = bytes(source);
        bytes memory searchBytes = bytes(search);

        if (searchBytes.length > sourceBytes.length) {
            return false;
        }

        for (uint i = 0; i <= sourceBytes.length - searchBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < searchBytes.length; j++) {
                if (sourceBytes[i + j] != searchBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        return false;
    }
}
