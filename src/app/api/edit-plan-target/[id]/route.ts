import { NextRequest, NextResponse } from "next/server";
import pool from '@/lib/db';

export async function PUT(req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;
  const planId = parseInt(id, 10);
  const table = req.nextUrl.searchParams.get("table");
  const date = req.nextUrl.searchParams.get("date");

  if (isNaN(planId) || !table || !date) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    // 1. ดึง timeslot ที่อยู่ในช่วงเวลา
    const { rows: timeslotRows } = await pool.query(`
      WITH time_ranges AS (
        SELECT '07:35-08:30' AS timeslot, '07:35'::time AS start_range, '08:30'::time AS end_range
        UNION ALL SELECT '08:30-09:30', '08:30', '09:30'
        UNION ALL SELECT '09:40-10:30', '09:40', '10:30'
        UNION ALL SELECT '10:30-11:30', '10:30', '11:30'
        UNION ALL SELECT '12:30-13:30', '12:30', '13:30'
        UNION ALL SELECT '13:30-14:30', '13:30', '14:30'
        UNION ALL SELECT '14:40-15:30', '14:40', '15:30'
        UNION ALL SELECT '15:30-16:30', '15:30', '16:30'
        UNION ALL SELECT '16:50-17:50', '16:50', '17:50'
        UNION ALL SELECT '17:50-18:50', '17:50', '18:50'
        UNION ALL SELECT '19:35-20:30', '19:35', '20:30'
        UNION ALL SELECT '20:30-21:30', '20:30', '21:30'
        UNION ALL SELECT '21:40-22:30', '21:40', '22:30'
        UNION ALL SELECT '00:30-01:30', '00:30', '01:30'
        UNION ALL SELECT '01:30-02:30', '01:30', '02:30'
        UNION ALL SELECT '02:40-03:30', '02:40', '03:30'
        UNION ALL SELECT '03:30-04:30', '03:30', '04:30'
        UNION ALL SELECT '04:50-05:50', '04:50', '05:50'
        UNION ALL SELECT '05:50-06:50', '05:50', '06:50'
      )
      SELECT DISTINCT tr.timeslot
      FROM plan_${table} p
      JOIN time_ranges tr
        ON p.starttime::time < tr.end_range
       AND p.endtime::time > tr.start_range
      WHERE p.id = $1 AND p.plandate = $2 AND p.jude ='day'
    `, [planId, date]);

    const timeSlots = timeslotRows.map(r => r.timeslot);
    if (timeSlots.length === 0) {
      return NextResponse.json({ message: "No matching timeslots" }, { status: 404 });
    }

    // 2. อัปเดต cleaned_target ลงใน target
    for (const slot of timeSlots) {
      await pool.query(`
        WITH cleaned AS (
          SELECT
            t.row_id,
            jsonb_agg(
              CASE
                WHEN actual_elem.value IS NOT NULL
                  AND actual_elem.value::text != 'null'
                  AND actual_elem.value::text != '0'
                THEN target_elem.value
                ELSE NULL
              END
            ) AS cleaned_target
          FROM plan_${table} p
          JOIN rows_${table} r ON p.partnumber = r.partnumber AND r.date = p.plandate AND r.jude = 'day'
          JOIN timeSlots_${table} t ON r.seq = t.row_id AND t.date = p.plandate AND t.timeslot = $3 AND t.jude = 'day'
          JOIN jsonb_array_elements(t.target) WITH ORDINALITY AS target_elem(value, ordinality) ON TRUE
          LEFT JOIN jsonb_array_elements(t.actual) WITH ORDINALITY AS actual_elem(value, ordinality)
            ON target_elem.ordinality = actual_elem.ordinality
          WHERE p.id = $1 AND p.plandate = $2  AND p.jude = 'day'
          GROUP BY t.row_id
        )
        UPDATE timeSlots_${table} t
        SET target = cleaned.cleaned_target
        FROM cleaned
        WHERE t.row_id = cleaned.row_id AND t.date = $2 AND t.timeslot = $3;
      `, [planId, date, slot]);
    }

    // 3. รวม target ทั้งหมด (เฉพาะที่ไม่ใช่ null, 'null', '0')
    const { rows: totalRows } = await pool.query(`
      WITH target_values AS (
        SELECT jsonb_array_elements_text(t.target) AS value_text
        FROM plan_${table} p
        JOIN rows_${table} r ON p.partnumber = r.partnumber AND r.date = p.plandate AND r.jude = 'day'
        JOIN timeSlots_${table} t ON r.seq = t.row_id AND t.date = p.plandate AND t.jude = 'day'
        WHERE p.id = $1 AND p.plandate = $2 AND t.timeslot = ANY($3::text[]) AND p.jude = 'day'
      )
      SELECT SUM(value_text::numeric) AS total_target_sum
      FROM target_values
      WHERE value_text IS NOT NULL AND value_text != 'null' AND value_text != '0';
    `, [planId, date, timeSlots]);

    const totalTargetSum = totalRows[0]?.total_target_sum || 0;

    // 4. อัปเดต qty ด้วยยอดรวม
    await pool.query(`
      UPDATE plan_${table}
      SET qty = $3,
          cttarget = ROUND(cttarget / 2)
      WHERE id = $1 AND plandate = $2 AND jude = 'day';
    `, [planId, date, totalTargetSum]);
    
    

    // 5. ลบแถวอื่นที่ partnumber เดียวกัน และ qty = 0 หรือ null (ยกเว้นแถวปัจจุบัน)
    await pool.query(`
      DELETE FROM plan_${table}
      WHERE partnumber IN (
        SELECT partnumber FROM plan_${table}
        WHERE id = $1 AND plandate = $2 AND jude = 'day'
      )
      AND id != $1
      AND plandate = $2
    `, [planId, date]);

    return NextResponse.json({ message: "Update complete", totalTargetSum });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
