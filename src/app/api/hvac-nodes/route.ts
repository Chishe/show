import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { label, x, y, bg,type } = await req.json();

  if (!label || !x || !y || !type) {
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

  try {
    const result = await db.query(
      'INSERT INTO nodes_hvac (label, x, y, backgroundcolor,type) VALUES ($1, $2, $3, $4, $5)',
      [label, x, y, bg, type]
    );

    return new NextResponse(
      JSON.stringify({ message: 'Node added successfully', result: result.rows }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error inserting node:', error);
    return new NextResponse('Error inserting node', { status: 500 });
  }
}
