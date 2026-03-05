// Test bcrypt to see if the hash matches password123
const bcrypt = require('bcrypt');

async function test() {
  const password = 'password123';
  const hash = '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJiq';
  
  console.log('Testing password hash verification...\n');
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}\n`);
  
  try {
    const match = await bcrypt.compare(password, hash);
    console.log(`Match result: ${match}`);
    
    if (match) {
      console.log('✓ Password matches hash!');
    } else {
      console.log('✗ Password does NOT match hash!');
      console.log('\nGenerating new hash for password123...');
      const newHash = await bcrypt.hash(password, 10);
      console.log(`New hash: ${newHash}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
