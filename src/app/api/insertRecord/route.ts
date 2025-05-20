import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const table = req.nextUrl.searchParams.get("table");
    const newRecord = await req.json();

    const query = `
      INSERT INTO records_${table} (
        situation, problemtype, factor, partno, details, 
        action, pic, due, status, effectivelot
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
      newRecord.situation,
      newRecord.problemType,
      newRecord.factor,
      newRecord.partNo,
      newRecord.details,
      newRecord.action,
      newRecord.pic,
      newRecord.due,
      newRecord.status,
      newRecord.effectiveLot,
    ];

    const result = await pool.query(query, values);

    const columnMap: Record<string, string> = {
      core_1: "BRS Core 1",
      core_2: "BRS Core 2",
      core_3: "BRS Core 3",
      core_4: "BRS Core 4",
      core_5: "BRS Core 5",
      core_6: "BRS Core 6",
    };
    
    const columnName = columnMap[table || ""] || "BRS Core 1";

    const situation = newRecord.situation?.toLowerCase();
    const lineStatus =
      situation === "chokotei" ? "Warning" :
      situation === "big loss" ? "Critical" :
      "Normal";

    const brsQuery = `
      INSERT INTO production_status_brs (
        line_number, part_number, process_name, category,
        location, operating_rate, line_status,
        product, problem, action, pic
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const brsValues = [
      columnName,                    // line_number
      newRecord.partNo,             // part_number
      "test",                       // process_name
      "Safety",                     // category
      columnName,                   // location
      "0.00",                       // operating_rate
      lineStatus,                   // line_status
      " ",                          // product
      " ",                          // problem
      newRecord.action || " ",      // action
      newRecord.pic || " ",         // pic
    ];

    const brsResult = await pool.query(brsQuery, brsValues);

    return NextResponse.json({
      insertedRecord: result.rows[0],
      productionStatus: brsResult.rows[0],
    });

  } catch (error) {
    console.error("Error inserting record:", error);
    return new NextResponse("Error inserting record", { status: 500 });
  }
}
