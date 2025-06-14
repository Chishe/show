export const TIME_SLOTS: string[] = [
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
];

function toMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) {
    throw new Error(`Invalid time string: ${timeStr}`);
  }
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function toTimeStr(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function splitTimeSlot(slot: string, interval = 10, reverse = false): string[] {
  const [start, end] = slot.split("-");
  let startMin = toMinutes(start);
  const endMin = toMinutes(end);

  const result: string[] = [];
  while (startMin < endMin) {
    const nextMin = Math.min(startMin + interval, endMin);
    result.push(`${toTimeStr(startMin)}-${toTimeStr(nextMin)}`);
    startMin = nextMin;
  }
  return reverse ? result.reverse() : result;
}

function getOverlapMinutes(
  slotStart: number,
  slotEnd: number,
  rangeStart: number,
  rangeEnd: number
): number {
  const start = Math.max(slotStart, rangeStart);
  const end = Math.min(slotEnd, rangeEnd);
  return Math.max(0, end - start);
}

function distributeQtyByQtyAndCT(
  timeSlots: readonly string[],
  starttime: string,
  endtime: string,
  qty: number,
  cttarget: number
): (number | null)[][] {
  const rangeStart = toMinutes(starttime);
  const rangeEnd = toMinutes(endtime);
  const totalRangeSeconds = (rangeEnd - rangeStart) * 60;

  const result: (number | null)[][] = [];
  let producedSoFar = 0;
  const maxQty = Math.min(qty, Math.floor(totalRangeSeconds / cttarget));

  for (const slot of timeSlots) {
    const reverse = slot === "07:35-08:30";
    const subSlots = splitTimeSlot(slot, 10, reverse);
    const subSlotQty: (number | null)[] = new Array(subSlots.length).fill(null);

    const loopIndexes = reverse
      ? [...Array(subSlots.length).keys()].reverse()
      : [...Array(subSlots.length).keys()];

    for (const j of loopIndexes) {
      const subSlotStr = subSlots[j];
      const [subStartStr, subEndStr] = subSlotStr.split("-");
      const subStart = toMinutes(subStartStr);
      const subEnd = toMinutes(subEndStr);

      const overlapMinutes = getOverlapMinutes(
        subStart,
        subEnd,
        rangeStart,
        rangeEnd
      );
      const overlapSeconds = overlapMinutes * 60;

      if (overlapSeconds > 0) {
        if (producedSoFar < maxQty) {
          let pieces = Math.ceil(overlapSeconds / cttarget);
          if (producedSoFar + pieces > maxQty) {
            pieces = maxQty - producedSoFar;
          }
          producedSoFar += pieces;
          subSlotQty[j] = pieces > 0 ? pieces : 0;
        } else {
          // still in time range but already produced maxQty
          subSlotQty[j] = 0;
        }
      }
    }

    result.push(subSlotQty);
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

  for (const partnumber in grouped) {
    for (const slot of TIME_SLOTS) {
      grouped[partnumber][slot] = grouped[partnumber][slot].map((v) =>
        v === null ? null : Math.round(v)
      );
    }
  }

  return grouped;
}

