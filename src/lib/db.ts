// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',        
  host: 'localhost',        
  database: 'Admin',        
  password: '11110000',      
  port: 5432,               
});

export default pool;
