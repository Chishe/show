import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seq, field, value } = body;
    const table = req.nextUrl.searchParams.get("table");



    const allowedFields = ["partdimension", "firstpiece", "machinestatus", "componentstatus"];

    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const query = `UPDATE rows_${table} SET ${field} = $1 WHERE seq = $2`;

    await pool.query(query, [value, seq]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
