import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nametableurl = searchParams.get("nametableurl") || "core_1";

    if (!/^[a-zA-Z0-9_]+$/.test(nametableurl)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    const tableName = `timeSlots_${nametableurl}`;

    // 1. ดึง slot ล่าสุดที่มี actual
    const actualLatestRes = await pool.query(`
      WITH time_config AS (
        SELECT
          CASE
            WHEN CURRENT_TIME BETWEEN '07:35'::time AND '18:50'::time THEN 'day'
            ELSE 'night'
          END AS time_mode
      ),
      all_slots AS (
        SELECT 
          ts.timeSlot,
          ts.actual,
          (elem.value)::int AS actual_last_value
        FROM ${tableName} ts,
        LATERAL (
          SELECT elem.value, elem.ordinality
          FROM jsonb_array_elements(actual) WITH ORDINALITY AS elem(value, ordinality)
          WHERE elem.value IS NOT NULL
            AND elem.value != 'null'::jsonb
          ORDER BY elem.ordinality DESC
          LIMIT 1
        ) AS elem
        WHERE ts.date = CURRENT_DATE
      ),
      ordered_slots AS (
        SELECT *,
          CASE
            WHEN t.timeSlot IN (
              '07:35-08:30', '08:30-09:30', '09:40-10:30',
              '10:30-11:30', '12:30-13:30', '13:30-14:30',
              '14:40-15:30', '15:30-16:30', '16:50-17:50', '17:50-18:50'
            ) THEN 'day'
            ELSE 'night'
          END AS slot_mode,
          CASE
            WHEN t.timeSlot IN (
              '07:35-08:30', '08:30-09:30', '09:40-10:30',
              '10:30-11:30', '12:30-13:30', '13:30-14:30',
              '14:40-15:30', '15:30-16:30', '16:50-17:50', '17:50-18:50'
            ) THEN ARRAY_POSITION(ARRAY[
              '17:50-18:50', '16:50-17:50', '15:30-16:30', '14:40-15:30',
              '13:30-14:30', '12:30-13:30', '10:30-11:30', '09:40-10:30',
              '08:30-09:30', '07:35-08:30'
            ], t.timeSlot)
            ELSE ARRAY_POSITION(ARRAY[
              '19:35-20:30', '20:30-21:30', '21:40-22:30',
              '00:30-01:30', '01:30-02:30', '02:40-03:30',
              '03:30-04:30', '04:50-05:50', '05:50-06:50'
            ], t.timeSlot)
          END AS slot_order
        FROM all_slots t
      )
      SELECT timeSlot, actual_last_value, actual
      FROM ordered_slots o
      JOIN time_config c ON o.slot_mode = c.time_mode
      ORDER BY o.slot_order
      LIMIT 1;
    `);

    if (actualLatestRes.rowCount === 0) {
      return NextResponse.json({ error: "No actual latest found" }, { status: 404 });
    }

    const actualLatestRow = actualLatestRes.rows[0];
    const actualLatestTimeSlot = actualLatestRow.timeslot || actualLatestRow.timeSlot;
    const actualArray = actualLatestRow.actual;
    const lastValue = Array.isArray(actualArray) && actualArray.length > 0
    ? actualArray[actualArray.length - 1]
    : null;
  
    // 2. ดึง effectivelot ล่าสุด
    const effectivelotRes = await pool.query(`
      SELECT split_part(effectivelot, 'Lot-', 2) AS effectivelot
      FROM public.records_core_1
      ORDER BY itemno DESC
      LIMIT 1;
    `);
    const effectivelot = effectivelotRes.rows[0]?.effectivelot || "00:00-00:00";

    // 3. รวม actual/target ที่ <= actualLatestTimeSlot
    const sumsRes = await pool.query(`
      WITH filtered_slots AS (
        SELECT ts.actual, ts.target
        FROM ${tableName} ts
        WHERE ts.date = CURRENT_DATE
          AND ts.timeSlot <= $1 
      ),
      actuals AS (
        SELECT (jsonb_array_elements_text(actual))::int AS value
        FROM filtered_slots
      ),
      targets AS (
        SELECT (jsonb_array_elements_text(target))::int AS value
        FROM filtered_slots
      )
      SELECT
        (SELECT COALESCE(SUM(value), 0) FROM actuals) AS sum_actual,
        (SELECT COALESCE(SUM(value), 0) FROM targets) AS sum_target;
    `, [actualLatestTimeSlot]);
    
      console.log(actualLatestTimeSlot)

    const sum_actual = Number(sumsRes.rows[0].sum_actual);
    const sum_target = Number(sumsRes.rows[0].sum_target);
    const or_percent = sum_target > 0 ? Math.round((sum_actual / sum_target) * 100) : 0;

    const hasActualInLatestSlot = lastValue !== null && lastValue !== "null";

    // คำนวณสี
    let node_color = "green";
    
    if (sum_target === sum_actual) {
      node_color = "green";
    } else if (sum_target > sum_actual && actualLatestTimeSlot === effectivelot) {
      node_color = "yellow";
    } else if (sum_target > sum_actual && actualLatestTimeSlot !== effectivelot) {
      node_color = hasActualInLatestSlot ? "red" : "yellow";
    }
    
    return NextResponse.json([
      {
        node_color,
        actualLatestTimeSlot,
        effectivelot,
        sum_actual,
        sum_target,
        or_percent,
        lastValue
      }
    ]);
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
