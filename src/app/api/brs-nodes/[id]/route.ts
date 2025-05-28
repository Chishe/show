import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return new NextResponse(JSON.stringify({ message: 'Missing node ID' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const { x, y } = await req.json();

    if (!x || !y) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await db.query(
      'UPDATE nodes_brs SET x = $1, y = $2 WHERE id = $3 RETURNING *',
      [x, y, id]
    );

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ message: 'Node not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new NextResponse(
      JSON.stringify({ message: 'Node updated successfully', result: result.rows }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Error updating node:', error);
  
    const err = error as Error;
    return new NextResponse(
      JSON.stringify({ message: 'Error updating node', error: err.message }),
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return new NextResponse(JSON.stringify({ message: 'Missing node ID' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const result = await db.query('DELETE FROM nodes_brs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ message: 'Node not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new NextResponse(
      JSON.stringify({ message: 'Node deleted successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Error updating node:', error);
  
    const err = error as Error;
    return new NextResponse(
      JSON.stringify({ message: 'Error updating node', error: err.message }),
      { status: 500 }
    );
  }
}
