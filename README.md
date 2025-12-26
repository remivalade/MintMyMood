# MintMyMood

> **On-Chain Journaling**. Thoughts auto-delete after 7 days, or live forever as SVG NFTs.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-yellow.svg)](docs/todo.md)

---

## 👋 Start Here

Select the guide that matches your goal:

### I want to...
- **🚀 [Run the App Locally](docs/GETTING_STARTED.md#-quick-start-5-min)**  
  *Get the frontend running in 5 minutes.*
  
- **🛠️ [Contribute or Deep Dive](docs/GETTING_STARTED.md#%EF%B8%8F-full-setup-guide)**  
  *Setup for smart contracts, backend, and core development.*

- **📖 [Understand the Architecture](docs/DEVELOPER_GUIDE.md)**  
  *Learn how the pieces fit together (React, Supabase, Foundry).*

---

## 📂 Repository Structure

- **`/src`**: **Frontend**. React app that users interact with.
- **`/contracts`**: **Blockchain**. Solidity contracts for the NFT logic. [See README](contracts/README.md).
- **`/backend`**: **API**. Services for signatures and database management.
- **`/docs`**: **Knowledge Base**.
  - [CONTRACT_GUIDE.md](docs/CONTRACT_GUIDE.md): Smart contract specific details.
  - [DEPLOYMENT.md](docs/DEPLOYMENT.md): Ops guide.
  - [svg/README.md](docs/svg/README.md): Design specs for on-chain art.

---

## 💡 The Concept

**MintMyMood** explores the balance between the ephemeral and the permanent.
- **Ephemeral**: Thoughts written in the app exist for 7 days, then vanish.
- **Permanent**: If a thought is meaningful, you can "mint" it. This turns it into an on-chain NFT that exists forever on the blockchain, visualized as beautiful SVG art.

---

## 🏗️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind, Wagmi/RainbowKit.
- **Backend**: Supabase (Auth & DB), Express (Signatures).
- **Chain**: Solidity (Foundry), deployed on Base, Bob, and Ink.

---

*Built with ❤️ for the on-chain journaling community.*
