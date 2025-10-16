# Supabase Setup Instructions

Follow these steps to set up your Supabase project for MintMyMood.

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `mintmymood` (or your preferred name)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Pricing Plan**: Free tier is perfect for development
5. Click **"Create new project"**
6. Wait 1-2 minutes for project to provision

---

## Step 2: Run SQL Migrations

### 2.1 Open SQL Editor

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### 2.2 Run Migration 001 (Initial Schema)

1. Copy the entire contents of `backend/supabase/migrations/001_initial_schema.sql`
2. Paste into the SQL Editor
3. Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)
4. You should see: ✅ **"Success. No rows returned"**

**What this does:**
- Creates `users` and `thoughts` tables
- Sets up indexes for performance
- Creates triggers for auto-creating users
- Creates function to delete expired thoughts

### 2.3 Run Migration 002 (Row Level Security)

1. Click **"New query"** again
2. Copy the entire contents of `backend/supabase/migrations/002_row_level_security.sql`
3. Paste and **"Run"**
4. You should see: ✅ **"Success. No rows returned"**

**What this does:**
- Enables RLS on both tables
- Creates policies so users can only see their own data
- Allows service role to delete expired thoughts

### 2.4 Run Migration 003 (Helper Functions)

1. Click **"New query"** again
2. Copy the entire contents of `backend/supabase/migrations/003_helper_functions.sql`
3. Paste and **"Run"**
4. You should see: ✅ **"Success. No rows returned"**

**What this does:**
- Creates helper functions for stats, search, etc.
- Functions to update thoughts after minting/bridging

---

## Step 3: Verify Tables Created

1. Click **"Table Editor"** in the left sidebar
2. You should see two tables:
   - ✅ `users`
   - ✅ `thoughts`
3. Click on `thoughts` table
4. Verify columns exist:
   - `id`, `user_id`, `wallet_address`
   - `text`, `mood`
   - `created_at`, `updated_at`, `expires_at`
   - `is_minted`
   - `origin_chain_id`, `current_chain_id`
   - `token_id`, `contract_address`, `tx_hash`
   - `last_bridge_tx`, `bridge_count`

---

## Step 4: Set Up Auto-Deletion Cron Job

### 4.1 Create Database Function (Already Done)

The function `delete_expired_thoughts()` was created in migration 001.

### 4.2 Set Up Cron Job

**Option A: Using Supabase pg_cron Extension (Recommended)**

1. Go to **"Database"** → **"Extensions"** in left sidebar
2. Search for `pg_cron`
3. Enable the extension
4. Go back to **"SQL Editor"**
5. Run this query:

```sql
-- Schedule cleanup to run every 10 minutes (for testing)
SELECT cron.schedule(
    'delete-expired-thoughts',
    '*/10 * * * *', -- Every 10 minutes
    $$SELECT delete_expired_thoughts();$$
);
```

6. Verify cron job created:
```sql
SELECT * FROM cron.job;
```

You should see your job listed.

**Option B: Using Supabase Edge Functions (Alternative)**

If pg_cron is not available on free tier, we'll use an Edge Function called by an external cron service (like cron-job.org or GitHub Actions).

We'll set this up later if needed.

---

## Step 5: Get API Keys

### 5.1 Navigate to API Settings

1. Click **"Project Settings"** (gear icon) in left sidebar
2. Click **"API"** under Project Settings

### 5.2 Copy Required Values

Copy these values:

1. **Project URL**:
   - Example: `https://abcdefghijklmnop.supabase.co`

2. **anon/public Key**:
   - This is the `anon` key under "Project API keys"
   - It's safe to use in your frontend

3. **service_role Key** (KEEP SECRET):
   - This bypasses RLS
   - Only use in backend/server environments
   - NEVER expose in frontend

### 5.3 Add to .env File

Open `.env` in your project root and add:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Service role (for backend only - DO NOT commit)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## Step 6: Test the Setup

### 6.1 Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 6.2 Create Test File

Create `backend/supabase/test-connection.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');

  // Test 1: Check if we can connect
  const { data, error } = await supabase
    .from('users')
    .select('count');

  if (error) {
    console.error('❌ Connection failed:', error);
    return;
  }

  console.log('✅ Connection successful!');

  // Test 2: Insert a test user
  const testWallet = '0x1234567890123456789012345678901234567890';

  const { data: user, error: insertError } = await supabase
    .from('users')
    .insert({ wallet_address: testWallet })
    .select()
    .single();

  if (insertError && insertError.code !== '23505') { // 23505 = unique violation (OK)
    console.error('❌ Insert failed:', insertError);
    return;
  }

  console.log('✅ Test user created:', user);

  // Test 3: Query the user
  const { data: fetchedUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', testWallet)
    .single();

  if (fetchError) {
    console.error('❌ Fetch failed:', fetchError);
    return;
  }

  console.log('✅ Fetched user:', fetchedUser);

  console.log('\n🎉 All tests passed! Supabase is ready.');
}

testConnection();
```

### 6.3 Run Test

```bash
npx tsx backend/supabase/test-connection.ts
```

Expected output:
```
Testing Supabase connection...
✅ Connection successful!
✅ Test user created: { id: '...', wallet_address: '0x...', ... }
✅ Fetched user: { id: '...', wallet_address: '0x...', ... }

🎉 All tests passed! Supabase is ready.
```

---

## Step 7: Clean Up Test Data (Optional)

If you want to remove the test user:

1. Go to **"Table Editor"** → **users**
2. Find the row with `wallet_address = '0x1234567890123456789012345678901234567890'`
3. Click the trash icon to delete

---

## Common Issues & Solutions

### Issue: "relation 'users' does not exist"

**Solution**: You didn't run the migrations. Go back to Step 2.

---

### Issue: "new row violates row-level security policy"

**Solution**: RLS is enabled but you're not authenticated. For testing, you can temporarily disable RLS:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts DISABLE ROW LEVEL SECURITY;
```

(Remember to re-enable after testing!)

---

### Issue: "permission denied for table users"

**Solution**: Make sure you're using the correct API key. The `anon` key should work for basic operations.

---

### Issue: Cron job not running

**Solution**:
1. Verify pg_cron extension is enabled
2. Check cron job status:
   ```sql
   SELECT * FROM cron.job;
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
   ```

---

## Next Steps

Once Supabase is set up:

1. ✅ Create Supabase client in frontend (`src/lib/supabase.ts`)
2. ✅ Integrate with WritingInterface for auto-save
3. ✅ Update Gallery to fetch from Supabase
4. ✅ Test wallet authentication flow

Proceed to **Day 3-4: Frontend Web3 Integration** in the sprint plan!

---

## Useful Supabase Dashboard Links

- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **Database**: View schema, functions, triggers
- **Logs**: Debug issues
- **API Docs**: Auto-generated API documentation for your schema
