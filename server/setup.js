const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Get password from user
const args = process.argv.slice(2);
const mysqlPassword = args[0] || 'root';

async function setup() {
  console.log(`Using MySQL password: '${mysqlPassword}'\n`);
  
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: mysqlPassword,
      multipleStatements: true
    });

    console.log('✓ Connected to MySQL\n');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    
    console.log(`Executing ${statements.length} SQL statements...\n`);

    for (const [index, statement] of statements.entries()) {
      try {
        await connection.execute(statement);
        const preview = statement.trim().substring(0, 60).replace(/\n/g, ' ');
        console.log(`[${index + 1}/${statements.length}] ✓ ${preview}${preview.length === 60 ? '...' : ''}`);
      } catch (err) {
        console.error(`[${index + 1}/${statements.length}] ✗ Error: ${err.message}`);
      }
    }

    console.log('\n✓ Schema executed successfully\n');

    // Verify setup
    console.log('Verifying setup...');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM theater_booking.users');
    const [theaters] = await connection.execute('SELECT COUNT(*) as count FROM theater_booking.theaters');
    const [seats] = await connection.execute('SELECT COUNT(*) as count FROM theater_booking.seats');
    
    console.log(`  Users:    ${users[0].count}`);
    console.log(`  Theaters: ${theaters[0].count}`);
    console.log(`  Seats:    ${seats[0].count}`);

    // Show demo credentials
    const [demoUsers] = await connection.execute('SELECT username, role FROM theater_booking.users LIMIT 5');
    console.log('\n✓ Demo accounts:');
    demoUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.role}), password: 'password123'`);
    });

    await connection.end();
    console.log('\n✓ Database setup completed!\n');

  } catch (error) {
    console.error('✗ Setup error:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Run: node setup.js <mysql-root-password>');
    console.log('2. Or check that MySQL is running: Get-Process mysqld');
    console.log('3. Or start MySQL from Services: services.msc');
    process.exit(1);
  }
}

setup();
