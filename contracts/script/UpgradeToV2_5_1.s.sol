// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/OnChainJournal.sol";

/**
 * @title UpgradeToV2_5_1
 * @notice Upgrade script for V2.5.1 - SVG closing tag fix
 * @dev Fixes mismatched </g> closing tags that broke SVG rendering
 *      Also fixes case-sensitivity for chain names (Ink vs INK, etc.)
 *
 * Usage:
 *   BOB:  PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_1.s.sol --rpc-url https://bob-sepolia.rpc.gobob.xyz --broadcast
 *   INK:  PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_1.s.sol --rpc-url https://rpc-gel-sepolia.inkonchain.com --broadcast
 *   BASE: PROXY_ADDRESS=0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 forge script script/UpgradeToV2_5_1.s.sol --rpc-url https://sepolia.base.org --broadcast
 */
contract UpgradeToV2_5_1 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy new implementation
        OnChainJournal newImplementation = new OnChainJournal();
        console.log("New implementation deployed at:", address(newImplementation));
        console.log("Version:", newImplementation.version());

        // 2. Upgrade proxy to new implementation
        OnChainJournal journal = OnChainJournal(proxyAddress);
        journal.upgradeToAndCall(address(newImplementation), "");
        console.log("Proxy upgraded to new implementation (V2.5.1)");

        vm.stopBroadcast();
    }
}
