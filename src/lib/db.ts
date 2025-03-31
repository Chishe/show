// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',        
  host: 'localhost',        
  database: 'postgres',        
  password: 'aniwat2561',      
  port: 5432,               
});

export default pool;
