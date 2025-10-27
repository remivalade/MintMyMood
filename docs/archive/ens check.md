## **The Off-Chain Verification Pattern (Recommended)**

This approach is the most gas-efficient and secure. It requires a backend server with a "signer" wallet, but the smart contract logic remains simple.

### **How It Works: Step-by-Step**

1. **Frontend (dApp):** A user connects their wallet. Your dApp gets their address (e.g., 0x123...abc).  
2. **Frontend (dApp):** Using a library like ethers.js or viem, your dApp performs an **ENS reverse lookup** on the user's address. This is a free, off-chain call.  
   * const provider \= new ethers.providers.Web3Provider(window.ethereum);  
   * const address \= await provider.getSigner().getAddress();  
   * const ensName \= await provider.lookupAddress(address); // This will be "vitalik.eth" or null  
3. **Backend (Server):** The frontend sends a request to your secure backend, asking for a "mint signature" for the user's address.  
4. **Backend (Server):**  
   * Your server also performs an ENS reverse lookup on the provided address (as a security check).  
   * It gets the *correct* name (e.g., "vitalik.eth") or an empty string "" if they don't have one.  
   * Your server (using its private "signer" key) creates a cryptographic signature (EIP-712 is best) of the user's address and their correct ENS name.  
   * signature \= sign(hash(userAddress, correctEnsName))  
   * The server sends the correctEnsName and the signature back to the frontend.  
5. **Frontend (dApp):** The user clicks "mint." The frontend calls your smart contract's mint function, passing in the correctEnsName and the signature it just received from the server.  
6. **Smart Contract:** Your contract (using OpenZeppelin's ECDSA library) verifies the signature.  
   * function mintWithENS(string memory ensName, bytes memory signature)  
   * It re-creates the hash: bytes32 hash \= keccak256(abi.encodePacked(msg.sender, ensName));  
   * It recovers the signer: address recoveredSigner \= ECDSA.recover(hash, signature);  
   * It checks if the signer is your trusted backend: require(recoveredSigner \== trustedSignerAddress, "Invalid signature");

### **The Result**

If the require statement passes, your contract has **cryptographic proof** that the ensName string provided is the *correct, verified* name for msg.sender.

A user **cannot** call the function with a fake name (e.g., mintWithENS("fake.eth", signature)), because the hash wouldn't match, the ECDSA.recover would fail, and the transaction would revert.

---

## **Example Smart Contract (Simplified)**

Here's what your contract would look like.

Solidity

// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";  
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";  
// Other imports...

contract MyNft is ERC721 {  
    using ECDSA for bytes32;

    // This is the address of your backend server's wallet  
    address private \_trustedSigner;

    // Set this in the constructor  
    constructor(address trustedSigner) ERC721("MyNFT", "MNFT") {  
        \_trustedSigner \= trustedSigner;  
    }

    /\*\*  
     \* @notice Mints an NFT, verifying the ENS name with a signature.  
     \* @param ensName The ENS name (or empty string) verified by the backend.  
     \* @param signature The signature from the trusted signer.  
     \*/  
    function mintWithENS(string calldata ensName, bytes calldata signature) public payable {  
        // \--- Your Mint Logic \---  
        // (e.g., check price, check supply, etc.)  
        // uint256 newItemId \= \_nextTokenId();

        // \--- ENS Verification \---  
          
        // 1\. Re-create the exact hash that the server signed.  
        // It MUST include msg.sender to tie the signature to the minter.  
        bytes32 messageHash \= keccak256(abi.encodePacked(msg.sender, ensName));

        // 2\. Recover the signer's address from the signature.  
        address recoveredSigner \= messageHash.recover(signature);

        // 3\. Verify the signer is your trusted backend.  
        require(recoveredSigner \== \_trustedSigner, "Signature: Invalid signer");  
        require(recoveredSigner \!= address(0), "Signature: Invalid signature");

        // \--- Success\! \---  
        // At this point, the 'ensName' variable is 100% trusted.  
        // You can now safely use it to build your on-chain SVG.

        string memory svg \= \_buildSVG(ensName);  
        string memory tokenURI \= \_buildTokenURI(svg);

        // \_mint(msg.sender, newItemId);  
        // \_setTokenURI(newItemId, tokenURI);  
    }

    /\*\*  
     \* @dev Internal function to construct the SVG string.  
     \*/  
    function \_buildSVG(string memory ensName) internal pure returns (string memory) {  
        // Your logic to inject the ensName into the SVG XML  
        return string(abi.encodePacked(  
            '\<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg"\>',  
            '\<rect width="100%" height="100%" fill="black" /\>',  
            '\<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"\>',  
            ensName, // Here is the trusted ENS name  
            '\</text\>',  
            '\</svg\>'  
        ));  
    }

    // Function to build the full data: URL  
    function \_buildTokenURI(string memory svg) internal pure returns (string memory) {  
        // ... logic to base64 encode the SVG and wrap it in JSON metadata ...  
        // For simplicity, just showing the SVG part  
        return string(abi.encodePacked("data:image/svg+xml;base64,", Base64.encode(bytes(svg))));  
    }

    // You would need a Base64 library for the above function  
}

### **Why Not Do the Lookup On-Chain?**

You *could* try to call the ENS Reverse Registrar contracts directly from your mint function. **This is strongly discouraged.**

* **Extremely High Gas Cost:** This involves multiple cross-contract calls, on-chain string manipulation, and reading from the ENS registry's storage. It would make your mint function incredibly expensive for the user.  
* **Complexity:** It's complex to implement correctly and must gracefully handle users who don't have a primary ENS name set (which is most users).

The **Off-Chain Verification** pattern gives you the best of all worlds: security, low gas costs, and a great user experience.