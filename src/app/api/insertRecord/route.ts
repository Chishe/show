// /app/api/getRecords/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");

    if (!table) {
      return new NextResponse("Missing table parameter", { status: 400 });
    }

    const result = await pool.query(
      `SELECT itemno, situation, problemtype, factor, partno, details, action, pic, due, status, effectivelot FROM records_${table} ORDER BY itemno ASC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching records:", error);
    return new NextResponse("Failed to fetch records", { status: 500 });
  }
}
