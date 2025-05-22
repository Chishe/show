import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

function convertDateToDDMMYYYY(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nametableurl = searchParams.get("nametableurl") || "core_1";
    const dateParam = searchParams.get("date");
    console.log(dateParam)
    if (!/^[a-zA-Z0-9_]+$/.test(nametableurl)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
    }

    const formattedDate = convertDateToDDMMYYYY(dateParam);

    const sql = `
      SELECT itemno, situation, problemtype, factor, partno, details, action, pic, due, status, effectivelot 
      FROM records_${nametableurl} 
      WHERE due LIKE $1
      ORDER BY itemno ASC
    `;

    const result = await pool.query(sql, [`${formattedDate}%`]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching records:", error);
    return new NextResponse("Failed to fetch records", { status: 500 });
  }
}
