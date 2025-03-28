import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return new NextResponse(
      JSON.stringify({ message: 'Missing node ID' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const { label } = await req.json();

    if (!label) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required fields (label)' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = await db.query(
      'UPDATE nodes_hvac SET label = $1 WHERE id = $2 RETURNING *',
      [label, id]
    );

    if (result.rows.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'Node not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: 'Node updated successfully', result: result.rows[0] }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error updating node:', error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error updating node',
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
