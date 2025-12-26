// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/OnChainJournal.sol";

/**
 * @title UpgradeToV2_5_2
 * @notice Upgrade script for V2.5.2 - SVG Optimization Release
 * @dev Optimizations:
 *      - Shortened chain-specific IDs (g1-base, g1-bob, c-ink, etc.)
 *      - Optimized _escapeString with exact memory allocation
 *      - Added _toLowercase helper for consistent chain ID generation
 *      - ~50% reduction in ID lengths
 *      - Prevents ID conflicts in multi-chain gallery displays
 *
 * Usage:
 *   BASE: PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_2.s.sol --rpc-url https://sepolia.base.org --broadcast --verify
 *   BOB:  PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_2.s.sol --rpc-url https://bob-sepolia.rpc.gobob.xyz --broadcast --verify
 *   INK:  PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_2.s.sol --rpc-url https://rpc-gel-sepolia.inkonchain.com --broadcast --verify
 */
contract UpgradeToV2_5_2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy new implementation
        OnChainJournal newImplementation = new OnChainJournal();
        console.log("New implementation deployed at:", address(newImplementation));
        console.log("Version:", newImplementation.version());

        // 2. Upgrade proxy to new implementation
        OnChainJournal journal = OnChainJournal(proxyAddress);
        journal.upgradeToAndCall(address(newImplementation), "");
        console.log("Proxy upgraded to new implementation (V2.5.2)");

        vm.stopBroadcast();
    }
}
