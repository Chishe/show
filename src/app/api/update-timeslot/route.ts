// app/api/update-timeslot/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { seq, slot, index, type, value } = await req.json();
    const table = req.nextUrl.searchParams.get("table");

    const selectResult = await pool.query(
      `SELECT jsonb_object_agg(ts.timeSlot, jsonb_build_object('target', ts.target, 'actual', ts.actual)) AS timeslots FROM timeSlots_${table} ts WHERE row_id = $1 GROUP BY row_id`,
      [seq]
    );

    if (selectResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Row not found" },
        { status: 404 }
      );
    }

    const currentTimeslots = selectResult.rows[0].timeslots;

    if (!currentTimeslots[slot]) {
      return NextResponse.json(
        { success: false, message: "Invalid slot" },
        { status: 400 }
      );
    }

    const slotData = currentTimeslots[slot];
    const updatedArray = [...slotData[type]];
    updatedArray[index] = value;

    await pool.query(
      `UPDATE timeSlots_${table} SET ${type} = $1 WHERE row_id = $2 AND timeSlot = $3`,
      [JSON.stringify(updatedArray), seq, slot]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { success: false, message: "Database update failed" },
      { status: 500 }
    );
  }
}
