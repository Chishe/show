import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query("SELECT part_number FROM part_no ORDER BY id ASC");
    
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
