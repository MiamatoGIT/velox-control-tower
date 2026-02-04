import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const inspect = async () => {
  const db = await open({
    filename: path.join(process.cwd(), 'velox_core.db'),
    driver: sqlite3.Database
  });

  console.log("🔍 INSPECTING VELOX CORE DATABASE...\n");

  // Get all rows
  const rows = await db.all("SELECT id, timestamp, status, quantity_value, comments, language FROM field_logs");

  if (rows.length === 0) {
    console.log("⚠️ Database is empty.");
  } else {
    console.table(rows); // Prints a nice table of your data
  }
};

inspect();