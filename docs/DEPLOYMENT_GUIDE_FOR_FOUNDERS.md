# 🚀 MintMyMood Deployment Guide (For Non-Technical Founders)

**⏱️ Total Time: 30-45 minutes**
**💰 Total Cost: $0 (free tier for everything)**
**🎯 Goal: Get your app live on the internet**

---

## 📋 What You'll Need Before Starting

- [ ] A GitHub account (where your code lives)
- [ ] A credit/debit card (for verification only - we're using free tiers)
- [ ] Your MintMyMood code pushed to GitHub
- [ ] A cup of coffee ☕ and 45 minutes of uninterrupted time

**⚠️ Don't panic!** This guide assumes ZERO technical knowledge. Every step has screenshots descriptions and explanations.

---

## 🗺️ The Big Picture (What We're Building)

Think of your app like a restaurant:

```
┌─────────────────────────────────────────────────────────┐
│  👥 Your Users (People visiting your app)               │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────▼─────────────┐
    │  🎨 FRONTEND (Storefront) │  ← Step 3: Deploy on Vercel
    │  What users see and click │
    └────┬─────────────────┬────┘
         │                 │
         │                 └─────────────────┐
         │                                   │
    ┌────▼──────────────┐        ┌──────────▼───────────┐
    │  💾 DATABASE      │        │  🔧 BACKEND API      │
    │  (Storage Room)   │        │  (Kitchen)           │
    │  Stores journal   │        │  Processes requests  │
    │  entries          │        │                      │
    └───────────────────┘        └──────────────────────┘
    ↑ Step 1: Supabase           ↑ Step 2: Railway
```

**What each piece does:**
- **Frontend (Vercel)**: The app interface users interact with
- **Backend (Railway)**: Verifies ENS names when minting NFTs
- **Database (Supabase)**: Stores journal entries

---

## 📦 Step 1: Set Up Database (Supabase) - 10 minutes

### What is Supabase?
Think of it as a filing cabinet where your app stores journal entries. It's like Google Sheets, but for apps.

### 1.1 Create Your Supabase Account

1. **Go to** [supabase.com](https://supabase.com)
2. **Click** "Start your project" (green button)
3. **Sign in with GitHub** (easiest option)
4. **Authorize Supabase** (click the green button)

**✅ You should now see:** Supabase dashboard with "New project" button

---

### 1.2 Create Your Database

1. **Click** "New project" button
2. **Fill in the form:**
   ```
   Name: mintmymood-prod
   Database Password: [Click "Generate password" button, then copy and save it!]
   Region: Choose closest to you (e.g., "US East" if you're in America)
   Pricing Plan: Free (leave as is)
   ```

3. **⚠️ IMPORTANT:** Copy your database password and save it in a secure note (you'll never see it again!)

4. **Click** "Create new project"

5. **Wait 2-3 minutes** while Supabase sets up your database (you'll see a loading screen)

**✅ You should now see:** A dashboard with sidebar menus (Table Editor, Authentication, etc.)

---

### 1.3 Set Up Your Database Tables (The Easy Way)

Your code includes files called "migrations" - these are instructions that create tables in your database. Think of them as blueprints for building rooms in your filing cabinet.

**Here's the easiest way (no command line!):**

1. **In Supabase dashboard**, find the left sidebar
2. **Click** on "SQL Editor" (looks like </> icon)
3. **Click** "New query" button (top right)

4. **Open your migration files** (on your computer):
   - Navigate to: `MintMyMood/backend/supabase/migrations/`
   - You'll see files numbered 001 to 016

5. **For each file (in order 001 → 016):**
   - Open the file in a text editor (Notepad, TextEdit, VS Code)
   - Copy ALL the text
   - Paste it into the Supabase SQL Editor
   - Click "Run" button (bottom right)
   - Wait for "Success" message (green checkmark)
   - Click "New query" for the next file

**⚠️ Pro tip:** Do them in order! Start with `001_initial_schema.sql`, then `002_`, etc.

**✅ When done, verify:**
- Go to "Table Editor" in sidebar
- You should see tables: `thoughts`, `profiles`, `auth_nonces`

**🆘 Stuck?** If you see an error:
- Check you ran migrations in order (001, 002, 003...)
- Make sure you clicked "Run" after each paste
- Try refreshing the page and checking "Table Editor"

---

### 1.4 Get Your Database Credentials (API Keys)

These are like passwords that let your app talk to your database.

1. **In Supabase dashboard**, click "Settings" (gear icon, bottom of sidebar)
2. **Click** "API" in the settings menu
3. **You'll see two important values:**

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJI... (very long string)
   ```

4. **Copy these to a note** - you'll need them in Step 3!

**💡 What these are:**
- **Project URL**: Your database's address on the internet
- **anon public key**: A safe key for your frontend (safe to expose publicly)
- **service_role key**: Secret key (⚠️ NEVER share this or put it in frontend!)

**✅ You should have:** Two values copied in a note (URL + anon key)

---

### 1.5 Verify Everything Works

Let's make sure your database is ready:

1. **Go to** "Authentication" → "Policies" (in sidebar)
2. **You should see** 4 policies for the `thoughts` table:
   - "Users can view own thoughts"
   - "Users can insert own thoughts"
   - "Users can update own thoughts"
   - "Users can delete own thoughts"

**✅ If you see these 4 policies**, your database is ready! 🎉

**🆘 Don't see them?**
- Double-check you ran ALL migration files (001-016)
- Make sure migration `014_update_rls_policies.sql` ran successfully

---

## 🔧 Step 2: Deploy Backend API (Railway) - 10 minutes

### What is the Backend API?
It's a tiny server that verifies ENS names (like "vitalik.eth") when users mint NFTs. Without it, anyone could fake someone else's ENS name!

### 2.1 Generate a Signer Wallet (Important!)

**What's a signer wallet?** It's a crypto wallet that your backend uses to sign messages. Think of it like a signature stamp.

**The easy way (use a website):**

1. **Go to** [vanity-eth.tk](https://vanity-eth.tk/) or [myetherwallet.com](https://www.myetherwallet.com/wallet/create)
2. **Generate a new wallet** (click "Create wallet")
3. **⚠️ CRITICAL: Save both:**
   ```
   Wallet Address: 0x1234567890abcdef... (42 characters)
   Private Key: 0xabcdef1234567890... (66 characters, starts with 0x)
   ```

4. **Save these in a secure note** (like 1Password, LastPass, or encrypted note)

**⚠️ SECURITY WARNING:**
- This private key controls your backend
- Keep it SECRET
- Never commit it to GitHub
- Never share it with anyone

**✅ You should have:** Address + Private Key saved securely

---

### 2.2 Create Railway Account

1. **Go to** [railway.app](https://railway.app)
2. **Click** "Login" (top right)
3. **Click** "Login with GitHub"
4. **Authorize Railway** (green button)

**✅ You should see:** Railway dashboard with "New Project" button

---

### 2.3 Deploy Your Backend

**Now the magic happens - Railway will automatically deploy your code!**

1. **Click** "New Project" button
2. **Click** "Deploy from GitHub repo"
3. **Select** "MintMyMood" repository (or whatever you named it)
4. **Railway will show:** "Configure" button - click it

5. **Important settings to change:**

   **a) Set the Root Directory:**
   - Look for "Root Directory" setting
   - Enter: `backend/api`
   - This tells Railway where your backend code lives

   **b) Set Environment Variables (the secret configuration):**
   - Click "Variables" tab
   - Click "New Variable" and add these one by one:

   ```
   SIGNER_PRIVATE_KEY = 0xYourPrivateKeyFromStep2.1
   PORT = 3001
   NODE_ENV = production
   FRONTEND_URL = https://temporary.com
   ```

   **⚠️ Note:** We'll update FRONTEND_URL after Step 3!

6. **Click** "Deploy" button (top right)

7. **Wait 2-3 minutes** while Railway builds and deploys your backend

**✅ You should see:**
- A log showing "Build successful"
- "Deployed" status with a green checkmark
- A URL like: `https://yourapp.up.railway.app`

---

### 2.4 Get Your Backend URL

1. **In Railway dashboard**, find your deployed service
2. **Click** "Settings" tab
3. **Look for** "Domains" section
4. **You'll see a URL** like: `https://mintmymood-production-xxxx.up.railway.app`
5. **Copy this URL** - you'll need it for Step 3!

**✅ You should have:** Your Railway backend URL copied

---

### 2.5 Test That It Works

Let's make sure your backend is alive!

**The easy way (use your browser):**

1. **Copy your Railway URL** from Step 2.4
2. **Add `/api/health` to the end**, like:
   ```
   https://mintmymood-production-xxxx.up.railway.app/api/health
   ```
3. **Paste it in your browser** and press Enter

**✅ You should see** something like:
```json
{
  "status": "ok",
  "signerAddress": "0x1234...",
  "timestamp": "2025-11-13T..."
}
```

**🆘 Don't see this?**
- Wait another minute (deployment might still be finishing)
- Check Railway dashboard for error logs (click "Deployments" → latest deploy → "View Logs")
- Make sure SIGNER_PRIVATE_KEY starts with `0x`

**✅ If you see the JSON above**, your backend is live! 🎉

---

## 🎨 Step 3: Deploy Frontend (Vercel) - 10 minutes

### What is the Frontend?
This is what users actually see - the website with the writing interface, gallery, etc.

### 3.1 Get WalletConnect Project ID

**What's WalletConnect?** It's the service that helps users connect their crypto wallets to your app.

1. **Go to** [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. **Click** "Sign Up" (or "Login" if you have an account)
3. **Sign up with GitHub** (easiest)
4. **Click** "Create New Project"
5. **Fill in:**
   ```
   Project Name: MintMyMood
   ```
6. **Click** "Create"

7. **Copy the "Project ID"** (looks like: `abc123def456...`)

**✅ You should have:** WalletConnect Project ID copied

---

### 3.2 Create Vercel Account

1. **Go to** [vercel.com](https://vercel.com)
2. **Click** "Sign Up" (top right)
3. **Click** "Continue with GitHub"
4. **Authorize Vercel**

**✅ You should see:** Vercel dashboard

---

### 3.3 Deploy Your Frontend

**This is the easiest step - Vercel does everything automatically!**

1. **Click** "Add New..." button → "Project"
2. **Find** "MintMyMood" in the list of repos
3. **Click** "Import"

4. **Configure your project:**

   **Framework Preset:** Vite (should auto-detect)

   **Root Directory:** Leave as `./` (the default)

   **Build Command:** `npm run build` (should be pre-filled)

   **Output Directory:** `build` (change from `dist` to `build`)

5. **Add Environment Variables** (click "Environment Variables" section):

   Click "Add" and enter these one by one:

   ```
   Name: VITE_SUPABASE_URL
   Value: [Paste your Supabase Project URL from Step 1.4]

   Name: VITE_SUPABASE_ANON_KEY
   Value: [Paste your Supabase anon public key from Step 1.4]

   Name: VITE_WALLETCONNECT_PROJECT_ID
   Value: [Paste your WalletConnect Project ID from Step 3.1]

   Name: VITE_BACKEND_URL
   Value: [Paste your Railway backend URL from Step 2.4]

   Name: VITE_ENVIRONMENT
   Value: production
   ```

   **⚠️ Triple-check these!** Wrong environment variables = app won't work

6. **Click** "Deploy" button

7. **Wait 2-3 minutes** while Vercel builds your app (you'll see a fun animation)

**✅ You should see:**
- Confetti animation 🎉
- "Your project has been deployed" message
- A URL like: `https://mintmymood.vercel.app`

---

### 3.4 Get Your Frontend URL

1. **Copy the Vercel URL** shown on the success screen (like `https://mintmymood.vercel.app`)
2. **Click** "Visit" button to see your live app!

**✅ You should see:** Your MintMyMood app loading in a new tab!

---

## 🔗 Step 4: Connect Everything Together - 5 minutes

### 4.1 Update Backend CORS (Let Frontend Talk to Backend)

**What's CORS?** It's a security setting that controls which websites can talk to your backend. Right now, your backend only allows `https://temporary.com` (which doesn't exist).

1. **Go back to** [Railway dashboard](https://railway.app/dashboard)
2. **Click** your MintMyMood backend service
3. **Click** "Variables" tab
4. **Find** `FRONTEND_URL` variable
5. **Click** the pencil/edit icon
6. **Change the value to** your Vercel URL from Step 3.4:
   ```
   https://mintmymood.vercel.app
   ```
7. **Click** "Save" or checkmark

**Railway will automatically redeploy** (wait 30 seconds)

**✅ Done!** Your frontend can now talk to your backend.

---

### 4.2 Update Smart Contract Signer (If Needed)

**What's this?** Your smart contract needs to know which wallet is allowed to sign ENS verifications. Right now it's set to the testnet signer. If you generated a NEW wallet in Step 2.1, you need to update it.

**⚠️ Do you need this?** Only if you generated a NEW signer wallet. If you're using the existing testnet signer (`0xEd171c759450B7358e9238567b1e23b4d82f3a64`), skip this!

**To check which signer your contract is using:**

1. **Go to** [BaseScan Sepolia](https://sepolia.basescan.org/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8#readContract)
2. **Click** "Read Contract" tab
3. **Find** `trustedSigner` function (item #9 or so)
4. **Click** "Query"
5. **Compare** the address shown with your signer address from Step 2.1

**If they DON'T match**, you need to update it:

**Option A: Ask your developer** to run this command:
```bash
cast send 0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8 \
  "setTrustedSigner(address)" \
  YOUR_NEW_SIGNER_ADDRESS \
  --rpc-url https://sepolia.base.org \
  --private-key YOUR_DEPLOYER_PRIVATE_KEY
```

**Option B: Use Etherscan UI:**
1. Go to [BaseScan Sepolia - Write Contract](https://sepolia.basescan.org/address/0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8#writeContract)
2. Click "Connect to Web3" (connect the wallet that deployed the contract)
3. Find `setTrustedSigner` function
4. Enter your new signer address
5. Click "Write"
6. Sign the transaction

**✅ If the addresses match**, you're good! Skip this step.

---

## ✅ Step 5: Test Everything! - 10 minutes

### 5.1 The Moment of Truth

Let's test your live app end-to-end:

1. **Go to** your Vercel URL (e.g., `https://mintmymood.vercel.app`)

2. **Test #1: Does it load?**
   - You should see the MintMyMood interface
   - No error messages
   - **✅ If yes**, continue!
   - **🆘 If no**, check browser console (F12) for errors

3. **Test #2: Can you connect your wallet?**
   - Click "Connect Wallet" button
   - Choose your wallet (MetaMask, Rabby, Coinbase Wallet)
   - Sign the connection
   - **✅ If yes**, continue!
   - **🆘 If no**, check WalletConnect Project ID is correct

4. **Test #3: Can you write a thought?**
   - Type something in the writing area
   - Wait 3 seconds for auto-save
   - You should see "Saved" toast notification
   - **✅ If yes**, continue!
   - **🆘 If no**, check Supabase credentials in Vercel

5. **Test #4: Can you view your thought in the gallery?**
   - Navigate to Gallery view
   - You should see your saved thought
   - **✅ If yes**, continue!
   - **🆘 If no**, check browser console for errors

6. **Test #5: Can you mint an NFT?** (The full flow!)
   - Write a thought
   - Select a mood (emoji)
   - Click "Preview Mint"
   - You should see SVG preview
   - Click "Mint NFT"
   - Sign the transaction in your wallet
   - Wait for confirmation
   - **✅ If yes**, you're LIVE! 🎉🎉🎉
   - **🆘 If no**, see troubleshooting below

---

### 5.2 Verify Your NFT

After minting, let's verify it worked:

1. **Check the transaction** on block explorer:
   - Base Sepolia: [sepolia.basescan.org](https://sepolia.basescan.org)
   - Search for your wallet address
   - Find the recent "Mint Entry" transaction

2. **View your NFT on OpenSea Testnet**:
   - Go to [testnets.opensea.io](https://testnets.opensea.io)
   - Search for contract: `0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8`
   - Find your NFT
   - The SVG should display with your text + mood

**✅ If you see your NFT**, everything is working perfectly!

---

## 🆘 Troubleshooting (When Things Go Wrong)

### Problem: "Failed to fetch" when connecting wallet

**Possible causes:**
- Backend URL is wrong
- CORS not configured
- Backend is down

**How to fix:**
1. Check Vercel environment variables (VITE_BACKEND_URL)
2. Check Railway FRONTEND_URL matches your Vercel URL
3. Test backend health endpoint: `https://your-railway-url.up.railway.app/api/health`
4. Check Railway logs for errors

---

### Problem: "Supabase error" or can't save thoughts

**Possible causes:**
- Supabase credentials wrong
- Migrations didn't run
- RLS policies not configured

**How to fix:**
1. Verify VITE_SUPABASE_URL in Vercel matches Supabase Project URL
2. Verify VITE_SUPABASE_ANON_KEY in Vercel matches Supabase anon key
3. Check Supabase dashboard → Authentication → Policies (should see 4 policies)
4. Re-run migrations if tables are missing

---

### Problem: "Signature verification failed" when minting

**Possible causes:**
- Wrong signer private key
- Contract trusted signer doesn't match backend signer
- Signature expired (5 minute timeout)

**How to fix:**
1. Check SIGNER_PRIVATE_KEY in Railway (no typos, starts with 0x)
2. Verify contract trusted signer matches your signer address (Step 4.2)
3. Try minting again (signatures expire after 5 minutes)

---

### Problem: App loads but looks broken / no styling

**Possible causes:**
- Build output directory wrong
- CSS didn't compile

**How to fix:**
1. Check Vercel "Output Directory" is set to `build` (not `dist`)
2. Redeploy from Vercel dashboard
3. Check browser console for 404 errors on CSS files

---

### Problem: "Invalid chain" error

**Possible causes:**
- Wallet is on wrong network
- Contract addresses not configured

**How to fix:**
1. Switch wallet to Base Sepolia or Bob Testnet
2. Check src/contracts/config.ts has correct addresses

---

## 🎉 You're Live! What's Next?

### Immediate Next Steps

1. **Test on different browsers:**
   - Chrome
   - Firefox
   - Safari
   - Brave

2. **Test on mobile:**
   - iOS Safari
   - Android Chrome

3. **Invite 3-5 beta testers** to try it out

4. **Set up monitoring** (optional but recommended):
   - [Better Stack](https://betterstack.com) - Free tier
   - Monitor your frontend and backend URLs

---

### Before Launching Publicly

**⚠️ Update these production settings:**

1. **Change draft expiration** (currently 10 minutes for testing):
   - File: `src/components/WritingInterface.tsx`
   - Line: ~50
   - Change: `10 * 60 * 1000` to `7 * 24 * 60 * 60 * 1000` (7 days)

2. **Reduce rate limiting** (currently 100/hour for testing):
   - File: `backend/api/server.js`
   - Line: ~22
   - Change: `max: 100` to `max: 10`

3. **Make changes, commit, push to GitHub**:
   - Vercel will auto-deploy frontend
   - Railway will auto-deploy backend

---

### Optional: Custom Domain

Want `mintmymood.com` instead of `mintmymood.vercel.app`?

1. **Buy a domain** (~$12/year):
   - Namecheap, Google Domains, Cloudflare

2. **Add to Vercel:**
   - Vercel dashboard → Settings → Domains
   - Add your domain
   - Follow DNS instructions

3. **Update Railway FRONTEND_URL**:
   - Change to your custom domain
   - Redeploy

---

## 💰 Cost Summary

| Service | Your Cost | What You Get |
|---------|-----------|--------------|
| **Supabase** | $0/month | 500MB database, 2GB transfer |
| **Railway** | $0/month* | $5 credit (~500 hours) |
| **Vercel** | $0/month | Unlimited bandwidth, 100GB/mo |
| **WalletConnect** | $0/month | 10,000 wallet connections |
| **Domain** (optional) | $12/year | Custom URL |

***Total: FREE*** (or ~$1/month with custom domain)

*Railway $5 credit covers ~500 hours. For 24/7 always-on, you'd use ~720 hours (~$7/mo).

---

## 📚 Additional Resources

- **Original Deployment Guide**: `docs/PRODUCTION_DEPLOYMENT_PLAN.md` (more technical)
- **Developer Guide**: `docs/DEVELOPER_GUIDE.md`
- **Contract Guide**: `docs/CONTRACT_GUIDE.md`
- **Quick Start**: `docs/QUICK_START.md`

---

## 🆘 Still Stuck?

1. **Check browser console** (F12 → Console tab)
2. **Check Railway logs** (Dashboard → Deployments → View Logs)
3. **Check Vercel logs** (Dashboard → Deployments → View Function Logs)
4. **Review this guide step-by-step** - did you miss anything?

---

## 🎊 Congratulations!

If you made it here and everything works, you just:

✅ Deployed a full-stack Web3 app
✅ Set up a production database
✅ Configured a backend API
✅ Launched a frontend website
✅ Connected blockchain smart contracts

**You're officially a technical founder!** 🚀

Now go get some users and build something amazing! 💪
