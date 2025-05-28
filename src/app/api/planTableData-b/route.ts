import { NextRequest, NextResponse } from "next/server";
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
  timeslots: TimeSlots;
};

const TIME_SLOTS_ORDER = [
  "19:35-20:30",
  "20:30-21:30",
  "21:40-22:30",
  "00:30-01:30",
  "01:30-02:30",
  "02:40-03:30",
  "03:30-04:30",
  "04:50-05:50",
  "05:50-06:50",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nametableurl = searchParams.get("nametableurl") || "core_1";
    const date = searchParams.get("date");

    if (!/^[a-zA-Z0-9_]+$/.test(nametableurl)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
    }

        const rowsQuery = `
                SELECT 
                r.seq, 
                r.partnumber, 
                r.partdimension, 
                r.firstpiece, 
                r.machinestatus, 
                r.componentstatus, 
                r.target, 
                r.actual, 
                MIN(p.id) AS pid,  -- aggregate to allow sorting
                jsonb_object_agg(
                  ts.timeSlot,
                  jsonb_build_object('target', ts.target, 'actual', ts.actual)
                  ORDER BY CASE ts.timeSlot
                  WHEN '19:35-20:30' THEN 1
                  WHEN '20:30-21:30' THEN 1
                  WHEN '21:40-22:30' THEN 2
                  WHEN '00:30-01:30' THEN 3
                  WHEN '01:30-02:30' THEN 4
                  WHEN '02:40-03:30' THEN 5
                  WHEN '03:30-04:30' THEN 6
                  WHEN '04:50-05:50' THEN 7
                  WHEN '05:50-06:50' THEN 8
                   ELSE 99
                 END
                ) AS timeslots
                FROM rows_${nametableurl} r
                JOIN plan_${nametableurl} p ON r.partnumber = p.partnumber
                JOIN timeSlots_${nametableurl} ts ON r.seq = ts.row_id
                WHERE ts.date = $1
                AND ts.timeSlot IN (
                '19:35-20:30',
                '20:30-21:30',
                '21:40-22:30',
                '00:30-01:30',
                '01:30-02:30',
                '02:40-03:30',
                '03:30-04:30',
                '04:50-05:50',
                '05:50-06:50'
                )
                GROUP BY r.seq
                ORDER BY pid ASC;
    `;
//     const rowsQuery = `
//               SELECT 
//                   ROW_NUMBER() OVER (ORDER BY pid) AS seq,
//                   sub.partnumber,
//                   sub.partdimension,
//                   sub.firstpiece,
//                   sub.machinestatus,
//                   sub.componentstatus,
//                   sub.target,
//                   sub.actual,
//                   sub.pid,
//                   sub.timeslots
//               FROM (
//                   SELECT 
//                       r.partnumber, 
//                       r.partdimension, 
//                       r.firstpiece, 
//                       r.machinestatus, 
//                       r.componentstatus, 
//                       r.target, 
//                       r.actual, 
//                       MIN(p.id) AS pid,
//                       jsonb_object_agg(
//                           ts.timeSlot,
//                           jsonb_build_object('target', ts.target, 'actual', ts.actual)
//                           ORDER BY CASE ts.timeSlot
//                             WHEN '19:35-20:30' THEN 1
//                             WHEN '20:30-21:30' THEN 1
//                             WHEN '21:40-22:30' THEN 2
//                             WHEN '00:30-01:30' THEN 3
//                             WHEN '01:30-02:30' THEN 4
//                             WHEN '02:40-03:30' THEN 5
//                             WHEN '03:30-04:30' THEN 6
//                             WHEN '04:50-05:50' THEN 7
//                             WHEN '05:50-06:50' THEN 8
//                               ELSE 99
//                           END
//                       ) AS timeslots
//                   FROM rows_${nametableurl} r
//                   JOIN plan_${nametableurl} p ON r.partnumber = p.partnumber
//                   JOIN timeSlots_${nametableurl} ts ON r.seq = ts.row_id
//                   WHERE ts.date = $1
//                   AND ts.timeSlot IN (
//                           '19:35-20:30',
//                           '20:30-21:30',
//                           '21:40-22:30',
//                           '00:30-01:30',
//                           '01:30-02:30',
//                           '02:40-03:30',
//                           '03:30-04:30',
//                           '04:50-05:50',
//                           '05:50-06:50'
//                   )
//                   GROUP BY r.seq, r.partnumber, r.partdimension, r.firstpiece, r.machinestatus, r.componentstatus, r.target, r.actual
//               ) AS sub
//               ORDER BY seq ASC;
// `;
    const rowsResult = await pool.query(rowsQuery, [date]);

    const rows: Row[] = rowsResult.rows.map((row) => {
      const timeslots: TimeSlots = {};

      TIME_SLOTS_ORDER.forEach((timeSlotKey) => {
        const slot = row.timeslots ? row.timeslots[timeSlotKey] : undefined;

        let target: (number | null)[] = [];
        let actual: (number | null)[] = [];

        if (slot) {
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
        }

        timeslots[timeSlotKey] = { target, actual };
      });

      return {
        ...row,
        timeslots,
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
