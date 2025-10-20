import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice'
});

try {
  console.log('🔄 Testing database connection...\n');
  
  // Test connection
  const result = await pool.query('SELECT NOW()');
  console.log('✅ Database connection successful');
  console.log('   Current time:', result.rows[0].now, '\n');
  
  // Check tables
  console.log('📊 Checking database tables...\n');
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  console.log('✅ Tables created:');
  tables.rows.forEach(row => {
    console.log(`   - ${row.table_name}`);
  });
  
  // Check row counts
  console.log('\n📈 Table row counts:\n');
  for (const table of tables.rows) {
    const count = await pool.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
    console.log(`   ${table.table_name}: ${count.rows[0].count} rows`);
  }
  
  console.log('\n✅ Database setup verified successfully!');
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
