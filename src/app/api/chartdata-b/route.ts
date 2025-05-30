import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("nametableurl") || "core_1";
    const date = searchParams.get("date");

    // Validate table and date
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
    }

    // Dynamically build the safe query using parameterized inputs
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
        '19:35-20:30',
        '20:30-21:30',
        '21:40-22:30',
        '00:30-01:30',
        '01:30-02:30',
        '02:40-03:30',
        '03:30-04:30',
        '04:50-05:50',
        '05:50-06:50'
        )
      GROUP BY r.seq, r.partnumber, ts.timeSlot
      ORDER BY 
        r.seq ASC,
        CASE ts.timeSlot
        WHEN '19:35-20:30' THEN 1
        WHEN '20:30-21:30' THEN 2
        WHEN '21:40-22:30' THEN 3
        WHEN '00:30-01:30' THEN 4
        WHEN '01:30-02:30' THEN 5
        WHEN '02:40-03:30' THEN 6
        WHEN '03:30-04:30' THEN 7
        WHEN '04:50-05:50' THEN 8
        WHEN '05:50-06:50' THEN 9
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
