import pg from 'pg';
const { Pool } = pg;

console.log('🔄 Testing PostgreSQL Database Connection...\n');

const pool = new Pool({
  connectionString: 'postgresql://popmauser:popmapass123@localhost:5432/pop_ma_dice',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic Connection');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connected successfully');
    console.log(`   Current time: ${result.rows[0].now}\n`);
    client.release();

    // Test 2: Check tables
    console.log('Test 2: Database Tables');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('✅ Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    console.log();

    // Test 3: Check row counts
    console.log('Test 3: Table Row Counts');
    const tables = ['players', 'game_sessions', 'game_results', 'game_queue'];
    for (const table of tables) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table};`);
      console.log(`   ${table}: ${countResult.rows[0].count} rows`);
    }
    console.log();

    // Test 4: Check indexes
    console.log('Test 4: Database Indexes');
    const indexResult = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY indexname;
    `);
    console.log('✅ Indexes found:');
    indexResult.rows.forEach(row => {
      console.log(`   - ${row.indexname}`);
    });
    console.log();

    // Test 5: Connection pool stats
    console.log('Test 5: Connection Pool Status');
    console.log(`✅ Pool Status:`);
    console.log(`   Total connections: ${pool.totalCount}`);
    console.log(`   Idle connections: ${pool.idleCount}`);
    console.log(`   Waiting requests: ${pool.waitingCount}\n`);

    console.log('✅ All tests passed! Database is ready.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
