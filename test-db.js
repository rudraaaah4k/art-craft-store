const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });
  
  try {
    await client.connect();
    console.log('Connected to postgres!');
    await client.query('CREATE DATABASE art_website;');
    console.log('Database created');
    await client.end();
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Database already exists');
    } else {
      console.error('Connection error', err);
    }
  }
}

test();
