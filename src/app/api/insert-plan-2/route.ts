import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { distributeByPartnumbers } from "@/lib/distribute3";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
    }

    const inputs = await req.json();
    const table = req.nextUrl.searchParams.get("table") || "null";
    if (!table) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 });
    }

    const qtySumMap = new Map<string, number>();
    for (const input of inputs) {
      qtySumMap.set(
        input.partnumber,
        (qtySumMap.get(input.partnumber) ?? 0) + input.qty
      );
    }
    type PartnumberRow = {
      partnumber: string;
    };

    const grouped = distributeByPartnumbers(inputs);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get old partnumbers before delete
      const oldPartRes = await client.query(
        `SELECT DISTINCT partnumber FROM plan_${table} WHERE planDate = $1 AND jude = 'day'`,
        [date]
      );
      const oldPartnumbers = oldPartRes.rows.map((row: PartnumberRow) => row.partnumber);

      // DELETE old plans
      await client.query(
        `DELETE FROM plan_${table} WHERE planDate = $1 AND jude = 'day'`,
        [date]
      );

      // INSERT new plans
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

        await client.query(
          `INSERT INTO plan_${table} 
            (sequence, partnumber, model, qty, cttarget, starttime, endtime, planDate, jude)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'day')`,
          [sequence, partnumber, model, qty, cttarget, starttime, endtime, date]
        );
      }

      // DELETE rows_ and timeSlots_ for removed partnumbers
      const newPartnumbers = Array.from(qtySumMap.keys());
      const removedParts = oldPartnumbers.filter(pn => !newPartnumbers.includes(pn));
      for (const partnumber of removedParts) {
        const rowRes = await client.query(
          `SELECT seq FROM rows_${table} WHERE partNumber = $1 AND date = $2 AND jude = 'day'`,
          [partnumber, date]
        );
        if ((rowRes.rowCount ?? 0) > 0) {
          const rowId = rowRes.rows[0].seq;
          await client.query(`DELETE FROM timeSlots_${table} WHERE row_id = $1 AND date = $2 AND jude = 'day'`, [rowId, date]);
        }
        await client.query(`DELETE FROM rows_${table} WHERE partNumber = $1 AND date = $2 AND jude = 'day'`, [partnumber, date]);
      }

      // UPSERT rows_ data
      for (const [partnumber, totalQty] of qtySumMap.entries()) {
        const checkRes = await client.query(
          `SELECT seq FROM rows_${table} WHERE partNumber = $1 AND date = $2 AND jude = 'day'`,
          [partnumber, date]
        );

        if (checkRes.rowCount === 0) {
          await client.query(
            `INSERT INTO rows_${table} 
              (partNumber, qty, partdimension, firstpiece, machinestatus, componentstatus, date, jude)
             VALUES ($1, $2, 'OK', 'OK', 'OK', 'OK', $3, 'day')`,
            [partnumber, totalQty, date]
          );
        } else {
          await client.query(
            `UPDATE rows_${table} SET qty = $1 WHERE partNumber = $2 AND date = $3 AND jude = 'day'`,
            [totalQty, partnumber, date]
          );
        }
      }

      // UPSERT timeSlots_ data
      for (const [partnumber, timeSlotData] of Object.entries(grouped)) {
        const rowRes = await client.query(
          `SELECT seq FROM rows_${table} WHERE partNumber = $1 AND date = $2 AND jude = 'day'`,
          [partnumber, date]
        );
        if (rowRes.rowCount === 0) continue;

        const rowId = rowRes.rows[0].seq;
        for (const [timeSlot, targets] of Object.entries(timeSlotData)) {
          const checkTimeSlotRes = await client.query(
            `SELECT actual FROM timeSlots_${table} WHERE row_id = $1 AND timeSlot = $2 AND date = $3 AND jude = 'day' LIMIT 1`,
            [rowId, timeSlot, date]
          );

          if (checkTimeSlotRes.rowCount === 0) {
            const actuals = targets.map(() => null);
            await client.query(
              `INSERT INTO timeSlots_${table} (row_id, timeSlot, target, actual, date, jude)
               VALUES ($1, $2, $3, $4, $5, 'day')`,
              [rowId, timeSlot, JSON.stringify(targets), JSON.stringify(actuals), date]
            );
          } else {
            const oldActuals = checkTimeSlotRes.rows[0].actual;
            await client.query(
              `UPDATE timeSlots_${table} SET target = $1, actual = $2 WHERE row_id = $3 AND timeSlot = $4 AND date = $5 AND jude = 'day'`,
              [JSON.stringify(targets), JSON.stringify(oldActuals), rowId, timeSlot, date]
            );
          }
        }
      }

      await client.query("COMMIT");
      return NextResponse.json({ message: "Data inserted successfully" });
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Transaction error:", e);
      return NextResponse.json({ message: "Transaction failed" }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json({ message: "Request processing failed" }, { status: 500 });
  }
}
