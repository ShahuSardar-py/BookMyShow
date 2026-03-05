// Quick test script to verify database and authentication
const axios = require('axios');

async function test() {
  console.log('🧪 Testing Theater Booking System\n');
  
  // Test 1: Health check
  console.log('1️⃣ Checking server health...');
  try {
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('✓ Server is running\n');
  } catch (err) {
    console.error('✗ Server not responding:', err.message);
    process.exit(1);
  }
  
  // Test 2: Admin login
  console.log('2️⃣ Testing admin login...');
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin_user',
      password: 'password123'
    });
    
    if (response.data.success) {
      console.log('✓ Admin login successful!');
      console.log(`  User: ${response.data.user.username}`);
      console.log(`  Role: ${response.data.user.role}`);
      console.log(`  Token: ${response.data.token.substring(0, 20)}...`);
    } else {
      console.error('✗ Login returned but success is false');
      console.error(response.data);
    }
  } catch (err) {
    console.error('✗ Admin login failed:', err.response?.data?.error || err.message);
  }
  
  console.log();
  
  // Test 3: User login
  console.log('3️⃣ Testing user login...');
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'john_doe',
      password: 'password123'
    });
    
    if (response.data.success) {
      console.log('✓ User login successful!');
      console.log(`  User: ${response.data.user.username}`);
      console.log(`  Role: ${response.data.user.role}`);
    } else {
      console.error('✗ Login returned but success is false');
    }
  } catch (err) {
    console.error('✗ User login failed:', err.response?.data?.error || err.message);
  }
  
  console.log();
  
  // Test 4: Registration
  console.log('4️⃣ Testing new user registration...');
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'test_user_' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'testpass123'
    });
    
    if (response.data.success) {
      console.log('✓ Registration successful!');
      console.log(`  User: ${response.data.user.username}`);
      console.log(`  Email: ${response.data.user.email}`);
    } else {
      console.error('✗ Registration returned but success is false');
    }
  } catch (err) {
    console.error('✗ Registration failed:', err.response?.data?.error || err.message);
  }
  
  console.log('\n✅ Tests completed!');
}

test().catch(console.error);
