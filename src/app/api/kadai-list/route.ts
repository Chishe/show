import pool from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const dateTime = url.searchParams.get('datetime'); 

    let query = "SELECT * FROM kadai_list ORDER BY id ASC";
    let values: string[] = []; 

    if (dateTime) {
      query = "SELECT * FROM kadai_list WHERE date <= $1 ORDER BY id ASC"; 
      values = [dateTime]; 
    }

    const result = await pool.query(query, values);

    return new Response(JSON.stringify(result.rows), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response('Error fetching data', { status: 500 });
  }
}
