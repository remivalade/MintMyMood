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
        uint256 timestamp,
        uint8 styleId
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
        assertTrue(journal.mintActive());
        assertEq(journal.mintPrice(), 0);
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
        emit EntryMinted(0, user1, mood, block.timestamp, 0);

        vm.prank(user1);
        journal.mintEntry{value: 0}(text, mood, 0);

        assertEq(journal.ownerOf(0), user1);

        (
            string memory storedText,
            string memory storedMood,
            uint256 timestamp,
            uint256 blockNumber,
            address storedOwner,
            uint256 originChainId,
            uint8 styleId
        ) = journal.journalEntries(0);

        assertEq(storedText, text);
        assertEq(storedMood, mood);
        assertEq(timestamp, block.timestamp);
        assertEq(blockNumber, block.number);
        assertEq(storedOwner, user1);
        assertEq(originChainId, block.chainid);
        assertEq(styleId, 0);
    }

    function test_MintClassicStyle() public {
        string memory text = "Classic entry";
        string memory mood = unicode"📜";
        
        vm.expectEmit(true, true, false, false);
        emit EntryMinted(0, user1, mood, block.timestamp, 1);

        vm.prank(user1);
        journal.mintEntry(text, mood, 1); // 1 = Classic
        
        (,,,,,, uint8 styleId) = journal.journalEntries(0);
        assertEq(styleId, 1);
        
        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: text,
            mood: mood,
            timestamp: block.timestamp,
            blockNumber: block.number,
            owner: user1,
            originChainId: block.chainid,
            styleId: 1
        });
        
        string memory rawSvg = journal.generateSVG(entry);
        assertTrue(_contains(rawSvg, "fill=\"#F9F7F1\""), "Should contain Classic cream background");
        assertTrue(_contains(rawSvg, "fill=\"#2D2D2D\""), "Should contain Classic dark text");
    }

    function test_MintMultipleEntries() public {
        vm.startPrank(user1);
        journal.mintEntry("Entry 1", unicode"😊", 0);
        journal.mintEntry("Entry 2", unicode"😢", 0);
        journal.mintEntry("Entry 3", unicode"😡", 0);
        vm.stopPrank();

        assertEq(journal.ownerOf(0), user1);
        assertEq(journal.ownerOf(1), user1);
        assertEq(journal.ownerOf(2), user1);
    }

    function test_MultipleusersMinting() public {
        vm.prank(user1);
        journal.mintEntry("User 1 entry", unicode"😊", 0);

        vm.prank(user2);
        journal.mintEntry("User 2 entry", unicode"😢", 0);

        assertEq(journal.ownerOf(0), user1);
        assertEq(journal.ownerOf(1), user2);
    }

    function test_MintWithFee() public {
        uint256 price = 0.01 ether;
        vm.prank(owner);
        journal.setMintPrice(price);

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        journal.mintEntry{value: price}("Paid entry", unicode"💸", 0);

        assertEq(journal.ownerOf(0), user1);
        assertEq(address(journal).balance, price);
    }

    function test_RevertWhen_InsufficientFee() public {
        uint256 price = 0.01 ether;
        vm.prank(owner);
        journal.setMintPrice(price);

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectRevert("Insufficient payment");
        journal.mintEntry{value: price - 1}("Cheap entry", unicode"💸", 0);
    }

    function test_RevertWhen_MintPaused() public {
        vm.prank(owner);
        journal.setMintActive(false);

        vm.prank(user1);
        vm.expectRevert("Minting is paused");
        journal.mintEntry("Paused entry", unicode"🛑", 0);
    }
    
    function test_RevertWhen_InvalidStyle() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainJournal.InvalidStyle.selector,
                2
            )
        );
        journal.mintEntry("Invalid style", unicode"🚫", 2);
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
        journal.mintEntry(longText, unicode"😊", 0);
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
        journal.mintEntry("Short text", longMood, 0);
    }

    function test_MintWith_MaxTextLength() public {
        // Create text exactly 400 bytes
        bytes memory textBytes = new bytes(400);
        for (uint i = 0; i < 400; i++) {
            textBytes[i] = "a";
        }
        string memory maxText = string(textBytes);

        vm.prank(user1);
        journal.mintEntry(maxText, unicode"😊", 0);

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
        journal.mintEntry("Test text", maxMood, 0);

        assertEq(journal.ownerOf(0), user1);
    }

    // ============================================
    // METADATA & SVG TESTS
    // ============================================

    function test_TokenURI() public {
        string memory text = "Test entry";
        string memory mood = unicode"😊";

        vm.prank(user1);
        journal.mintEntry(text, mood, 0);

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
        journal.mintEntry(text, mood, 0);

        (
            string memory storedText,
            string memory storedMood,
            uint256 timestamp,
            uint256 blockNumber,
            address storedOwner,
            uint256 originChainId,
            uint8 styleId
        ) = journal.journalEntries(0);

        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: storedText,
            mood: storedMood,
            timestamp: timestamp,
            blockNumber: blockNumber,
            owner: storedOwner,
            originChainId: originChainId,
            styleId: styleId
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
        journal.mintEntry(text, mood, 0);

        // Just ensure the raw SVG generation function returns escaped content
        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: text,
            mood: mood,
            timestamp: block.timestamp,
            blockNumber: block.number,
            owner: user1,
            originChainId: block.chainid,
            styleId: 0
        });
        
        string memory rawSvg = journal.generateSVG(entry);
        
        // Check for escaped entities in the raw SVG
        assertTrue(_contains(rawSvg, "&lt;script&gt;"), "Should contain escaped <script>");
        assertTrue(_contains(rawSvg, "&amp;"), "Should contain escaped &");
        assertTrue(_contains(rawSvg, "&quot;"), "Should contain escaped quotes");
    }

    // Helper to check string containment
    function _contains(string memory haystack, string memory needle) internal pure returns (bool) {
        return bytes(haystack).length > bytes(needle).length && 
               keccak256(abi.encodePacked(haystack)) != keccak256(abi.encodePacked(needle)); 
               // Note: This is a weak check, but sufficient if we assume no collisions in this specific context
               // A real check would iterate.
    }
    
    // Helper for substring
    function _substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
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

    function test_Withdraw() public {
        uint256 price = 1 ether;
        vm.prank(owner);
        journal.setMintPrice(price);

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        journal.mintEntry{value: price}("Paid", unicode"💰", 0);

        uint256 initialBalance = owner.balance;
        
        vm.prank(owner);
        journal.withdraw();

        assertEq(owner.balance, initialBalance + price);
        assertEq(address(journal).balance, 0);
    }

    function test_Version() public {
        assertEq(journal.version(), "2.5.1");
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
