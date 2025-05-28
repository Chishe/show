import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(req: NextRequest,  context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;

  if (!id) {
    return new NextResponse(JSON.stringify({ message: 'Missing edge ID' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const result = await db.query('DELETE FROM edges_hvac WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ message: 'Edge not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new NextResponse(JSON.stringify({ message: 'Edge deleted successfully', result: result.rows }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting edge:', error);
    return new NextResponse('Error deleting edge', { status: 500 });
  }
}
