import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemno, field, value } = body;

    const table = req.nextUrl.searchParams.get("table");

    const fieldMap: Record<string, string> = {
      situation: "situation",
      problemtype: "problemtype",
      factor: "factor",
      partNo: "partno",
      details: "details",
      action: "action",
      pic: "pic",
      due: "due",
      status: "status",
      effectiveLot: "effectivelot",
    };

    if (!fieldMap[field]) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const dbField = fieldMap[field];

    const query = `UPDATE records_${table} SET "${dbField}" = $1 WHERE "itemno" = $2`;
    await pool.query(query, [value, itemno]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating record:", error);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}
