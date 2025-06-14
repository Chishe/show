import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nametableurl = searchParams.get("nametableurl") || "core_1";
    const dateParam = searchParams.get("date");
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(nametableurl)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    const sql = `
      SELECT itemno, situation, problemtype, factor, partno, details, action, pic, due, status, effectivelot,createdat 
      FROM records_${nametableurl} 
      WHERE due LIKE $1
      ORDER BY itemno ASC
    `;

    const result = await pool.query(sql, [`${dateParam}%`]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching records:", error);
    return new NextResponse("Failed to fetch records", { status: 500 });
  }
}
