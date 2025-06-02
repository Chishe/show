import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;
  const planId = parseInt(id, 10);
  console.log(planId);
  if (isNaN(planId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const table = req.nextUrl.searchParams.get('table');
  if (!table) {
    return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
  }

  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ ตรวจสอบว่ามี actual จริงอยู่หรือไม่ โดย join สามตาราง
    const actualCheck = await client.query(
      `
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM plan_${table} p
      JOIN rows_${table} r
        ON p.partnumber = r.partnumber AND r.date = p.plandate AND r.jude = 'night'
      JOIN timeSlots_${table} t
        ON r.seq = t.row_id AND t.date = p.plandate
      WHERE p.id = $1
        AND p.plandate = $2
        AND p.jude = 'night'
        AND jsonb_typeof(t.actual) = 'array'
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(t.actual) elem
          WHERE elem IS NOT NULL AND elem::text != 'null'
        )
    )
    THEN 1
    ELSE 0
  END AS has_actual_data;

      `,
      [planId, date]
    );

    const actualCount = parseInt(actualCheck.rows[0].has_actual_data, 10);
    if (actualCount > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Cannot delete: Actual data exists for this plan" },
        { status: 400 }
      );
    }


    // ✅ ดึง row_id เพื่อลบ timeSlots และ rows
    const rowRes = await client.query(
      `
      SELECT r.seq
      FROM plan_${table} p
      JOIN rows_${table} r ON p.partnumber = r.partnumber AND r.date = p.plandate
      WHERE p.id = $1 AND p.plandate = $2 AND p.jude = 'night'

      `,
      [planId, date]
    );

    const rowId = rowRes?.rows?.[0]?.seq;

    if (rowId !== undefined) {
      await client.query(
        `DELETE FROM timeSlots_${table} WHERE row_id = $1 AND date = $2`,
        [rowId, date]
      );

      await client.query(
        `DELETE FROM rows_${table} WHERE seq = $1 AND date = $2`,
        [rowId, date]
      );
    }

    // ✅ ลบ plan ที่ jude = 'night'
    await client.query(
      `DELETE FROM plan_${table} WHERE id = $1 AND plandate = $2 AND jude = 'night'`,
      [planId, date]
    );

    await client.query("COMMIT");
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete error:", error);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
