# Onchain Journal V2 - Project Plan & TODO

This document outlines the necessary documentation and an actionable sprint plan to build and ship the Onchain Journal V2 in 4 weeks.

---

## 1. Documentation Plan

To ensure the project is maintainable and easy for future developers to understand, we will create and maintain the following documents:

- **`onchain-journal-v2-prd.md` (Existing):** The single source of truth for product requirements, user flows, and design specifications.
- **`README.md` (To Be Created):** The main entry point for the project. It will include:
    - A brief project description.
    - Instructions for setting up the development environment (installing dependencies, setting up the local database).
    - Scripts for running the frontend and backend services.
- **`CONTRACT_GUIDE.md` (To Be Created):** Essential for our "one contract per chain" strategy. This guide will detail:
    - How to update `OnChainJournal.sol` with chain-specific colors.
    - Steps to compile the contract using Hardhat/Foundry.
    - How to write and run a deployment script.
    - How to verify the deployed contract on a block explorer (e.g., Etherscan, Basescan).
- **`API.md` (To Be Created):** A simple guide for the frontend team explaining how to interact with the backend API for managing ephemeral thoughts, including endpoints and authentication methods.

---

## 2. Sprint Plan (4 Weeks)

This plan breaks down the development work into four weekly sprints, based on the phases outlined in the PRD.

### Week 1: MVP Backend & Core UI

**Goal:** A user can write a thought, see it in a gallery, and have it saved to a local database.

- [ ] **Project Setup:** Initialize Next.js project with Tailwind CSS.
- [ ] **Database:** Set up the local PostgreSQL database with the schema from the PRD.
- [ ] **Backend API:** Create API routes (`/api/thoughts/*`) for creating, reading, and listing thoughts.
- [ ] **Page 1 (Writing):** Build the writing interface with auto-save functionality that calls our backend API.
- [ ] **Page 6 (Gallery):** Build the gallery view that fetches and displays thoughts from the backend.
- [ ] **Documentation:** Create the initial `README.md` with setup instructions.

### Week 2: Frontend Flow & SVG Preview

**Goal:** The full user flow from writing to the final mint preview is complete, without any blockchain interaction.

- [ ] **Page 2 (Mood):** Build the mood selection UI.
- [ ] **State Management:** Implement state management (e.g., Zustand) to handle the flow of data from writing -> mood -> preview.
- [ ] **Page 3 (Mint Preview):** Build the mint preview screen.
- [ ] **Frontend SVG:** Implement the client-side SVG generation for the preview card, including the chain selector dropdown that dynamically changes the SVG's colors.
- [ ] **Discard Logic:** Implement the "Discard" functionality to delete a thought from the database.

### Week 3: Web3 Integration & Testnet Deployment

**Goal:** A user can connect their wallet and mint a journal entry as an NFT on a testnet.

- [ ] **Smart Contract:** Finalize the `OnChainJournal.sol` contract template.
- [ ] **Web3 Environment:** Set up a smart contract development environment (e.g., Hardhat).
- [ ] **Deployment Script:** Write a script to deploy the contract.
- [ ] **Testnet Deployment:** Deploy the contract to a testnet (e.g., Base Goerli), configured with the correct colors.
- [ ] **Wallet Integration:** Integrate `wagmi` and `viem` into the frontend to build the wallet connection flow (Page 4).
- [ ] **Minting Logic:** Implement the `mint` function call on the frontend, passing the data to the testnet contract.
- [ ] **Documentation:** Create the `CONTRACT_GUIDE.md`.

### Week 4: Mainnet, Polish & Ship

**Goal:** A polished, production-ready application deployed on mainnet.

- [ ] **Mainnet Deployment:** Deploy the contract to all target mainnets (Bob, Base, etc.), each with its unique color configuration.
- [ ] **Frontend Configuration:** Update the frontend to include all mainnet contract addresses, selectable by the chain dropdown.
- [ ] **Backend Deployment:** Migrate the database from local Postgres to Supabase and deploy the API.
- [ ] **Polish:** Implement all loading states, error handling, and subtle animations described in the PRD.
- [ ] **Responsive Design:** Conduct final testing and adjustments for all target screen sizes.
- [ ] **Final Documentation:** Create the `API.md` and ensure all other documentation is up-to-date.
- [ ] **Launch!**
