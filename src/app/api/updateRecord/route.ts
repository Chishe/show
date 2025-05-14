import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { itemno, field, value } = body;


    const allowedFields = [
      "situation",
      "problemtype",
      "factor",
      "partno",
      "details",
      "action",
      "pic",
      "due",
      "status",
      "effectivelot"
    ];
    if (!allowedFields.includes(field)) {
      return new NextResponse("Invalid field", { status: 400 });
    }

    const query = `UPDATE records SET "${field}" = $1 WHERE "itemno" = $2`;
    await pool.query(query, [value, itemno]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating record:", error);
    return new NextResponse("Failed to update record", { status: 500 });
  }
}
