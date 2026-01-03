// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/OnChainJournal.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title DeployOnChainJournal
 * @notice Deployment script for On-Chain Journal V1 with UUPS proxy pattern
 * @dev Usage:
 *   1. Set up environment variables in .env file
 *   2. Deploy to Anvil (local): forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal --rpc-url anvil --broadcast
 *   3. Deploy to testnet: forge script script/DeployOnChainJournal.s.sol:DeployOnChainJournal --rpc-url base_sepolia --broadcast --verify
 *
 * V1 Scope: Base, Bob, and Ink (single-chain NFTs)
 * V2 will add: Cross-chain bridging via LayerZero ONFT
 *
 * Chain-specific configurations:
 * - Base: Blue (#0052FF)
 * - Bob: Orange gradient (#FF6B35 → #F7931E)
 * - Ink: Purple (#5848d5 → #0d0c52)
 */
contract DeployOnChainJournal is Script {
    // Chain-specific color configurations
    struct ChainConfig {
        string color1;
        string color2;
        string name;
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        // Get chain-specific configuration
        ChainConfig memory config = getChainConfig();

        console.log("Chain Name:", config.name);
        console.log("Color 1:", config.color1);
        console.log("Color 2:", config.color2);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy implementation contract
        console.log("\n1. Deploying implementation...");
        OnChainJournal implementation = new OnChainJournal();
        console.log("Implementation deployed at:", address(implementation));

        // 2. Encode initialization data
        bytes memory initData = abi.encodeWithSelector(
            OnChainJournal.initialize.selector,
            config.color1,
            config.color2,
            config.name,
            deployer // owner
        );

        // 3. Deploy proxy
        console.log("\n2. Deploying proxy...");
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        console.log("Proxy deployed at:", address(proxy));

        // 4. Get proxy instance
        OnChainJournal journal = OnChainJournal(address(proxy));

        vm.stopBroadcast();

        // 5. Verify deployment
        console.log("\n=== Deployment Summary ===");
        console.log("Chain:", config.name);
        console.log("Implementation:", address(implementation));
        console.log("Proxy:", address(proxy));
        console.log("Owner:", journal.owner());
        console.log("Name:", journal.name());
        console.log("Symbol:", journal.symbol());
        console.log("Version:", journal.version());
        console.log("Color 1:", journal.color1());
        console.log("Color 2:", journal.color2());
        console.log("Chain Name:", journal.chainName());
        console.log("==========================\n");

        // 6. Note: Deployment info will be saved manually
        console.log("\nIMPORTANT: Save these addresses to your .env file:");
        console.log("JOURNAL_PROXY_ADDRESS=", address(proxy));
        console.log("JOURNAL_IMPL_ADDRESS=", address(implementation));
    }

    /**
     * @notice Gets chain-specific configuration based on chain ID
     * @return config Chain configuration with colors and name
     */
    function getChainConfig() internal view returns (ChainConfig memory config) {
        uint256 chainId = block.chainid;

        // Base Sepolia (84532)
        if (chainId == 84532) {
            config.color1 = "#0052FF";
            config.color2 = "#0052FF";
            config.name = "Base";
        }
        // Base Mainnet (8453)
        else if (chainId == 8453) {
            config.color1 = "#0052FF";
            config.color2 = "#0052FF";
            config.name = "Base";
        }
        // Bob Testnet/Sepolia (808813 or 111)
        else if (chainId == 111 || chainId == 808813) {
            config.color1 = "#FF6B35";
            config.color2 = "#F7931E";
            config.name = "Bob";
        }
        // Bob Mainnet (60808)
        else if (chainId == 60808) {
            config.color1 = "#FF6B35";
            config.color2 = "#F7931E";
            config.name = "Bob";
        }
        // Ink Sepolia (763373)
        else if (chainId == 763373) {
            config.color1 = "#5848d5";
            config.color2 = "#0d0c52";
            config.name = "Ink";
        }
        // Ink Mainnet (57073)
        else if (chainId == 57073) {
            config.color1 = "#5848d5";
            config.color2 = "#0d0c52";
            config.name = "Ink";
        }
        // MegaETH Testnet (6342)
        else if (chainId == 6342) {
            config.color1 = "#111";
            config.color2 = "#AAA";
            config.name = "MegaETH";
        }
        // HyperLiquid Testnet (998)
        else if (chainId == 998) {
            config.color1 = "#0F2925";
            config.color2 = "#8DFADF";
            config.name = "HyperLiquid";
        }
        // Anvil (local)
        else if (chainId == 31337) {
            config.color1 = "#FF6B35";
            config.color2 = "#F7931E";
            config.name = "Anvil (Bob colors)";
        }
        // Default/Unknown chain - use Bob colors
        else {
            console.log("WARNING: Unknown chain ID, using default Bob colors");
            config.color1 = "#FF6B35";
            config.color2 = "#F7931E";
            config.name = string(abi.encodePacked("Unknown-", vm.toString(chainId)));
        }

        return config;
    }
}
