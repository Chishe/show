import { NextResponse } from "next/server";
import pool from "@/lib/db";

type TimeSlots = {
  [key: string]: {
    target: (number | null)[];
    actual: (number | null)[];
  };
};

type Row = {
  seq: number;
  partnumber: string;
  partdimension: string;
  firstpiece: string;
  machinestatus: string;
  componentstatus: string;
  target: number;
  actual: number;
  qty: number;
  timeslots: TimeSlots;
};

export async function GET() {
  try {
    const rowsQuery = `
      SELECT r.seq, r.partnumber, r.partdimension, r.firstpiece, r.machinestatus, r.componentstatus, 
             r.target, r.actual, r.qty, 
             jsonb_object_agg(ts.timeSlot, jsonb_build_object('target', ts.target, 'actual', ts.actual)) AS timeslots
      FROM rows r
      JOIN timeSlots ts ON r.seq = ts.row_id
      GROUP BY r.seq;
    `;

    const rowsResult = await pool.query(rowsQuery);

    const rows: Row[] = rowsResult.rows.map((row) => {
      const timeslots: TimeSlots = {};

      if (row.timeslots) {
        Object.keys(row.timeslots).forEach((timeSlotKey) => {
          const slot = row.timeslots[timeSlotKey];
          let target: (number | null)[] = [];
          let actual: (number | null)[] = [];

          if (Array.isArray(slot.target)) {
            target = slot.target;
          } else {
            try {
              target = slot.target ? JSON.parse(slot.target) : [];
            } catch (e) {
              console.error("Error parsing target JSON:", e);
            }
          }

          if (Array.isArray(slot.actual)) {
            actual = slot.actual;
          } else {
            try {
              actual = slot.actual ? JSON.parse(slot.actual) : [];
            } catch (e) {
              console.error("Error parsing actual JSON:", e);
            }
          }

          timeslots[timeSlotKey] = {
            target,
            actual,
          };
        });
      }

      return {
        ...row,
        timeslots,
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
