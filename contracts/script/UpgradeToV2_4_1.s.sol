// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/OnChainJournal.sol";

contract UpgradeToV2_4_1 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy new implementation
        OnChainJournal newImplementation = new OnChainJournal();
        
        console.log("New implementation deployed at:", address(newImplementation));
        console.log("Version:", newImplementation.version());
        
        vm.stopBroadcast();
    }
}
