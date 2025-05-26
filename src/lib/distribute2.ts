// ✅ กำหนดช่วงเวลา Time Slots
export const TIME_SLOTS: string[] = [
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

// ✅ แปลง "HH:mm" เป็นนาทีในวัน
function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) throw new Error(`Invalid time: ${timeStr}`);
  return h * 60 + m;
}

// ✅ แปลงนาทีในวันกลับเป็น "HH:mm"
function toTimeStr(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// ✅ แบ่ง Time Slot ใหญ่เป็นช่วงย่อย ๆ ตาม interval (เช่น 10 นาที)
function splitTimeSlot(slot: string, interval = 10): string[] {
  let [start, end] = slot.split("-").map(toMinutes);
  if (end <= start) end += 1440; // ข้ามวัน

  const result: string[] = [];
  while (start < end) {
    const next = Math.min(start + interval, end);
    result.push(`${toTimeStr(start)}-${toTimeStr(next)}`);
    start = next;
  }
  return result;
}

// ✅ หานาทีที่ซ้อนทับระหว่างช่วงย่อยกับช่วงหลัก
function getOverlapMinutes(
  slotStart: number,
  slotEnd: number,
  rangeStart: number,
  rangeEnd: number
): number {
  if (slotEnd < slotStart) slotEnd += 1440;
  if (rangeEnd < rangeStart) rangeEnd += 1440;

  const overlapStart = Math.max(slotStart, rangeStart);
  const overlapEnd = Math.min(slotEnd, rangeEnd);
  return Math.max(0, overlapEnd - overlapStart);
}

// ✅ กระจาย qty ตาม CT และ Time Slots ย่อย
function distributeQtyByQtyAndCT(
  timeSlots: readonly string[],
  starttime: string,
  endtime: string,
  qty: number,
  cttarget: number
): (number | null)[][] {
  const rangeStart = toMinutes(starttime);
  let rangeEnd = toMinutes(endtime);
  if (rangeEnd <= rangeStart) rangeEnd += 1440;

  const totalSecs = (rangeEnd - rangeStart) * 60;
  const result: (number | null)[][] = [];

  if (totalSecs <= 0 || qty <= 0 || cttarget <= 0) {
    return timeSlots.map(slot => splitTimeSlot(slot).map(() => null));
  }

  const maxQty = Math.min(qty, Math.floor(totalSecs / cttarget));
  let produced = 0;

  for (const slot of timeSlots) {
    const subSlots = splitTimeSlot(slot);
    const slotData: (number | null)[] = [];

    for (const sub of subSlots) {
      let [s, e] = sub.split("-").map(toMinutes);
      if (e <= s) e += 1440;

      const overlap = getOverlapMinutes(s, e, rangeStart, rangeEnd);
      const seconds = overlap * 60;

      if (seconds > 0 && produced < maxQty) {
        let pieces = Math.floor(seconds / cttarget);
        if (produced + pieces > maxQty) {
          pieces = maxQty - produced;
        }
        produced += pieces;
        slotData.push(pieces > 0 ? pieces : null);
      } else {
        slotData.push(null);
      }
    }

    result.push(slotData);
  }

  return result;
}

// ✅ โครงสร้างข้อมูลสำหรับ input และผลลัพธ์รวม
type Input = {
  partnumber: string;
  qty: number;
  cttarget: number;
  starttime: string;
  endtime: string;
};

type GroupedDistribution = {
  [partnumber: string]: {
    [timeSlot: string]: (number | null)[];
  };
};

// ✅ รวม input ที่มีพารามิเตอร์เหมือนกัน (ยกเว้น qty)
export function mergeInputsByPartnumber(inputs: Input[]): Input[] {
  const merged = new Map<string, Input>();

  for (const input of inputs) {
    const key = `${input.partnumber}-${input.starttime}-${input.endtime}-${input.cttarget}`;
    if (!merged.has(key)) {
      merged.set(key, { ...input });
    } else {
      merged.get(key)!.qty += input.qty;
    }
  }

  return [...merged.values()];
}

// ✅ แปลง input เป็นโครงสร้างข้อมูลกระจายตาม TIME_SLOTS
export function distributeByPartnumbers(inputs: Input[]): GroupedDistribution {
  const grouped: GroupedDistribution = {};

  for (const input of inputs) {
    const { partnumber, qty, cttarget, starttime, endtime } = input;

    const distributed = distributeQtyByQtyAndCT(
      TIME_SLOTS,
      starttime,
      endtime,
      qty,
      cttarget
    );

    if (!grouped[partnumber]) {
      grouped[partnumber] = {};
      for (const slot of TIME_SLOTS) {
        grouped[partnumber][slot] = new Array(splitTimeSlot(slot).length).fill(null);
      }
    }

    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const slot = TIME_SLOTS[i];
      for (let j = 0; j < distributed[i].length; j++) {
        const val = distributed[i][j];
        if (val !== null) {
          grouped[partnumber][slot][j] = (grouped[partnumber][slot][j] ?? 0) + val;
        }
      }
    }
  }

  // ⭕ ปัดเศษค่าที่กระจายแล้ว
  for (const partnumber in grouped) {
    for (const slot in grouped[partnumber]) {
      grouped[partnumber][slot] = grouped[partnumber][slot].map(v =>
        v === null ? null : Math.round(v)
      );
    }
  }

  return grouped;
}
