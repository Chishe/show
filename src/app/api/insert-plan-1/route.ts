import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { distributeByPartnumbers } from "@/lib/distribute2";

export async function POST(req: NextRequest) {
  try {
    const inputs = await req.json();

    const table = req.nextUrl.searchParams.get("table") || "null";
    if (!table) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

    const qtySumMap = new Map<string, number>();
    for (const input of inputs) {
      qtySumMap.set(
        input.partnumber,
        (qtySumMap.get(input.partnumber) ?? 0) + input.qty
      );
    }

    const grouped = distributeByPartnumbers(inputs);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const input of inputs) {
        const {
          sequence,
          partnumber,
          model,
          qty,
          cttarget,
          starttime,
          endtime,
        } = input;

        const planDate = new Date().toISOString().slice(0, 10);

        const res = await client.query(
          `SELECT id FROM plan_${table} WHERE sequence = $1 AND partnumber = $2 AND planDate = $3`,
          [sequence, partnumber, planDate]
        );

        let planId;
        if (res.rowCount === 0) {
          const insertRes = await client.query(
            `INSERT INTO plan_${table} 
              (sequence, partnumber, model, qty, cttarget, starttime, endtime, planDate)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
              sequence,
              partnumber,
              model,
              qty,
              cttarget,
              starttime,
              endtime,
              planDate,
            ]
          );
          planId = insertRes.rows[0].id;
        } else {
          planId = res.rows[0].id;
          await client.query(
            `UPDATE plan_${table} SET
              model = $1,
              qty = $2,
              cttarget = $3,
              starttime = $4,
              endtime = $5,
              updatedAt = CURRENT_TIMESTAMP
             WHERE id = $6`,
            [model, qty, cttarget, starttime, endtime, planId]
          );
        }
      }

      for (const [partnumber, totalQty] of qtySumMap.entries()) {
        const rowRes = await client.query(
          `SELECT seq FROM rows_${table} WHERE partNumber = $1`,
          [partnumber]
        );
        if (rowRes.rowCount === 0) {
          await client.query(
            `INSERT INTO rows_${table} (partNumber, qty, partdimension, firstpiece, machinestatus, componentstatus)
             VALUES ($1, $2, 'OK', 'OK', 'OK', 'OK')`,
            [partnumber, totalQty]
          );
        } else {
          const rowId = rowRes.rows[0].seq;
          await client.query(
            `UPDATE rows_${table} SET qty = $1 WHERE seq = $2`,
            [totalQty, rowId]
          );
        }
      }

      for (const [partnumber, timeSlotData] of Object.entries(grouped)) {
        const rowRes = await client.query(
          `SELECT seq FROM rows_${table} WHERE partNumber = $1`,
          [partnumber]
        );
        if (rowRes.rowCount === 0) {
          continue;
        }
        const rowId = rowRes.rows[0].seq;

        for (const [timeSlot, targets] of Object.entries(timeSlotData)) {
          const actuals = targets.map(() => null);

          await client.query(
            `INSERT INTO timeSlots_${table} (row_id, timeSlot, target, actual)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (row_id, timeSlot) DO UPDATE
             SET target = EXCLUDED.target, actual = EXCLUDED.actual`,
            [rowId, timeSlot, JSON.stringify(targets), JSON.stringify(actuals)]
          );
        }
      }

      await client.query("COMMIT");
      return NextResponse.json({ message: "Data saved successfully" });
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Error during transaction", e);
      return NextResponse.json(
        { message: "Database transaction failed" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in POST request", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
