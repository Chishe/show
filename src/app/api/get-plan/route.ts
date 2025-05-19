// app/api/get-plan/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface PlanRow {
  id: number;
  sequence: number;
  partnumber: string;
  model: string;
  qty: number;
  cttarget: number;
  starttime: string;
  endtime: string;
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT id, sequence, partnumber, model, qty, cttarget, starttime, endtime FROM plan WHERE planDate = $1 ORDER BY sequence',
      [today]
    );

    const data = result.rows.map((row: PlanRow) => ({
      id: row.id,
      sequence: row.sequence,
      partNumber: row.partnumber,
      model: row.model,
      qty: row.qty.toString(),
      ctTarget: row.cttarget.toString(),
      startTime: row.starttime,
      endTime: row.endtime,
      stockPart: '',
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
