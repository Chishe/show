import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ message: 'Missing edge ID' }, { status: 400 });
  }

  try {
    const result = await db.query('DELETE FROM edges_brs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Edge not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Edge deleted successfully', result: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting edge:', error);
    return NextResponse.json({ message: 'Error deleting edge' }, { status: 500 });
  }
}
