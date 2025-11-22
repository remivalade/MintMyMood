// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/OnChainJournal.sol";

contract UpgradeToV2_5_0 is Script {
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
        console.log("Proxy upgraded to new implementation (V2.5.0)");
        
        vm.stopBroadcast();
    }
}
