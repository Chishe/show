import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Await the params object to access the id properly
  const { id } = await params;

  // Validate ID (simple numeric check if it's a valid number)
  if (!id || isNaN(Number(id))) {
    return new NextResponse(
      JSON.stringify({ message: 'Invalid or missing id' }),
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
      'DELETE FROM hvac_values WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'Item not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Item deleted successfully',
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
    console.error('Error deleting item:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error deleting item' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
