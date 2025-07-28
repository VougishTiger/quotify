const { Pool } = require("pg");

const pool = new Pool({
  user: "vougi",
  host: "localhost",
  database: "quotes_db",
  password: "Strong4hold!",
  port: 5432,
});

module.exports = pool