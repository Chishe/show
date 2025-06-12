import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nametableurl = searchParams.get("nametableurl") || "core_1";
        const time = searchParams.get("time");
    const now = new Date();
    const nowTime = now.toTimeString().slice(0, 5);
    const isDay = nowTime >= "07:35" && nowTime <= "18:50";
    let selectTime = "";

    if (nowTime >= "07:35" && nowTime <= "18:50") {
      selectTime = "day";
    } else {
      selectTime = "night";
    }
    
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
        WHERE ts.date = '${time}' AND ts.jude = '${selectTime}'
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
              '05:50-06:50', '04:50-05:50', '03:30-04:30',
              '02:40-03:30', '01:30-02:30', '00:30-01:30',
              '23:30-00:30', '22:30-23:30', '21:40-22:30',
              '20:30-21:30', '19:35-20:30'
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
    const lastValue = Array.isArray(actualArray)
      ? [...actualArray].reverse().find(val => val !== null && val !== undefined)
      : null;


    const effectivelotRes = await pool.query(`
    SELECT split_part(effectivelot, 'Lot-', 2) AS effectivelot
    FROM public.records_${nametableurl}
    WHERE due::date = '${time}'
    ORDER BY itemno DESC;
    `);

    const effectivelots = effectivelotRes.rows.map(row => row.effectivelot || "00:00-00:00");
    console.log("Effectivelot:", effectivelots);


    // 4. ตรวจสอบ sum target และ actual ใน slot เดียวกัน
    const sumsRes = await pool.query(`
      WITH actual_values AS (
        SELECT (jsonb_array_elements_text(t.actual))::int AS val
        FROM ${tableName} t
        WHERE date = '${time}' AND timeSlot = $1  AND jude = '${selectTime}'
      ),
      target_values AS (
        SELECT (jsonb_array_elements_text(t.target))::int AS val
        FROM ${tableName} t
        WHERE date = '${time}' AND timeSlot = $1  AND jude = '${selectTime}'
      )
      SELECT
        (SELECT COALESCE(SUM(val), 0) FROM actual_values) AS sum_actual,
        (SELECT COALESCE(SUM(val), 0) FROM target_values) AS sum_target;
    `, [actualLatestTimeSlot]);

    const timeSlotGroups = {
      day: [
        "07:35-08:30", "08:30-09:30", "09:40-10:30", "10:30-11:30",
        "12:30-13:30", "13:30-14:30", "14:40-15:30", "15:30-16:30",
        "16:50-17:50", "17:50-18:50"
      ],
      night: [
        "19:35-20:30", "20:30-21:30", "21:40-22:30", "22:30-23:30",
        "23:30-00:30", "00:30-01:30", "01:30-02:30", "02:40-03:30",
        "03:30-04:30", "04:50-05:50", "05:50-06:50"
      ]
    };

    const sumBySlotRes = await pool.query(`
SELECT t.timeslot,
       t.actual,  -- ดึง actual array จริง ๆ มาเพื่อตรวจสอบ null ใน JS
       SUM(a.elem::int) AS sum_actual,
       SUM(b.elem::int) AS sum_target
FROM ${tableName} t
LEFT JOIN LATERAL jsonb_array_elements_text(t.actual) WITH ORDINALITY AS a(elem, idx) ON true
LEFT JOIN LATERAL jsonb_array_elements_text(t.target) WITH ORDINALITY AS b(elem, idx) ON b.idx = a.idx
WHERE t.date = '${time}' AND t.jude = '${selectTime}'
GROUP BY t.timeslot, t.actual;
    `);

    type SlotData = {
      [slot: string]: { target: number; actual: number }
    };
    const sum_actual_day: SlotData = {};
    const sum_actual_night: SlotData = {}

sumBySlotRes.rows.forEach((row) => {
  const slot = row.timeslot as string;
  const actualArr = row.actual as any[]; // actual เป็น JSONB array
  const actual = Number(row.sum_actual || 0);
  const target = Number(row.sum_target || 0);

  // เช็คว่า actual array มีข้อมูลจริง ๆ หรือไม่ (ไม่ใช่ null/undefined ทั้งหมด)
  const hasActualData = Array.isArray(actualArr) && actualArr.some(val => val !== null && val !== undefined);

  // เช็คว่า actual array กรอกครบหรือไม่ (ไม่มีค่า null หรือ undefined)
  const isActualComplete = Array.isArray(actualArr) && actualArr.every(val => val !== null && val !== undefined);

  // ถ้าไม่มี actual เลย หรือ actual ยังกรอกไม่ครบ ให้ข้าม slot นี้
  if (!hasActualData || !isActualComplete) {
    return; // skip slot นี้
  }

  if (timeSlotGroups.day.includes(slot)) {
    sum_actual_day[slot] = { target, actual };
  } else if (timeSlotGroups.night.includes(slot)) {
    sum_actual_night[slot] = { target, actual };
  }
});

    

    const sum_actual = Number(sumsRes.rows[0].sum_actual);
    const sum_target = Number(sumsRes.rows[0].sum_target);
    ;

    const filteredDaySlots = Object.fromEntries(
      Object.entries(sum_actual_day).filter(([slot]) => {
        return isDay && slot <= nowTime;
      })
    );
    


    function getNodeColor(
      effectivelots: string[],
      sum_actual_day: Record<string, { target: number; actual: number }>,
      sum_actual_night: Record<string, { target: number; actual: number }>
    ): "yellow" | "red" | "green" {
      let hasTargetGreaterActualInEffective = false;

      const allSlots = { ...sum_actual_day, ...sum_actual_night };

      for (const slot in allSlots) {
        if (allSlots[slot].target > allSlots[slot].actual) {
          if (!effectivelots.includes(slot)) {
            return "red";
          } else {
            hasTargetGreaterActualInEffective = true;
          }
        }
      }

      if (hasTargetGreaterActualInEffective) {
        return "yellow";
      }

      return "green";
    }

    const node_color = getNodeColor(effectivelots, sum_actual_day, sum_actual_night);

    const totalActualAllSlots =
      Object.values(sum_actual_day).reduce((acc, cur) => acc + cur.actual, 0) +
      Object.values(sum_actual_night).reduce((acc, cur) => acc + cur.actual, 0);

    const totalTargetAllSlots =
      Object.values(sum_actual_day).reduce((acc, cur) => acc + cur.target, 0) +
      Object.values(sum_actual_night).reduce((acc, cur) => acc + cur.target, 0);

    const or_percent = totalTargetAllSlots > 0 ? Math.round((totalActualAllSlots / totalTargetAllSlots) * 100) : 0;

    return NextResponse.json({
      lastValue,
      sum_actual_day: filteredDaySlots,
      sum_actual_night: isDay ? {} : sum_actual_night,
      effectivelots,
      sum_target,
      sum_actual,
      all_sum_target_all_slots: totalTargetAllSlots,
      all_sum_actual_all_slots: totalActualAllSlots,
      or_percent,
      node_color
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
