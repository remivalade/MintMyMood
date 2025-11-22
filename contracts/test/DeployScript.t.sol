// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../script/DeployOnChainJournal.s.sol";

contract DeployScriptTest is Test, DeployOnChainJournal {
    function test_ChainConfigs() public {
        // Test Ink Sepolia
        vm.chainId(763373);
        ChainConfig memory config = getChainConfig();
        assertEq(config.name, "Ink");
        assertEq(config.color1, "#5848d5");
        assertEq(config.color2, "#0d0c52");

        // Test MegaETH Testnet
        vm.chainId(6342);
        config = getChainConfig();
        assertEq(config.name, "MegaETH");
        assertEq(config.color1, "#111");
        assertEq(config.color2, "#AAA");

        // Test HyperLiquid Testnet
        vm.chainId(998);
        config = getChainConfig();
        assertEq(config.name, "HyperLiquid");
        assertEq(config.color1, "#0F2925");
        assertEq(config.color2, "#8DFADF");

        // Test Base Sepolia (Existing)
        vm.chainId(84532);
        config = getChainConfig();
        assertEq(config.name, "Base");
        assertEq(config.color1, "#0052FF");
    }
}
