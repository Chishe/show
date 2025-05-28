import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(req: NextRequest,  context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;

  if (!id) {
    return new NextResponse(
      JSON.stringify({ message: 'Missing required field: id' }),
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
      'DELETE FROM kadai_list WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'Kadai not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Kadai deleted successfully',
        deletedItem: result.rows[0],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting kadai:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error deleting kadai' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
