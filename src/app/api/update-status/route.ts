// app/api/update-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { seq, field, value } = body;

  if (!["partdimension", "firstpiece", "machinestatus", "componentstatus"].includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  try {
    await pool.query(
      `UPDATE rows SET ${field} = $1 WHERE seq = $2`,
      [value, seq]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
