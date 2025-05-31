import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("nametableurl") || "core_1";
    const date = searchParams.get("date");
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
    }
    const query = `
      SELECT 
        r.seq,
        r.partnumber,
        ts.timeSlot,
        jsonb_agg(ts.target) AS target_array,
        jsonb_agg(ts.actual) AS actual_array
      FROM rows_${table} r
      JOIN timeSlots_${table} ts ON r.seq = ts.row_id
      WHERE ts.target IS NOT NULL 
        AND ts.actual IS NOT NULL
        AND ts.date = $1
        AND ts.timeSlot IN (
          '07:35-08:30',
          '08:30-09:30',
          '09:40-10:30',
          '10:30-11:30',
          '12:30-13:30',
          '13:30-14:30',
          '14:40-15:30',
          '15:30-16:30',
          '16:50-17:50',
          '17:50-18:50'
        )
      GROUP BY r.seq, r.partnumber, ts.timeSlot
      ORDER BY 
        r.seq ASC,
        CASE ts.timeSlot
          WHEN '07:35-08:30' THEN 1
          WHEN '08:30-09:30' THEN 2
          WHEN '09:40-10:30' THEN 3
          WHEN '10:30-11:30' THEN 4
          WHEN '12:30-13:30' THEN 5
          WHEN '13:30-14:30' THEN 6
          WHEN '14:40-15:30' THEN 7
          WHEN '15:30-16:30' THEN 8
          WHEN '16:50-17:50' THEN 9
          WHEN '17:50-18:50' THEN 10
          ELSE 999
        END;
    `;

    const { rows } = await pool.query(query, [date]);
    const chartData = rows.map((row) => ({
      partNumber: row.partnumber,
      timeSlot: row.timeslot,
      targetA: row.target_array,
      actualA: row.actual_array,
    }));

    return NextResponse.json(chartData);
  } catch (err) {
    console.error("Error fetching chart data:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
