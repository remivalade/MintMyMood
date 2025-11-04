require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Rate limiting: Increased to 100 for development/testing
// TODO: Reduce to 10 for production
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Temporarily increased for SIWE testing
  message: { error: 'Too many signature requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validate environment variables
if (!process.env.SIGNER_PRIVATE_KEY) {
  console.error('ERROR: SIGNER_PRIVATE_KEY not set in .env file');
  process.exit(1);
}

// Create signer wallet
let signer;
try {
  signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);
  console.log(`✓ Signer wallet initialized: ${signer.address}`);
} catch (error) {
  console.error('ERROR: Invalid SIGNER_PRIVATE_KEY');
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    signerAddress: signer.address,
    timestamp: new Date().toISOString()
  });
});

// Main signature endpoint
app.post('/api/ens-signature', limiter, async (req, res) => {
  try {
    const { address, ensName, nonce } = req.body;

    // Validation
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    if (typeof nonce !== 'number' || nonce < 0) {
      return res.status(400).json({ error: 'Invalid nonce (must be a non-negative number)' });
    }

    // ENS name is optional (empty string for users without ENS)
    const cleanEnsName = ensName || '';

    // Expiry: 5 minutes from now
    const expiry = Math.floor(Date.now() / 1000) + 300;

    console.log(`Signing for address: ${address}, ENS: "${cleanEnsName}", nonce: ${nonce}, expiry: ${expiry}`);

    // Create hash - MUST match contract logic exactly
    // Contract uses: keccak256(abi.encode(msg.sender, _ensName, _nonce, _expiry))
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'string', 'uint256', 'uint256'],
        [address, cleanEnsName, nonce, expiry]
      )
    );

    console.log(`Message hash: ${hash}`);

    // Sign the hash with EIP-191 prefix (matches toEthSignedMessageHash in contract)
    const signature = await signer.signMessage(ethers.utils.arrayify(hash));

    console.log(`✓ Signature created: ${signature.slice(0, 10)}...`);

    // Return signature and parameters
    res.json({
      signature,
      expiry,
      ensName: cleanEnsName,
      signerAddress: signer.address
    });

  } catch (error) {
    console.error('Signature error:', error);
    res.status(500).json({
      error: 'Failed to create signature',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =====================================================
// NOTE: SIWE Authentication is now handled by Supabase
// =====================================================
// Sprint 3.3: Migrated to Supabase native Web3 auth
// - Authentication uses supabase.auth.signInWithWeb3()
// - This backend now ONLY handles ENS signature verification
// - See docs/SIWE_IMPLEMENTATION_PLAN.md for details

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MintMyMood - Backend API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Server running on port ${PORT}`);
  console.log(`  Signer address: ${signer.address}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/ens-signature`);
  console.log('');
  console.log('Note: SIWE authentication now handled by Supabase native Web3 auth');
  console.log('');
});
