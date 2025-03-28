import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { item,station } = await req.json();

    if (!item || !station) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = await db.query(
      'INSERT INTO kadai_list (item, due, date, station) VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $2) RETURNING *',
      [item,station]
    );

    return new NextResponse(
      JSON.stringify({
        message: 'Kadai added successfully',
        result: result.rows[0],
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error inserting kadai:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error inserting kadai' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
