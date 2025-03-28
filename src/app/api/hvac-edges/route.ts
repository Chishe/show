import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { source, target } = await req.json();

  if (!source || !target) {
    return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const result = await db.query(
      'INSERT INTO edges_hvac (source, target) VALUES ($1, $2) RETURNING *',
      [source, target]
    );

    return new NextResponse(
      JSON.stringify({ message: 'Edge added successfully', result: result.rows[0] }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error inserting edge:', error);
    return new NextResponse('Error inserting edge', { status: 500 });
  }
}
