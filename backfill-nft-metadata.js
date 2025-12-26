/**
 * Backfill script for nft_metadata.styleId
 *
 * Reads styleId from on-chain contracts and updates database
 * Run this AFTER adding the nft_metadata column
 */

import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const SUPABASE_URL = 'https://hkzvnpksjpxfsyiqyhpk.supabase.co';
const SUPABASE_KEY = '***REMOVED***';

const CONTRACT_ADDRESS = '0xC2De374bb678bD1491B53AaF909F3fd8073f9ec8';

// Simplified ABI - only what we need
const ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "journalEntries",
    "outputs": [
      {"internalType": "string", "name": "text", "type": "string"},
      {"internalType": "string", "name": "mood", "type": "string"},
      {"internalType": "uint256", "name": "blockNumber", "type": "uint256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "originChainId", "type": "uint256"},
      {"internalType": "uint8", "name": "styleId", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Chain configurations
const bobSepoliaChain = {
  id: 808813,
  name: 'BOB Sepolia',
  network: 'bob-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bob-sepolia.rpc.gobob.xyz'] },
    public: { http: ['https://bob-sepolia.rpc.gobob.xyz'] }
  }
};

const inkSepoliaChain = {
  id: 763373,
  name: 'Ink Sepolia',
  network: 'ink-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-gel-sepolia.inkonchain.com'] },
    public: { http: ['https://rpc-gel-sepolia.inkonchain.com'] }
  }
};

const CHAIN_CONFIGS = {
  84532: {
    chain: baseSepolia,
    rpc: 'https://sepolia.base.org',
    name: 'Base Sepolia'
  },
  808813: {
    chain: bobSepoliaChain,
    rpc: 'https://bob-sepolia.rpc.gobob.xyz',
    name: 'Bob Sepolia'
  },
  763373: {
    chain: inkSepoliaChain,
    rpc: 'https://rpc-gel-sepolia.inkonchain.com',
    name: 'Ink Sepolia'
  }
};

async function backfillMetadata() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('🔍 Fetching all minted NFTs from database...\n');

  // Get all minted thoughts
  const { data: thoughts, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('is_minted', true)
    .not('token_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching thoughts:', error);
    return;
  }

  console.log(`Found ${thoughts.length} minted NFTs\n`);
  console.log('━'.repeat(60));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const thought of thoughts) {
    const chainId = thought.current_chain_id || thought.origin_chain_id;
    const tokenId = thought.token_id;

    console.log(`\n📝 NFT #${tokenId} on ${CHAIN_CONFIGS[chainId]?.name || chainId}`);
    console.log(`   Text: "${thought.text.substring(0, 40)}..."`);

    // Check if already has styleId
    if (thought.nft_metadata?.styleId !== undefined && thought.nft_metadata?.styleId !== null) {
      console.log(`   ✓ Already has styleId: ${thought.nft_metadata.styleId} - skipping`);
      skipCount++;
      continue;
    }

    const chainConfig = CHAIN_CONFIGS[chainId];
    if (!chainConfig) {
      console.log(`   ⚠️  Unknown chain ID ${chainId} - skipping`);
      errorCount++;
      continue;
    }

    try {
      // Create client for this chain
      const client = createPublicClient({
        chain: chainConfig.chain,
        transport: http(chainConfig.rpc)
      });

      console.log(`   🔗 Reading from contract...`);

      // Read from contract
      const entry = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'journalEntries',
        args: [BigInt(tokenId)]
      });

      const styleId = Number(entry[6]); // 7th element is styleId
      const styleName = styleId === 1 ? 'Classic' : 'Chain Native';

      console.log(`   📖 Contract says: styleId = ${styleId} (${styleName})`);

      // Update database
      const { error: updateError } = await supabase
        .from('thoughts')
        .update({
          nft_metadata: { styleId }
        })
        .eq('id', thought.id);

      if (updateError) {
        console.log(`   ❌ Failed to update: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Database updated!`);
        successCount++;
      }

    } catch (error) {
      console.log(`   ❌ Error reading contract: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   ✅ Updated: ${successCount}`);
  console.log(`   ⏭️  Skipped (already had data): ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${thoughts.length}`);
  console.log('\n✨ Backfill complete!\n');
}

backfillMetadata().catch(console.error);
