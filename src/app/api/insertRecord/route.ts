import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const newRecord = await req.json();

    const query = `
      INSERT INTO records (
        situation, problemtype, factor, partno, details, 
        action, pic, due, status, effectivelot
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
      newRecord.situation,
      newRecord.problemType,
      newRecord.factor,
      newRecord.partNo,
      newRecord.details,
      newRecord.action,
      newRecord.pic,
      newRecord.due,
      newRecord.status,
      newRecord.effectiveLot,
    ];

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting record:', error);
    return new NextResponse('Error inserting record', { status: 500 });
  }
}
