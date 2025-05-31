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
SELECT id, sequence, partnumber, model, qty, cttarget,starttime,endtime
FROM plan_${table}
WHERE plandate = $1 and jude = 'day'
  AND NOT (
    (starttime < '20:30' AND endtime > '19:35') OR
    (starttime < '21:30' AND endtime > '20:30') OR
    (starttime < '22:30' AND endtime > '21:40') OR
    (starttime < '01:30' AND endtime > '00:30') OR
    (starttime < '02:30' AND endtime > '01:30') OR
    (starttime < '03:30' AND endtime > '02:40') OR
    (starttime < '04:30' AND endtime > '03:30') OR
    (starttime < '05:50' AND endtime > '04:50') OR
    (starttime < '06:50' AND endtime > '05:50')
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
