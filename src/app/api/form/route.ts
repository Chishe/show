import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
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
      'INSERT INTO hvac_values (label, value, min, max) VALUES ($1, $2, $3, $4) RETURNING *',
      [label, valueNum, minNum, maxNum]
    );

    return new NextResponse(
      JSON.stringify({
        message: 'Data added successfully',
        result: result.rows[0],
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error inserting data:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error inserting data' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
