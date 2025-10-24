// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/OnChainJournal.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title UpgradeToV2
 * @notice Upgrade script for On-Chain Journal V1 → V2
 * @dev V2 adds ENS signature verification with ECDSA
 *
 * Usage:
 *   forge script script/UpgradeToV2.s.sol:UpgradeToV2 --rpc-url base_sepolia --broadcast --verify
 *
 * V2 Changes:
 * - Added trustedSigner for ENS verification
 * - Added nonces mapping for replay protection
 * - Updated mintEntry to require signature
 * - Added ensVerified field to JournalEntry
 * - Version bumped to 2.0.0
 *
 * IMPORTANT: Set TRUSTED_SIGNER in .env before running
 */
contract UpgradeToV2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Get trusted signer address from environment
        address trustedSigner = vm.envAddress("TRUSTED_SIGNER");

        console.log("========================================");
        console.log("Upgrading On-Chain Journal to V2.0.0");
        console.log("========================================");
        console.log("Deployer:", deployer);
        console.log("Trusted Signer:", trustedSigner);
        console.log("Chain ID:", block.chainid);

        // Get proxy address based on chain
        address proxyAddress = getProxyAddress();
        console.log("Proxy Address:", proxyAddress);

        // Connect to existing proxy
        OnChainJournal journal = OnChainJournal(proxyAddress);

        // Verify we're connected to the right contract
        console.log("\nCurrent Contract State:");
        console.log("- Owner:", journal.owner());
        console.log("- Version:", journal.version());
        console.log("- Chain Name:", journal.chainName());

        require(journal.owner() == deployer, "Deployer is not the owner");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy new implementation
        console.log("\n1. Deploying new implementation (V2)...");
        OnChainJournal newImplementation = new OnChainJournal();
        console.log("New Implementation deployed at:", address(newImplementation));

        // 2. Upgrade the proxy
        console.log("\n2. Upgrading proxy...");
        journal.upgradeToAndCall(address(newImplementation), "");
        console.log("Proxy upgraded successfully!");

        // 3. Set the trusted signer
        console.log("\n3. Setting trusted signer...");
        journal.updateTrustedSigner(trustedSigner);
        console.log("Trusted signer set to:", trustedSigner);

        vm.stopBroadcast();

        // 4. Verify upgrade
        console.log("\n=== Upgrade Verification ===");
        console.log("Proxy:", proxyAddress);
        console.log("New Implementation:", address(newImplementation));
        console.log("Version:", journal.version());
        console.log("Trusted Signer:", journal.trustedSigner());
        console.log("Owner:", journal.owner());
        console.log("Chain Name:", journal.chainName());
        console.log("Color 1:", journal.color1());
        console.log("Color 2:", journal.color2());
        console.log("============================\n");

        // Verify version is 2.0.0
        require(
            keccak256(bytes(journal.version())) == keccak256(bytes("2.0.0")),
            "Version check failed"
        );

        // Verify trusted signer is set
        require(journal.trustedSigner() == trustedSigner, "Trusted signer not set correctly");

        console.log("[SUCCESS] Upgrade completed successfully!");
        console.log("\nIMPORTANT: Update .env file with new implementation address:");
        console.log("JOURNAL_IMPL_<CHAIN>=", address(newImplementation));
    }

    /**
     * @notice Gets proxy address based on chain ID
     * @dev Reads from environment variables
     */
    function getProxyAddress() internal view returns (address) {
        uint256 chainId = block.chainid;

        // Base Sepolia (84532)
        if (chainId == 84532) {
            return vm.envAddress("JOURNAL_PROXY_BASE_SEPOLIA");
        }
        // Bob Testnet (111 or 808813)
        else if (chainId == 111 || chainId == 808813) {
            return vm.envAddress("JOURNAL_PROXY_BOB_SEPOLIA");
        }
        // Base Mainnet (8453)
        else if (chainId == 8453) {
            return vm.envAddress("JOURNAL_PROXY_BASE_MAINNET");
        }
        // Bob Mainnet (60808)
        else if (chainId == 60808) {
            return vm.envAddress("JOURNAL_PROXY_BOB_MAINNET");
        }
        // Anvil (local testing)
        else if (chainId == 31337) {
            return vm.envAddress("JOURNAL_PROXY_ANVIL");
        } else {
            revert("Unknown chain ID");
        }
    }
}
