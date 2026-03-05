// Generate correct bcrypt hashes for demo accounts
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function updateDemoUsers() {
  const password = 'password123';
  
  // Generate new hash
  const hash = await bcrypt.hash(password, 10);
  console.log(`Generated bcrypt hash for "password123":`);
  console.log(`${hash}\n`);
  
  // Connect to database
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ruc#2508',
    database: 'theater_booking'
  });
  
  console.log('Updating demo users with correct password hash...\n');
  
  // Update all demo users
  const users = ['admin_user', 'john_doe', 'jane_smith'];
  
  for (const username of users) {
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [hash, username]
    );
    console.log(`✓ Updated ${username}`);
  }
  
  await connection.end();
  console.log('\n✓ All demo users updated successfully!');
  console.log('You can now login with:');
  console.log('  admin_user / password123 (Admin)');
  console.log('  john_doe / password123 (User)');  
  console.log('  jane_smith / password123 (User)');
}

updateDemoUsers().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
