import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params; 

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
    const { item } = await req.json();

    if (!item) {
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
      'UPDATE kadai_list SET item = $1,  due = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [item, id]
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
      JSON.stringify({
        message: 'Node updated successfully',
        result: result.rows,
      }),
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
      JSON.stringify({ message: 'Error updating node', error: error.message }),
      { status: 500 }
    );
  }
}
