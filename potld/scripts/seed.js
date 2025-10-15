const { db } = require('@vercel/postgres');

async function createPlayersTable(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Crea la tabla "players" si no existe
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS players (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        number INT NOT NULL UNIQUE,
        size VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log(`Created "players" table`);
    return { createTable };
  } catch (error) {
    console.error('Error creating players table:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();
  await createPlayersTable(client);
  await client.end();
}

main().catch((err) => {
  console.error('An error occurred while attempting to seed the database:', err);
});