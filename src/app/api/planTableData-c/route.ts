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
  emptyTimeSlots: string[];
};

const TIME_SLOTS_ORDER = [
  "07:35-08:30",
  "08:30-09:30",
  "09:40-10:30",
  "10:30-11:30",
  "12:30-13:30",
  "13:30-14:30",
  "14:40-15:30",
  "15:30-16:30",
  "16:50-17:50",
  "17:50-18:50",
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

// กำหนดว่าช่วงเวลานี้ควรมีค่า 5 ค่า
const TIME_SLOTS_WITH_5 = new Set([
  "09:40-10:30",
  "14:40-15:30",
  "21:40-22:30",
  "02:40-03:30",
]);

// ฟังก์ชันเติม null ให้ครบตามจำนวนที่กำหนด
function fillNulls(arr: any, timeSlot: string): (number | null)[] {
  const expectedLength = TIME_SLOTS_WITH_5.has(timeSlot) ? 5 : 6;
  if (!Array.isArray(arr) || arr.length === 0) {
    return new Array(expectedLength).fill(null);
  }
  const newArr = [...arr];
  while (newArr.length < expectedLength) {
    newArr.push(null);
  }
  return newArr;
}

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
      SELECT r.seq, r.partnumber, r.partdimension, r.firstpiece, r.machinestatus, r.componentstatus, 
             r.target, r.actual, 
             COALESCE(
               jsonb_object_agg(ts.timeSlot, jsonb_build_object('target', ts.target, 'actual', ts.actual)), '{}'
             ) AS timeslots
      FROM rows_${nametableurl} r
      JOIN timeSlots_${nametableurl} ts ON r.seq = ts.row_id
      WHERE ts.date = $1
        AND ts.timeSlot IN (${TIME_SLOTS_ORDER.map((_, i) => `$${i + 2}`).join(",")})
      GROUP BY r.seq;
    `;

    const params = [date, ...TIME_SLOTS_ORDER];
    console.time("query-time");
    const rowsResult = await pool.query(rowsQuery, params);
    console.timeEnd("query-time");

    const rows: Row[] = rowsResult.rows.map((row) => {
      const timeslots: TimeSlots = {};
      const emptyTimeSlots: string[] = [];

      TIME_SLOTS_ORDER.forEach((timeSlotKey) => {
        const slot = row.timeslots?.[timeSlotKey];

        let target: (number | null)[] = [];
        let actual: (number | null)[] = [];

        if (slot) {
          try {
            target = fillNulls(
              Array.isArray(slot.target)
                ? slot.target
                : typeof slot.target === "string"
                ? JSON.parse(slot.target)
                : [],
              timeSlotKey
            );
            actual = fillNulls(
              Array.isArray(slot.actual)
                ? slot.actual
                : typeof slot.actual === "string"
                ? JSON.parse(slot.actual)
                : [],
              timeSlotKey
            );
          } catch (e) {
            console.warn(`Invalid JSON in timeslot "${timeSlotKey}"`, e);
            target = fillNulls([], timeSlotKey);
            actual = fillNulls([], timeSlotKey);
          }
        } else {
          // กรณีไม่มี slot เลย เติม null ครบ
          target = fillNulls([], timeSlotKey);
          actual = fillNulls([], timeSlotKey);
        }

        if (target.every((v) => v === null) && actual.every((v) => v === null)) {
          emptyTimeSlots.push(timeSlotKey);
        }

        timeslots[timeSlotKey] = { target, actual };
      });

      return {
        ...row,
        timeslots,
        emptyTimeSlots,
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
