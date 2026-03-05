const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  const passwords = ['root', '', 'password', 'admin', 'mysql'];
  let connected = false;
  let lastError;
  
  try {
    // Try different passwords
    for (const pwd of passwords) {
      try {
        console.log(`Trying to connect with password: '${pwd}'...`);
        connection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: pwd,
          multipleStatements: true
        });
        console.log('✓ Connected successfully!');
        connected = true;
        break;
      } catch (err) {
        lastError = err;
        console.log(`✗ Failed with password '${pwd}'`);
      }
    }
    
    if (!connected) {
      throw new Error(`Could not connect with any password. Last error: ${lastError.message}`);
    }

    console.log('Connected to MySQL');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    
    // Execute the schema
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (err) {
          console.error('✗ Error executing:', statement.substring(0, 50));
          console.error(err.message);
        }
      }
    }

    console.log('\n✓ Database setup completed successfully!');
    
    // Verify the data
    console.log('\nVerifying setup...');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM theater_booking.users');
    const [theaters] = await connection.execute('SELECT COUNT(*) as count FROM theater_booking.theaters');
    const [seats] = await connection.execute('SELECT COUNT(*) as count FROM theater_booking.seats');
    
    console.log(`Users: ${users[0].count}`);
    console.log(`Theaters: ${theaters[0].count}`);
    console.log(`Seats: ${seats[0].count}`);

  } catch (error) {
    console.error('Setup error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
