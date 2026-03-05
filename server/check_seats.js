const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Ruc#2508',
      database: 'theater_booking'
    });
    
    const [rows] = await connection.execute('SELECT id, seat_number, status FROM seats WHERE status = "available" LIMIT 20');
    
    console.log('\n📋 Available Seats:\n');
    if (rows.length === 0) {
      console.log('❌ No available seats found. Resetting theater 1 seats...\n');
      // Reset some seats if needed
      await connection.execute('UPDATE seats SET status="available", version=0 WHERE theater_id=1 AND id > 5 LIMIT 10');
      console.log('✅ Reset 10 seats in theater 1');
    } else {
      rows.forEach((row, idx) => {
        console.log(`  Seat ID ${row.id}: Row ${row.seat_number} - ${row.status}`);
      });
    }
    
    connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
