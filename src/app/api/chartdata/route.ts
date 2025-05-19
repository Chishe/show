import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table") || "core_1";

    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        r.partnumber,
        ts.timeSlot,
        jsonb_agg(ts.target) AS target_array,
        jsonb_agg(ts.actual) AS actual_array
      FROM rows_${table} r
      JOIN timeSlots_${table} ts ON r.seq = ts.row_id
      WHERE ts.target IS NOT NULL 
        AND ts.actual IS NOT NULL
              AND ts.date = CURRENT_DATE
      GROUP BY r.partnumber, ts.timeSlot
      ORDER BY r.partnumber, ts.timeSlot;
    `;

    const { rows } = await pool.query(query);

    const chartData = rows.map((row) => ({
      partNumber: row.partnumber,
      timeSlot: row.timeslot,
      targetA: row.target_array,
      actualA: row.actual_array,
    }));

    return NextResponse.json(chartData);
  } catch (err) {
    console.error("Error fetching chart data:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
