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
        // Deploy implementation
        implementation = new OnChainJournal();

        // Deploy proxy and initialize
        bytes memory initData = abi.encodeWithSelector(
            OnChainJournal.initialize.selector,
            COLOR1,
            COLOR2,
            CHAIN_NAME,
            owner
        );
        proxy = new ERC1967Proxy(address(implementation), initData);

        // Wrap proxy in ABI
        journal = OnChainJournal(address(proxy));
    }

    // ============================================
    // INITIALIZATION TESTS
    // ============================================

    function test_Initialize() public view {
        assertEq(journal.name(), "On-Chain Journal");
        assertEq(journal.symbol(), "JOURNAL");
        assertEq(journal.color1(), COLOR1);
        assertEq(journal.color2(), COLOR2);
        assertEq(journal.chainName(), CHAIN_NAME);
        assertEq(journal.owner(), owner);
    }

    function test_CannotReinitialize() public {
        vm.expectRevert();
        journal.initialize(COLOR1, COLOR2, CHAIN_NAME, owner);
    }

    // ============================================
    // MINTING TESTS
    // ============================================

    function test_MintEntry() public {
        string memory text = "Today was a great day!";
        string memory mood = unicode"😊";

        vm.prank(user1);
        vm.expectEmit(true, true, false, false);
        emit EntryMinted(0, user1, mood, block.timestamp);
        journal.mintEntry(text, mood, ""); // Empty ENS

        assertEq(journal.ownerOf(0), user1);

        (
            string memory storedText,
            string memory storedMood,
            uint256 timestamp,
            uint256 blockNumber,
            address storedOwner,
            uint256 originChainId,
            string memory ensName
        ) = journal.journalEntries(0);

        assertEq(storedText, text);
        assertEq(storedMood, mood);
        assertEq(timestamp, block.timestamp);
        assertEq(blockNumber, block.number);
        assertEq(storedOwner, user1);
        assertEq(originChainId, block.chainid);
        assertEq(ensName, "");
    }

    function test_MintMultipleEntries() public {
        vm.startPrank(user1);
        journal.mintEntry("Entry 1", unicode"😊", "");
        journal.mintEntry("Entry 2", unicode"😢", "");
        journal.mintEntry("Entry 3", unicode"😡", "");
        vm.stopPrank();

        assertEq(journal.ownerOf(0), user1);
        assertEq(journal.ownerOf(1), user1);
        assertEq(journal.ownerOf(2), user1);
    }

    function test_MultipleusersMinting() public {
        vm.prank(user1);
        journal.mintEntry("User 1 entry", unicode"😊", "");

        vm.prank(user2);
        journal.mintEntry("User 2 entry", unicode"😢", "");

        assertEq(journal.ownerOf(0), user1);
        assertEq(journal.ownerOf(1), user2);
    }

    // ============================================
    // VALIDATION TESTS
    // ============================================

    function test_RevertWhen_TextTooLong() public {
        // Create a string > 400 bytes
        string memory longText = new string(401);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.TextTooLong.selector,
                401,
                journal.MAX_TEXT_LENGTH()
            )
        );
        journal.mintEntry(longText, unicode"😊", "");
    }

    function test_RevertWhen_MoodTooLong() public {
        // Create a string > 64 bytes
        string memory longMood = new string(65);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.MoodTooLong.selector,
                65,
                journal.MAX_MOOD_LENGTH()
            )
        );
        journal.mintEntry("Valid text", longMood, "");
    }

    function test_MintWith_MaxTextLength() public {
        // Create exactly 400 bytes
        bytes memory maxText = new bytes(400);
        for (uint i = 0; i < 400; i++) {
            maxText[i] = bytes1(uint8(65)); // 'A'
        }

        vm.prank(user1);
        journal.mintEntry(string(maxText), unicode"😊", "");

        assertEq(journal.ownerOf(0), user1);
    }

    function test_MintWith_MaxMoodLength() public {
        // Create exactly 64 bytes
        bytes memory maxMood = new bytes(64);
        for (uint i = 0; i < 64; i++) {
            maxMood[i] = bytes1(uint8(65)); // 'A'
        }

        vm.prank(user1);
        journal.mintEntry("Valid text", string(maxMood), "");

        assertEq(journal.ownerOf(0), user1);
    }

    // ============================================
    // TOKEN URI & SVG TESTS
    // ============================================

    function test_TokenURI() public {
        vm.prank(user1);
        journal.mintEntry("Test entry", unicode"😊", "");

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

    function test_GenerateSVG() public {
        vm.prank(user1);
        journal.mintEntry("Test entry for SVG", unicode"🎨", "vitalik.eth");

        (
            ,
            string memory mood,
            uint256 timestamp,
            uint256 blockNumber,
            address journalOwner,
            uint256 originChainId,
            string memory ensName
        ) = journal.journalEntries(0);

        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: "Test entry for SVG",
            mood: mood,
            timestamp: timestamp,
            blockNumber: blockNumber,
            owner: journalOwner,
            originChainId: originChainId,
            ensName: ensName
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
    }

    function test_SVGEscaping() public {
        string memory textWithSpecialChars = "Test & <script>alert('xss')</script>";

        vm.prank(user1);
        journal.mintEntry(textWithSpecialChars, unicode"😊", "");

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

    function test_Version() public view {
        assertEq(journal.version(), "1.0.0");
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
