import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const newRecord = await request.json();
    const nametableurl = searchParams.get("table");


    if (!nametableurl || !/^[a-zA-Z0-9_]+$/.test(nametableurl)) {
      return NextResponse.json({ error: "Invalid or missing table name" }, { status: 400 });
    }
    const query = `
      INSERT INTO records_${nametableurl} (
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
    
    const columnName = columnMap[nametableurl || ""] || "BRS Core 1";

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
      columnName,                    
      newRecord.partNo,             
      "test",                      
      "Safety",                     
      columnName,                  
      "0.00",                      
      lineStatus,                   
      " ",                          
      " ",                          
      newRecord.action || " ",     
      newRecord.pic || " ",        
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
