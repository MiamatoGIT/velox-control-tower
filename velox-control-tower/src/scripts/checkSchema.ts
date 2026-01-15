import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

(async () => {
  const db = await open({
    filename: path.join(process.cwd(), 'velox_core.db'),
    driver: sqlite3.Database
  });

  // Get info about the table columns
  const columns = await db.all("PRAGMA table_info(field_logs);");
  
  console.log("🔎 DATABASE COLUMNS:");
  console.table(columns.map(c => ({ name: c.name, type: c.type })));
})();