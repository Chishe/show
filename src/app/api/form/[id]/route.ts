import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();

    const label = formData.get('label');
    const value = formData.get('value');
    const min = formData.get('min');
    const max = formData.get('max');
    if (!label || !value || !min || !max) {
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

    const valueNum = parseFloat(value as string);
    const minNum = parseFloat(min as string);
    const maxNum = parseFloat(max as string);

    if (isNaN(valueNum) || isNaN(minNum) || isNaN(maxNum)) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid numeric values provided' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    const result = await db.query(
      'UPDATE hvac_values SET label = $1, value = $2, min = $3, max = $4 WHERE id = $5 RETURNING *',
      [label, valueNum, minNum, maxNum, req.nextUrl.pathname.split('/').pop()]
    );

    if (result.rowCount === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'Record not found' }),
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
        message: 'Data updated successfully',
        result: result.rows[0],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error updating data:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error updating data' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
