const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'advanced0099',
  database: 'probash_pay_db',
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT * FROM notifications 
    WHERE "userId" = '657b73e1-0634-47f7-855b-07c3e71e453c' 
    ORDER BY "createdAt" DESC;
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
