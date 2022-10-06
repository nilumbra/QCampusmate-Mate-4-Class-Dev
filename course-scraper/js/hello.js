const { Client } = require('pg');
const client = new Client({
  user: 'nilumbra',
  host: 'localhost',
  database: 'postgres',
});
client.connect()