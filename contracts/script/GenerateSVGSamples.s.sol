// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/OnChainJournal.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @notice Script to generate sample SVGs for visual testing
 * @dev Run with: forge script script/GenerateSVGSamples.s.sol
 */
contract GenerateSVGSamples is Script {

    function run() public {
        console.log("=== GENERATING SVG SAMPLES FOR ALL CHAINS ===\n");

        // Test all 4 chain styles
        _generateChainSamples("Base", "#0052FF", "#0066FF");
        _generateChainSamples("Bob", "#FF6B35", "#F7931E");
        _generateChainSamples("Ink", "#5D3FD3", "#5D3FD3");
        _generateClassicSamples();

        console.log("\n=== GENERATION COMPLETE ===");
        console.log("Copy the SVG output above into the HTML preview file");
    }

    function _generateChainSamples(
        string memory chainName,
        string memory color1,
        string memory color2
    ) internal {
        console.log("--- Chain:", chainName, "---\n");

        // Deploy implementation
        OnChainJournal implementation = new OnChainJournal();

        // Deploy proxy and initialize
        bytes memory initData = abi.encodeWithSelector(
            OnChainJournal.initialize.selector,
            color1,
            color2,
            chainName,
            msg.sender
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        OnChainJournal journal = OnChainJournal(address(proxy));

        // Short text
        _generateSample(
            journal,
            "Just shipped a new feature! Feeling accomplished.",
            unicode"🚀",
            0,
            string(abi.encodePacked(chainName, "_short"))
        );

        // Medium text with wrapping
        _generateSample(
            journal,
            "Today I learned about UUPS proxies and how they enable upgradeable smart contracts. The pattern is elegant but requires careful implementation to avoid security issues.",
            unicode"📚",
            0,
            string(abi.encodePacked(chainName, "_medium"))
        );

        // Special characters
        _generateSample(
            journal,
            "Testing special chars: <hello> & \"world\" & 'quotes' & symbols!",
            unicode"🧪",
            0,
            string(abi.encodePacked(chainName, "_special"))
        );

        console.log("");
    }

    function _generateClassicSamples() internal {
        console.log("--- Style: Classic ---\n");

        // Deploy implementation
        OnChainJournal implementation = new OnChainJournal();

        // Deploy proxy and initialize
        bytes memory initData = abi.encodeWithSelector(
            OnChainJournal.initialize.selector,
            "#0052FF",
            "#0066FF",
            "Base",
            msg.sender
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        OnChainJournal journal = OnChainJournal(address(proxy));

        // Short text, Classic style
        _generateSample(
            journal,
            "Grateful for the support from the community today.",
            unicode"❤️",
            1,
            "Classic_short"
        );

        // Medium text, Classic style
        _generateSample(
            journal,
            "Reflecting on the journey so far. Each challenge has been a learning opportunity, and I'm excited about what's ahead.",
            unicode"🌟",
            1,
            "Classic_medium"
        );

        // Long text, Classic style
        _generateSample(
            journal,
            "The morning started with a deep dive into Solidity gas optimization techniques. I discovered that using constants instead of state variables can save significant gas, and that abi.encodePacked is more efficient than string concatenation. Later, I worked on refactoring the SVG generation to reduce on-chain storage costs while maintaining visual quality.",
            unicode"⚡",
            1,
            "Classic_long"
        );

        console.log("");
    }

    function _generateSample(
        OnChainJournal journal,
        string memory text,
        string memory mood,
        uint8 styleId,
        string memory label
    ) internal view {
        OnChainJournal.JournalEntry memory entry = OnChainJournal.JournalEntry({
            text: text,
            mood: mood,
            timestamp: block.timestamp,
            blockNumber: block.number,
            owner: msg.sender,
            originChainId: block.chainid,
            styleId: styleId
        });

        string memory svg = journal.generateSVG(entry);

        console.log("<!-- START:", label, "-->");
        console.log(svg);
        console.log("<!-- END:", label, "-->\n");
    }
}
