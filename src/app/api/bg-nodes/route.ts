import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const nametableurl = searchParams.get("nametableurl") || "core_1";
    if (!/^[a-zA-Z0-9_]+$/.test(nametableurl)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const timeslotTable = `timeSlots_${nametableurl}`;

    const rowsQuery = `
        WITH
        time_ranges AS (
          SELECT
            row_id,
            split_part(timeSlot, '-', 1)::time AS slot_start,
            split_part(timeSlot, '-', 2)::time AS slot_end,
            (target->>'value')::int AS target_value,
            (actual->>'value')::int AS actual_value,
            date
          FROM ${timeslotTable}
          WHERE date = $1
        ),
        params AS (
          SELECT
            '07:30'::time AS start_time,
            ('07:30'::time + interval '1 hour')::time AS one_hour_later,
            CURRENT_TIME AS now_time,
            '10:00'::time AS end_time
        ),
        agg AS (
          SELECT
            row_id,
            SUM(target_value) AS total_target,
            SUM(actual_value) AS total_actual
          FROM time_ranges, params
          WHERE slot_start >= params.start_time
            AND slot_start <= params.end_time
          GROUP BY row_id
        )
SELECT
  agg.row_id,
  agg.total_target,
  agg.total_actual,
  CASE
    WHEN params.now_time >= params.one_hour_later AND agg.total_actual < agg.total_target THEN 'red'
    WHEN agg.total_actual >= agg.total_target THEN 'green'
    WHEN agg.total_actual < agg.total_target THEN 'yellow'
    ELSE 'yellow'
  END AS node_color,
  CASE
    WHEN agg.total_target = 0 THEN '0%'
    ELSE TO_CHAR(ROUND((agg.total_actual::numeric / agg.total_target) * 100, 2), 'FM999999990.00') || '%'
  END AS Or
FROM agg, params
ORDER BY agg.row_id;

      `;

    const rowsResult = await pool.query(rowsQuery, [date]);

    return NextResponse.json(rowsResult.rows);
  } catch (error: unknown) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch data" },
      { status: 500 }
    );
  }
}

