import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT 
    r.partnumber,
    ts.timeSlot,
    jsonb_agg(ts.target) AS target_array,
    jsonb_agg(ts.actual) AS actual_array
FROM rows r
JOIN timeSlots ts ON r.seq = ts.row_id
WHERE ts.target IS NOT NULL 
  AND ts.actual IS NOT NULL
GROUP BY r.partnumber, ts.timeSlot
ORDER BY r.partnumber, ts.timeSlot;`
    );

    const chartData = rows.map((row) => ({
      partNumber: row.partnumber,
      timeSlot: row.timeslot,
      targetA: row.target_array,
      actualA: row.actual_array,
    }));

    return NextResponse.json(chartData);
  } catch (err) {
    console.error("Error fetching chart data:", err);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
