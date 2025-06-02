// กำหนดช่วงเวลาของแต่ละ time slot สำหรับกะกลางคืน (Night shift)
export const TIME_SLOTS: string[] = [
  '19:35-20:30',
  '20:30-21:30',
  '21:40-22:30',
  '22:30-23:30',
  '23:30-00:30', 
  '00:30-01:30',
  '01:30-02:30',
  '02:40-03:30',
  '03:30-04:30',
  '04:50-05:50',
  '05:50-06:50'
];

// แปลงเวลาจากรูปแบบ "HH:MM" เป็นนาที
function toMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) {
    throw new Error(`Invalid time string: ${timeStr}`);
  }
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// แปลงจากนาทีเป็นเวลา "HH:MM"
function toTimeStr(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// แบ่งช่วงเวลา (เช่น 19:35-20:30) ออกเป็นช่วงย่อยๆ (เช่นทุก 10 นาที)
function splitTimeSlot(slot: string, interval = 10, baseStartMin = 0): string[] {
  const [start, end] = slot.split("-");
  let startMin = toMinutes(start);
  let endMin = toMinutes(end);

  if (startMin < baseStartMin) startMin += 24 * 60;
  if (endMin <= startMin) endMin += 24 * 60;

  const result: string[] = [];
  let currentStart = startMin;

  while (currentStart < endMin) {
    const nextMin = Math.min(currentStart + interval, endMin);
    result.push(`${toTimeStr(currentStart % (24 * 60))}-${toTimeStr(nextMin % (24 * 60))}`);
    currentStart = nextMin;
  }
  return result;
}

// คำนวณนาทีที่ช่วงเวลาย่อย overlap กับช่วงเวลาของแผน
function getOverlapMinutes(
  slotStart: number,
  slotEnd: number,
  rangeStart: number,
  rangeEnd: number
): number {
  if (slotEnd <= slotStart) slotEnd += 24 * 60;
  if (rangeEnd <= rangeStart) rangeEnd += 24 * 60;
  
  const start = Math.max(slotStart, rangeStart);
  const end = Math.min(slotEnd, rangeEnd);
  return Math.max(0, end - start);
}

// แปลง starttime และ endtime ให้อยู่ในรูปแบบตัวเลข (นาที) และรองรับข้ามวัน
function normalizeTimeRange(starttime: string, endtime: string): [number, number] {
  const startMin = toMinutes(starttime);
  let endMin = toMinutes(endtime);

  if (endMin <= startMin) {
    endMin += 24 * 60;
  }
  return [startMin, endMin];
}

// กระจายจำนวนผลิตภัณฑ์ (qty) ตาม CT ที่ระบุลงในช่วงเวลา 10 นาที
function distributeQtyByQtyAndCT(
  timeSlots: readonly string[],
  starttime: string,
  endtime: string,
  qty: number,
  cttarget: number
): (number | null)[][] {
  const [rangeStart, rangeEnd] = normalizeTimeRange(starttime, endtime);
  const totalRangeSeconds = (rangeEnd - rangeStart) * 60;

  if (totalRangeSeconds <= 0 || qty <= 0 || cttarget <= 0) {
    return timeSlots.map((slot) => {
      const subSlots = splitTimeSlot(slot, 10, rangeStart);
      return subSlots.map(() => null);
    });
  }

  const subSlotTimes: { slotIndex: number; subIndex: number; overlapSeconds: number }[] = [];

  // คำนวณ overlap ของแต่ละ sub-slot
  timeSlots.forEach((slot, slotIndex) => {
    const subSlots = splitTimeSlot(slot, 10, rangeStart);
    subSlots.forEach((subSlotStr, subIndex) => {
      const [subStartStr, subEndStr] = subSlotStr.split("-");
      let subStart = toMinutes(subStartStr);
      let subEnd = toMinutes(subEndStr);

      if (subStart < rangeStart) subStart += 24 * 60;
      if (subEnd < rangeStart) subEnd += 24 * 60;
      if (subEnd <= subStart) subEnd += 24 * 60;
      
      const overlapMinutes = getOverlapMinutes(subStart, subEnd, rangeStart, rangeEnd);
      const overlapSeconds = overlapMinutes * 60;
      if (overlapSeconds > 0) {
        subSlotTimes.push({ slotIndex, subIndex, overlapSeconds });
      }
    });
  });

  // คำนวณจำนวนสูงสุดที่สามารถผลิตได้ในช่วงเวลานี้
  const maxQty = Math.min(qty, Math.floor(totalRangeSeconds / cttarget));
  const totalOverlapSeconds = subSlotTimes.reduce((acc, cur) => acc + cur.overlapSeconds, 0);

  // กระจายตามสัดส่วนเวลา
  const rawAllocations = subSlotTimes.map(({ overlapSeconds }) =>
    overlapSeconds * maxQty / totalOverlapSeconds
  );

  const flooredAllocations = rawAllocations.map(Math.floor);
  let allocatedQty = flooredAllocations.reduce((a, b) => a + b, 0);
  const remainders = rawAllocations.map((val, idx) => ({ idx, remainder: val - flooredAllocations[idx] }));

  // แจกจ่ายเศษให้ครบ maxQty
  remainders.sort((a, b) => b.remainder - a.remainder);
  let i = 0;
  while (allocatedQty < maxQty && i < remainders.length) {
    flooredAllocations[remainders[i].idx]++;
    allocatedQty++;
    i++;
  }

  // สร้างโครงสร้างผลลัพธ์แบบ 2 มิติ
  const result: (number | null)[][] = timeSlots.map((slot) => {
    const subSlots = splitTimeSlot(slot, 10, rangeStart);
    return subSlots.map(() => null);
  });

  // ใส่ค่าที่จัดสรรแล้วลงในช่องที่ตรงกัน
  for (let i = 0; i < subSlotTimes.length; i++) {
    const { slotIndex, subIndex } = subSlotTimes[i];
    result[slotIndex][subIndex] = flooredAllocations[i];
  }

  return result;
}

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

// รวม input ที่เป็น partnumber, start-end time, และ CT เดียวกัน
export function mergeInputsByPartnumber(inputs: Input[]): Input[] {
  const map = new Map<string, Input>();

  for (const input of inputs) {
    const key = `${input.partnumber}-${input.starttime}-${input.endtime}-${input.cttarget}`;
    if (!map.has(key)) {
      map.set(key, { ...input });
    } else {
      const existing = map.get(key)!;
      existing.qty += input.qty;
    }
  }

  return Array.from(map.values());
}

// กระจายข้อมูล input ทั้งหมดเป็นราย partnumber และ time slot
export function distributeByPartnumbers(inputs: Input[]): GroupedDistribution {
  console.log("distributeByPartnumbers inputs:", inputs);
  const grouped: GroupedDistribution = {};

  for (const input of inputs) {
    console.log("Processing input:", input);
    const { partnumber, qty, cttarget, starttime, endtime } = input;

    const distribution = distributeQtyByQtyAndCT(
      TIME_SLOTS,
      starttime,
      endtime,
      qty,
      cttarget
    );

    if (!grouped[partnumber]) {
      grouped[partnumber] = {};
      for (const slot of TIME_SLOTS) {
        const subSlotCount = splitTimeSlot(slot).length;
        grouped[partnumber][slot] = new Array(subSlotCount).fill(null);
      }
    }

    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const slot = TIME_SLOTS[i];
      for (let j = 0; j < distribution[i].length; j++) {
        const val = distribution[i][j];
        if (val !== null) {
          const current = grouped[partnumber][slot][j];
          grouped[partnumber][slot][j] = (current ?? 0) + val;
        }
      }
    }
  }

  // ปัดค่าทั้งหมดให้เป็นจำนวนเต็ม
  for (const partnumber in grouped) {
    for (const slot of TIME_SLOTS) {
      grouped[partnumber][slot] = grouped[partnumber][slot].map((v) =>
        v === null ? null : Math.round(v)
      );
    }
  }

  return grouped;
}
