import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("nametableurl") || "core_1";
  const date = searchParams.get("date");

  if (!/^[a-zA-Z0-9_]+$/.test(table)) {
    return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
  }

  try {
    const query = `
SELECT id, sequence, partnumber, model, qty, cttarget, starttime, endtime
FROM plan_${table}
WHERE plandate = $1
  AND NOT (
    (starttime < '08:30' AND endtime > '07:35') OR
    (starttime < '09:30' AND endtime > '08:30') OR
    (starttime < '10:30' AND endtime > '09:40') OR
    (starttime < '11:30' AND endtime > '10:30') OR
    (starttime < '13:30' AND endtime > '12:30') OR
    (starttime < '14:30' AND endtime > '13:30') OR
    (starttime < '15:30' AND endtime > '14:40') OR
    (starttime < '16:30' AND endtime > '15:30') OR
    (starttime < '17:50' AND endtime > '16:50') OR
    (starttime < '18:50' AND endtime > '17:50')
  )
ORDER BY sequence;
    `;

    const result = await pool.query(query, [date]);

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
