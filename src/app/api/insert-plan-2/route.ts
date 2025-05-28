// import { NextRequest, NextResponse } from "next/server";
// import pool from "@/lib/db";
// import { distributeByPartnumbers } from "@/lib/distribute3";

// export async function POST(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const date = searchParams.get("date");
//     if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
//     }

//     const inputs = await req.json();

//     const table = req.nextUrl.searchParams.get("table") || "null";
//     if (!table) {
//       return NextResponse.json(
//         { error: "Table name is required" },
//         { status: 400 }
//       );
//     }

//     const qtySumMap = new Map<string, number>();
//     for (const input of inputs) {
//       qtySumMap.set(
//         input.partnumber,
//         (qtySumMap.get(input.partnumber) ?? 0) + input.qty
//       );
//     }

//     const grouped = distributeByPartnumbers(inputs);
//     const client = await pool.connect();
//     try {
//       await client.query("BEGIN");

//       for (const input of inputs) {
//         const {
//           sequence,
//           partnumber,
//           model,
//           qty,
//           cttarget,
//           starttime,
//           endtime,
//         } = input;

//         const planDate = new Date().toISOString().slice(0, 10);

//         const res = await client.query(
//           `SELECT id FROM plan_${table} WHERE sequence = $1 AND partnumber = $2 AND planDate = $3`,
//           [sequence, partnumber, date]
//         );

//         let planId;
//         if (res.rowCount === 0) {
//           const insertRes = await client.query(
//             `INSERT INTO plan_${table} 
//               (sequence, partnumber, model, qty, cttarget, starttime, endtime, planDate)
//              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//              RETURNING id`,
//             [
//               sequence,
//               partnumber,
//               model,
//               qty,
//               cttarget,
//               starttime,
//               endtime,
//               date,
//             ]
//           );
//           planId = insertRes.rows[0].id;
//         } else {
//           planId = res.rows[0].id;
//           await client.query(
//             `UPDATE plan_${table} SET
//               model = $1,
//               qty = $2,
//               cttarget = $3,
//               starttime = $4,
//               endtime = $5,
//               updatedAt = CURRENT_TIMESTAMP
//              WHERE id = $6`,
//             [model, qty, cttarget, starttime, endtime, planId]
//           );
//         }
//       }

//       for (const [partnumber, totalQty] of qtySumMap.entries()) {
//         const rowRes = await client.query(
//           `SELECT seq FROM rows_${table} WHERE partNumber = $1`,
//           [partnumber]
//         );
//         if (rowRes.rowCount === 0) {
//           await client.query(
//             `INSERT INTO rows_${table} (partNumber, qty, partdimension, firstpiece, machinestatus, componentstatus, date)
//              VALUES ($1, $2, 'OK', 'OK', 'OK', 'OK', $3)`,
//             [partnumber, totalQty, date]
//           );
//         } else {
//           const rowId = rowRes.rows[0].seq;
//           await client.query(
//             `UPDATE rows_${table} SET qty = $1 WHERE seq = $2`,
//             [totalQty, rowId]
//           );
//         }
//       }

//       for (const [partnumber, timeSlotData] of Object.entries(grouped)) {
//         const rowRes = await client.query(
//           `SELECT seq FROM rows_${table} WHERE partNumber = $1`,
//           [partnumber]
//         );
//         if (rowRes.rowCount === 0) {
//           continue;
//         }
//         const rowId = rowRes.rows[0].seq;

//         for (const [timeSlot, targets] of Object.entries(timeSlotData)) {
//           const actuals = targets.map(() => null);

//           await client.query(
//             `INSERT INTO timeSlots_${table} (row_id, timeSlot, target, actual, date)
//              VALUES ($1, $2, $3, $4, $5)
//              ON CONFLICT (row_id, timeSlot) DO UPDATE
//              SET target = EXCLUDED.target, actual = EXCLUDED.actual`,
//             [rowId, timeSlot, JSON.stringify(targets), JSON.stringify(actuals), date]
//           );
//         }
//       }

//       await client.query("COMMIT");
//       return NextResponse.json({ message: "Data saved successfully" });
//     } catch (e) {
//       await client.query("ROLLBACK");
//       console.error("Error during transaction", e);
//       return NextResponse.json(
//         { message: "Database transaction failed" },
//         { status: 500 }
//       );
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     console.error("Error in POST request", error);
//     return NextResponse.json(
//       { message: "Error processing request" },
//       { status: 500 }
//     );
//   }
// }
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

        await client.query(
          `INSERT INTO plan_${table} 
            (sequence, partnumber, model, qty, cttarget, starttime, endtime, planDate, jude)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'day')
           ON CONFLICT (sequence, partnumber, jude, planDate) DO UPDATE SET
             model = EXCLUDED.model,
             qty = EXCLUDED.qty,
             cttarget = EXCLUDED.cttarget,
             starttime = EXCLUDED.starttime,
             endtime = EXCLUDED.endtime`,
          [sequence, partnumber, model, qty, cttarget, starttime, endtime, date]
        );
      }

      for (const [partnumber, totalQty] of qtySumMap.entries()) {
        const checkRes = await client.query(
          `SELECT seq FROM rows_${table} WHERE partNumber = $1 AND date = $2 AND jude = 'day'`,
          [partnumber, date]
        );

        if (checkRes.rowCount === 0) {
          // Insert ใหม่
          await client.query(
            `INSERT INTO rows_${table} 
              (partNumber, qty, partdimension, firstpiece, machinestatus, componentstatus, date, jude)
             VALUES ($1, $2, 'OK', 'OK', 'OK', 'OK', $3, 'day')`,
            [partnumber, totalQty, date]
          );
        } else {
          // Update ที่มีอยู่
          await client.query(
            `UPDATE rows_${table} SET qty = $1 WHERE partNumber = $2 AND date = $3 AND jude = 'day'`,
            [totalQty, partnumber, date]
          );
        }
      }

      for (const [partnumber, timeSlotData] of Object.entries(grouped)) {
        const rowRes = await client.query(
          `SELECT seq FROM rows_${table} WHERE partNumber = $1 AND date = $2 AND jude = 'day'`,
          [partnumber, date]
        );
        if (rowRes.rowCount === 0) continue;

        const rowId = rowRes.rows[0].seq;
        for (const [timeSlot, targets] of Object.entries(timeSlotData)) {
          // ก่อนอื่น fetch actual เก่าจาก DB
          const checkTimeSlotRes = await client.query(
            `SELECT actual FROM timeSlots_${table} WHERE row_id = $1 AND timeSlot = $2 AND date = $3 AND jude = 'day' LIMIT 1`,
            [rowId, timeSlot, date]
          );

          if (checkTimeSlotRes.rowCount === 0) {
            // ถ้ายังไม่มี record ให้ insert ใหม่ โดย actual เริ่มเป็น null array
            const actuals = targets.map(() => null);

            await client.query(
              `INSERT INTO timeSlots_${table} (row_id, timeSlot, target, actual, date, jude)
               VALUES ($1, $2, $3, $4, $5, 'day')`,
              [rowId, timeSlot, JSON.stringify(targets), JSON.stringify(actuals), date]
            );
          } else {
            // ถ้ามี record อยู่แล้ว ดึง actual เดิมมาเก็บไว้
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