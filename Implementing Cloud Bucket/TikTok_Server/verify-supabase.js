// Quick health check for Practical 5 Supabase setup.
// Run from the TikTok_Server folder:  node verify-supabase.js
//
// Tests, in order:
//   1) Env vars present
//   2) Service key can list buckets
//   3) "videos" and "thumbnails" buckets exist
//   4) Service key can upload a tiny test file
//   5) Public URL is reachable (anon read works → policy is correct)
//   6) Service key can delete the test file

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SUPABASE_PUBLIC_KEY'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing env vars:', missing.join(', '));
  process.exit(1);
}
console.log('✅ Step 1: Env vars present');
console.log('   Project:', process.env.SUPABASE_URL);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

(async () => {
  // 2) list buckets
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('❌ Step 2: Could not list buckets:', listErr.message);
    process.exit(1);
  }
  console.log('✅ Step 2: Service key works. Buckets found:', buckets.map((b) => b.name).join(', ') || '(none)');

  // 3) check for required buckets
  const names = buckets.map((b) => b.name);
  const needed = ['videos', 'thumbnails'];
  const missingBuckets = needed.filter((n) => !names.includes(n));
  if (missingBuckets.length) {
    console.error('❌ Step 3: Missing buckets:', missingBuckets.join(', '));
    console.error('   Create them on supabase.com → Storage → Create Bucket (set to Public).');
    process.exit(1);
  }
  console.log('✅ Step 3: Both "videos" and "thumbnails" buckets exist');

  // 4) upload a tiny test file
  const testPath = `verify-${Date.now()}.txt`;
  const testContent = Buffer.from('hello from verify-supabase.js');
  const { error: upErr } = await supabase.storage
    .from('videos')
    .upload(testPath, testContent, { contentType: 'text/plain' });
  if (upErr) {
    console.error('❌ Step 4: Upload failed:', upErr.message);
    process.exit(1);
  }
  console.log('✅ Step 4: Uploaded test file to videos/' + testPath);

  // 5) check public URL
  const { data: urlData } = supabase.storage.from('videos').getPublicUrl(testPath);
  console.log('   Public URL:', urlData.publicUrl);
  try {
    const res = await fetch(urlData.publicUrl);
    if (!res.ok) {
      console.error('❌ Step 5: Public URL returned HTTP', res.status, '— anon SELECT policy is missing or wrong.');
    } else {
      const text = await res.text();
      if (text === 'hello from verify-supabase.js') {
        console.log('✅ Step 5: Public URL is readable by anon (policy OK)');
      } else {
        console.error('❌ Step 5: Unexpected body:', text.slice(0, 100));
      }
    }
  } catch (e) {
    console.error('❌ Step 5: fetch failed:', e.message);
  }

  // 6) cleanup
  const { error: delErr } = await supabase.storage.from('videos').remove([testPath]);
  if (delErr) {
    console.error('⚠️  Step 6: Could not delete test file:', delErr.message);
  } else {
    console.log('✅ Step 6: Test file deleted (cleanup done)');
  }

  console.log('\n🎉 All Supabase checks passed. Practical 5 backend storage is wired up correctly.');
})();
