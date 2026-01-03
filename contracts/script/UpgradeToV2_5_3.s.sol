// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/OnChainJournal.sol";

/**
 * @title UpgradeToV2_5_3
 * @notice Upgrade script for V2.5.3 - Critical Security Fixes
 * @dev Security improvements:
 *      - Fixed Checks-Effects-Interactions violation in mintEntry()
 *        (state now updated before _safeMint to prevent reentrancy issues)
 *      - Added storage gap (50 slots) to prevent storage collisions in future upgrades
 *      - Ensures composability with marketplaces and indexers
 *
 * Changes:
 *      - mintEntry() now writes journalEntries[tokenId] BEFORE calling _safeMint()
 *      - Added uint256[50] private __gap at end of contract
 *
 * Usage:
 *   Testnets:
 *   BASE SEPOLIA: PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_3.s.sol --rpc-url base-sepolia --broadcast --verify --slow
 *   BOB TESTNET:  PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_3.s.sol --rpc-url bob-testnet --broadcast --verify --slow
 *   INK SEPOLIA:  PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_3.s.sol --rpc-url ink-sepolia --broadcast --slow
 *
 *   Mainnets:
 *   BASE:         PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_3.s.sol --rpc-url base --broadcast --verify --slow
 *   BOB:          PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_3.s.sol --rpc-url bob --broadcast --verify --slow
 *   INK:          PROXY_ADDRESS=0xd2e8cb55cb91EC7d111eA187415f309Ba5DaBE8B forge script script/UpgradeToV2_5_3.s.sol --rpc-url ink --broadcast --slow
 */
contract UpgradeToV2_5_3 is Script {
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
        console.log("Proxy upgraded to new implementation (V2.5.3)");

        // 3. Verify version
        console.log("Current version on proxy:", journal.version());

        vm.stopBroadcast();
    }
}
