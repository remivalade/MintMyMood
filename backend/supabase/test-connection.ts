import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
// Use service role key for testing (bypasses RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

console.log('Using service role key for testing (bypasses RLS)');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  // Test 1: Check if we can connect
  console.log('Test 1: Checking connection...');
  const { data, error } = await supabase
    .from('users')
    .select('count');

  if (error) {
    console.error('❌ Connection failed:', error);
    return;
  }

  console.log('✅ Connection successful!\n');

  // Test 2: Insert a test user
  console.log('Test 2: Creating test user...');
  const testWallet = '0x1234567890123456789012345678901234567890';

  const { data: user, error: insertError } = await supabase
    .from('users')
    .insert({ wallet_address: testWallet })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      console.log('✅ Test user already exists (that\'s OK)\n');
    } else {
      console.error('❌ Insert failed:', insertError);
      return;
    }
  } else {
    console.log('✅ Test user created:', user?.id, '\n');
  }

  // Test 3: Query the user
  console.log('Test 3: Fetching test user...');
  const { data: fetchedUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', testWallet)
    .single();

  if (fetchError) {
    console.error('❌ Fetch failed:', fetchError);
    return;
  }

  console.log('✅ Fetched user:', {
    id: fetchedUser.id,
    wallet: fetchedUser.wallet_address,
    created: fetchedUser.created_at,
  });
  console.log();

  // Test 4: Check if tables exist
  console.log('Test 4: Verifying database schema...');
  const { data: tables, error: tablesError } = await supabase
    .from('thoughts')
    .select('count');

  if (tablesError) {
    console.error('❌ thoughts table not found:', tablesError);
    return;
  }

  console.log('✅ All tables exist!\n');

  console.log('🎉 All tests passed! Supabase is ready.\n');
  console.log('Next steps:');
  console.log('1. Get WalletConnect Project ID');
  console.log('2. Update .env with VITE_WALLETCONNECT_PROJECT_ID');
  console.log('3. Run: npm run dev');
}

testConnection().catch(console.error);
