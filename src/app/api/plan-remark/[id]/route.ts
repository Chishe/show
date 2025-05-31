import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  const planId = parseInt(id, 10);

  if (isNaN(planId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const table = req.nextUrl.searchParams.get("table");
  const date = req.nextUrl.searchParams.get("date");

  if (!table || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Missing or invalid table/date" }, { status: 400 });
  }

  const body = await req.json();
  const { remark } = body;

  if (typeof remark !== "string") {
    return NextResponse.json({ error: "Invalid remark value" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get plan row
    const planRes = await client.query(
      `SELECT id, partnumber, remark FROM plan_${table} WHERE id = $1 AND planDate = $2`,
      [planId, date]
    );

    if (planRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    const existingPartNo = planRes.rows[0].partnumber;
    const existingRemark = planRes.rows[0].remark;

    // 2. Skip update if same
    if (existingRemark === remark) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Remark is the same, no update performed" });
    }

    // 3. Update remark
    await client.query(
      `UPDATE plan_${table} SET remark = $1 WHERE id = $2 AND planDate = $3`,
      [remark, planId, date]
    );

    // 4. Insert into records_${table}
    await client.query(
      `
      INSERT INTO records_${table} (
        situation, problemtype, factor, partno, details, 
        action, pic, due, status, effectivelot
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
      [
        "",            // situation
        "remake",      // problemtype
        "",            // factor
        existingPartNo,
        "",            // details
        "",            // action
        "",            // pic
        date,          // due
        "Pending",     // status
        "",            // effectivelot
      ]
    );

    // 5. Insert into production_status_brs
    const columnMap: Record<string, string> = {
      core_1: "BRS Core 1",
      core_2: "BRS Core 2",
      core_3: "BRS Core 3",
      core_4: "BRS Core 4",
      core_5: "BRS Core 5",
      core_6: "BRS Core 6",
    };

    const columnName = columnMap[table] || "BRS Core 1";

    await client.query(
      `
      INSERT INTO production_status_brs (
        line_number, part_number, process_name, category,
        location, operating_rate, line_status,
        product, problem, action, pic
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `,
      [
        columnName,
        existingPartNo,
        "remake",     // process_name
        "Safety",     // category
        " ",          // location
        "0.00",       // operating_rate
        "Warning",    // line_status
        " ",          // product
        " ",          // problem
        " ",          // action
        " ",          // pic
      ]
    );

    await client.query("COMMIT");
    return NextResponse.json({ message: "Remark updated and records inserted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update error:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
