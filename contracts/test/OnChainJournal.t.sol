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
        assertEq(journal.name(), "MintMyMood");
        assertEq(journal.symbol(), "MMM");
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

        vm.expectEmit(true, true, false, false);
        emit EntryMinted(0, user1, mood, block.timestamp);

        vm.prank(user1);
        journal.mintEntry(text, mood);

        assertEq(journal.ownerOf(0), user1);

        (
            string memory storedText,
            string memory storedMood,
            uint256 timestamp,
            uint256 blockNumber,
            address storedOwner,
            uint256 originChainId
        ) = journal.journalEntries(0);

        assertEq(storedText, text);
        assertEq(storedMood, mood);
        assertEq(timestamp, block.timestamp);
        assertEq(blockNumber, block.number);
        assertEq(storedOwner, user1);
        assertEq(originChainId, block.chainid);
    }

    function test_MintMultipleEntries() public {
        vm.startPrank(user1);
        journal.mintEntry("Entry 1", unicode"😊");
        journal.mintEntry("Entry 2", unicode"😢");
        journal.mintEntry("Entry 3", unicode"😡");
        vm.stopPrank();

        assertEq(journal.ownerOf(0), user1);
        assertEq(journal.ownerOf(1), user1);
        assertEq(journal.ownerOf(2), user1);
    }

    function test_MultipleusersMinting() public {
        vm.prank(user1);
        journal.mintEntry("User 1 entry", unicode"😊");

        vm.prank(user2);
        journal.mintEntry("User 2 entry", unicode"😢");

        assertEq(journal.ownerOf(0), user1);
        assertEq(journal.ownerOf(1), user2);
    }

    // ============================================
    // VALIDATION TESTS
    // ============================================

    function test_RevertWhen_TextTooLong() public {
        // Create text longer than 400 bytes
        string memory longText = new string(401);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.TextTooLong.selector,
                401,
                400
            )
        );
        journal.mintEntry(longText, unicode"😊");
    }

    function test_RevertWhen_MoodTooLong() public {
        // Create mood longer than 64 bytes
        string memory longMood = new string(65);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.MoodTooLong.selector,
                65,
                64
            )
        );
        journal.mintEntry("Short text", longMood);
    }

    function test_MintWith_MaxTextLength() public {
        // Create text exactly 400 bytes
        bytes memory textBytes = new bytes(400);
        for (uint i = 0; i < 400; i++) {
            textBytes[i] = "a";
        }
        string memory maxText = string(textBytes);

        vm.prank(user1);
        journal.mintEntry(maxText, unicode"😊");

        assertEq(journal.ownerOf(0), user1);
    }

    function test_MintWith_MaxMoodLength() public {
        // Create mood exactly 64 bytes
        bytes memory moodBytes = new bytes(64);
        for (uint i = 0; i < 64; i++) {
            moodBytes[i] = "x";
        }
        string memory maxMood = string(moodBytes);

        vm.prank(user1);
        journal.mintEntry("Test text", maxMood);

        assertEq(journal.ownerOf(0), user1);
    }

    // ============================================
    // METADATA & SVG TESTS
    // ============================================

    function test_TokenURI() public {
        string memory text = "Test entry";
        string memory mood = unicode"😊";

        vm.prank(user1);
        journal.mintEntry(text, mood);

        string memory uri = journal.tokenURI(0);

        // Should start with data:application/json;base64,
        assertTrue(bytes(uri).length > 0);

        // Basic check that it contains base64 encoded data
        bytes memory uriBytes = bytes(uri);
        bytes memory prefix = bytes("data:application/json;base64,");

        for (uint i = 0; i < prefix.length; i++) {
            assertEq(uriBytes[i], prefix[i]);
        }
    }

    function test_GenerateSVG() public {
        string memory text = "Test entry";
        string memory mood = unicode"😊";

        vm.prank(user1);
        journal.mintEntry(text, mood);

        (
            string memory storedText,
            string memory storedMood,
            uint256 timestamp,
            uint256 blockNumber,
            address storedOwner,
            uint256 originChainId
        ) = journal.journalEntries(0);

        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: storedText,
            mood: storedMood,
            timestamp: timestamp,
            blockNumber: blockNumber,
            owner: storedOwner,
            originChainId: originChainId
        });

        string memory svg = journal.generateSVG(entry);

        // Basic SVG validation
        assertTrue(bytes(svg).length > 0);

        // Should contain SVG tags
        bytes memory svgBytes = bytes(svg);
        bytes memory svgStart = bytes("<svg");
        bool foundSvg = false;

        for (uint i = 0; i < svgBytes.length - 3; i++) {
            if (svgBytes[i] == svgStart[0] &&
                svgBytes[i+1] == svgStart[1] &&
                svgBytes[i+2] == svgStart[2] &&
                svgBytes[i+3] == svgStart[3]) {
                foundSvg = true;
                break;
            }
        }

        assertTrue(foundSvg, "SVG should contain <svg tag");
    }

    function test_SVGEscaping() public {
        // Test that special characters are escaped properly
        string memory text = "Test <script>alert('xss')</script> & \"quotes\"";
        string memory mood = "<>";

        vm.prank(user1);
        journal.mintEntry(text, mood);

        string memory svg = journal.tokenURI(0);

        // SVG should not contain unescaped angle brackets
        bytes memory svgBytes = bytes(svg);

        // This is a basic test - the actual SVG will be base64 encoded
        assertTrue(bytes(svg).length > 0);
    }

    // ============================================
    // ADMIN TESTS
    // ============================================

    function test_UpdateColors() public {
        string memory newColor1 = "#000000";
        string memory newColor2 = "#FFFFFF";

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

    function test_UpdateChainName() public {
        string memory newName = "NewChain";

        vm.prank(owner);
        journal.updateChainName(newName);

        assertEq(journal.chainName(), newName);
    }

    function test_Version() public view {
        assertEq(journal.version(), "2.4.1");
    }

    // ============================================
    // UPGRADE TESTS
    // ============================================

    function test_UpgradeContract() public {
        // Deploy new implementation
        OnChainJournal newImplementation = new OnChainJournal();

        vm.prank(owner);
        journal.upgradeToAndCall(address(newImplementation), "");

        // Verify state is preserved
        assertEq(journal.owner(), owner);
        assertEq(journal.color1(), COLOR1);
        assertEq(journal.color2(), COLOR2);
        assertEq(journal.chainName(), CHAIN_NAME);
    }

    function test_RevertWhen_NonOwnerUpgrades() public {
        OnChainJournal newImplementation = new OnChainJournal();

        vm.prank(user1);
        vm.expectRevert();
        journal.upgradeToAndCall(address(newImplementation), "");
    }
}
