# Mini PRD: The On-Chain Journal - An Omnichain SVG NFT Platform

**Last Updated:** October 16, 2025

---

## 1. Project Vision & Summary

The On-Chain Journal is a platform for users to mint their thoughts, moods, and memories as fully on-chain, dynamic SVG NFTs. By storing all data and rendering logic on the blockchain, we eliminate reliance on external hosting like IPFS. The platform will be launched on multiple EVM chains (Base, BOB, Ink, etc.) and will feature seamless cross-chain bridging, allowing users' NFTs to travel with them across the web3 ecosystem.

---

## 2. Core Features & User Experience

* **On-Chain Minting:** Users can mint a "Journal Entry" NFT by providing two inputs: a text/thought (max 400 chars) and a mood (represented as an emoji).
* **Dynamic SVG Artwork:** The NFT's visual is a dynamically generated SVG based on its on-chain data.
    * **Chain-Specific Backgrounds:** The NFT's background color/gradient is determined by its **chain of origin**. A Journal Entry minted on BOB will always have BOB's orange theme, even when viewed on other chains.
    * **Data in Artwork:** The SVG will render the user's text, mood, and the minting timestamp.
* **Omnichain Functionality (Bridging):** Users can bridge their Journal Entry NFTs between any supported blockchain. The NFT's appearance and all its metadata (including its origin chain) will remain consistent across all chains.
* **Token-Gated & Event-Driven Layouts:** We can create special, limited-edition SVG layouts for specific events or communities. Access can be gated by:
    * **NFT Ownership:** Verifying ownership of an NFT from another collection (either on the same chain or cross-chain).
    * **Allowlist:** A pre-defined list of wallet addresses.
    * **Timeframe:** A specific start and end time for minting.

---

## 3. Technical Architecture

The project is built on a single, unified smart contract codebase deployed across all target chains.

* **Smart Contract Standard:** `ERC721` compliant, inheriting from LayerZero's `ONFT721` standard to enable cross-chain functionality.
* **Upgradable Proxies:** The contract will be deployed using the **OpenZeppelin UUPS Proxy Pattern**. This is critical for long-term viability, allowing us to add features, fix bugs, and adapt over time without disrupting users or their assets.
* **Cross-Chain Messaging:** We will use the **LayerZero** protocol to handle the "lock and mint" bridging mechanism. When an NFT is bridged, its core data (`text`, `mood`, `originChainId`, etc.) is securely passed to the destination chain to mint an identical copy.
* **Gating Mechanisms:**
    * **Same-Chain Gating:** Achieved via a direct, real-time `balanceOf` call to the target NFT contract.
    * **Cross-Chain Gating & Allowlists:** Implemented using a **Merkle Tree** for highly gas-efficient verification.

---

## 4. On-Chain SVG Generation: Best Practices

Generating SVGs on-chain is powerful but requires careful implementation to manage gas costs and security.

* **Gas Optimization:** String concatenation in Solidity is very gas-intensive. We must use `abi.encodePacked(...)` to build the final SVG string, as it is significantly more efficient.
    ```solidity
    // Efficiently build the SVG string
    string memory svg = string(abi.encodePacked(
        '<svg ...>',
        ' ... SVG parts ... ',
        '</svg>'
    ));
    ```
* **Input Sanitization:** All user-provided strings (`text`, `mood`) **must be escaped** before being placed into the SVG. This prevents "SVG injection," where a malicious user could input code to break the SVG structure or even execute scripts in some browser environments. A dedicated internal function for escaping characters like `<`, `>`, `&`, `"`, and `'` is necessary.
* **Modular Code:** To keep the main contract clean and readable, the logic for each special SVG layout (`DEFAULT`, `EVENT_ONE`, etc.) should be separated into its own internal function (e.g., `_generateDefaultSVG()`, `_generateEventSVG()`). The main `tokenURI` function will simply act as a router, calling the appropriate internal function based on the NFT's state.

---

## 5. Security & Governance

While a formal third-party audit is deferred, we will implement the following industry-standard practices to build user trust and secure the protocol.

* **Source Code Verification:** It is mandatory to publicly verify the source code for **both our Proxy and our Logic contracts** on block explorers (e.g., Etherscan, Basescan). This provides a public, on-chain guarantee that the code running at the contract address is the same code we share publicly, enabling community review.
* **Upgrade Governance:** The ownership of the upgradable proxy must be secured to prevent a single point of failure or a malicious takeover. The recommended setup is a **Multisig Wallet** controlling a **Timelock Contract**.
    * **Multisig:** Requires multiple trusted parties (e.g., 3-of-5 founders) to approve any upgrade. This prevents a single compromised key from controlling the project.
    * **Timelock:** Enforces a mandatory public delay (e.g., 48 hours) between the approval and the execution of an upgrade. This gives the community transparent notice and time to react to any proposed changes.

---

## 6. Future Roadmap (V2+ Features)

The upgradable nature of our contract allows for a rich roadmap of future features to increase engagement and utility.

* **Enhanced Social Features:**
    * **On-Chain Replies & Threads:** Allow users to mint a "reply" NFT to another Journal Entry, creating permanent, on-chain conversation trees.
    * **On-Chain Tags:** Enable users to add filterable tags to their entries, allowing for on-chain discovery and categorization.
* **Novel Minting Mechanics:**
    * **"Time Capsule" Reveal:** A minting option where the NFT's text is initially obscured and only becomes visible in the SVG after a set time has passed.
    * **Dynamic Minting Costs:** The price to mint could be tied to on-chain data, such as the length of the user's text.
* **Increased Visual Uniqueness:**
    * **Generative Backgrounds:** Use on-chain data like the minter's address and timestamp as a seed to generate unique, deterministic background patterns for each NFT.
* **Protocol Sustainability:**
    * **Protocol-Owned NFTs:** The contract could automatically mint an NFT to a treasury for every X user mints, creating a collection that can be used to fund future development.

---

## 7. Key Resources & Documentation

This section provides links to the core technologies and concepts for deeper technical review.

* **LayerZero ONFT Standard:**
    * **Concept:** [LayerZero Omnichain NFT Overview](https://layerzero.network/developers/blog/onft-explained)
    * **Contracts:** [LayerZero Solidity Contracts on GitHub](https://github.com/LayerZero-Labs/solidity-contracts)
* **Upgradable Smart Contracts (Proxy Pattern):**
    * **Concept:** [OpenZeppelin's Introduction to Upgradability](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies)
    * **Implementation:** [OpenZeppelin Upgrades Plugins for Hardhat/Foundry](https://docs.openzeppelin.com/upgrades-plugins/1.x/)
* **Merkle Trees for Allowlists:**
    * **Concept:** [A great visual explanation by Mirror.xyz](https://dev.mirror.xyz/_bM5KP3061aI3a592mDQU2Y8L2gXnS2h3kLAb9L-Q4I)
    * **Implementation:** [OpenZeppelin MerkleProof Library](https://docs.openzeppelin.com/contracts/4.x/api/utils#MerkleProof)
* **Security & Governance:**
    * **Multisig:** [Gnosis Safe](https://safe.global/) (The industry standard for asset and contract management)
    * **Timelock:** [OpenZeppelin TimelockController Contract](https://docs.openzeppelin.com/contracts/4.x/api/governance#TimelockController)