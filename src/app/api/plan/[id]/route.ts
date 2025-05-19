import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const planId = parseInt(params.id);

  if (isNaN(planId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const table = req.nextUrl.searchParams.get('table') || 'null';
  if (!table) {
    return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const planRes = await client.query(
      `SELECT partnumber FROM plan_${table} WHERE id = $1`,
      [planId]
    );

    if (planRes.rowCount === 0) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    const partnumber = planRes.rows[0].partnumber;

    const rowRes = await client.query(
      `SELECT seq FROM rows_${table} WHERE partnumber = $1`,
      [partnumber]
    );

    const rowId = rowRes?.rows?.[0]?.seq;

    if (rowId !== undefined) {
      await client.query(
        `DELETE FROM timeSlots_${table} WHERE row_id = $1`,
        [rowId]
      );

      await client.query(`DELETE FROM rows_${table} WHERE seq = $1`, [rowId]);
    }

    await client.query(`DELETE FROM plan_${table} WHERE id = $1`, [planId]);

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
