import { useState, useEffect, useCallback } from "react";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const columns = [
  {
    key: "partNumber",
    label: "Part Number",
    type: "select",
    options: [
      "TG447687-0430",
      "TG447686-1830",
      "TG447682-5330",
      "TG447682-5080",
      "TG447683-6100",
      "TG447683-5940",
      "TG447681-1380",
      "TG447681-2930",
      "TG447681-1500",
      "TG447681-1620",
      "TG447670-0090"],
  },
  { key: "model", label: "Model" },
  { key: "qty", label: "QTY. (PCS)", type: "number" },
  { key: "ctTarget", label: "CT Target" },
  { key: "startTime", label: "Start Time", type: "time" },
  { key: "endTime", label: "End Time", type: "time" },
];

type Row = {
  id: number;
  partNumber: string;
  model: string;
  qty: string;
  ctTarget: string;
  startTime: string;
  endTime: string;
  stockPart: string;
  sequence: number;
  remark?: string;
};

export const TIME_SLOTS = [
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
  "07:35-20:30",
  "20:30-21:30",
  "21:40-22:30",
  "22:30-23:30",
  "23:30-00:30",
  "00:30-01:30",
  "01:30-02:30",
  "02:40-03:30",
  "03:30-04:30",
  "04:50-05:50",
  "05:50-06:50"
];

// function parseTime(timeStr: string): Date {
//   const [h, m] = timeStr.split(":").map(Number);
//   const d = new Date();
//   d.setHours(h, m, 0, 0);
//   return d;
// }

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// function timeToMinutes(t: string): number {
//   const [h, m] = t.split(":").map(Number);
//   return h * 60 + m;
// }

// function roundUpToNext10MinInSlot(timeStr: string, slotEndStr: string): string {
//   const [h, m] = timeStr.split(":").map(Number);
//   const totalMin = h * 60 + m;
//   const roundedMin = Math.ceil(totalMin / 10) * 10;
//   const roundedH = Math.floor(roundedMin / 60);
//   const roundedM = roundedMin % 60;
//   const roundedStr = `${String(roundedH).padStart(2, "0")}:${String(roundedM).padStart(2, "0")}`;

//   return timeToMinutes(roundedStr) > timeToMinutes(slotEndStr)
//     ? slotEndStr
//     : roundedStr;
// }
function parseTimeWithDay(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);

  // ถ้าเวลาน้อยกว่า 7:00 (เช้า) ให้ขยับเป็นวันถัดไป
  if (h < 7) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

export const calculateEndTime = (
  startTime: string,
  qty: string,
  ctTarget: string
): string => {
  if (!startTime || !qty || !ctTarget) return "";

  const qtyNum = parseInt(qty);
  const ctNum = parseFloat(ctTarget);

  if (isNaN(qtyNum) || isNaN(ctNum)) return "";

  const requiredSeconds = qtyNum * ctNum;
  const startDate = parseTimeWithDay(startTime);

  let remainingSeconds = requiredSeconds;
  let currentEndTime: Date | null = null;

  for (const slot of TIME_SLOTS) {
    const [slotStartStr, slotEndStr] = slot.split("-");
    const slotStart = parseTimeWithDay(slotStartStr);
    const slotEnd = parseTimeWithDay(slotEndStr);

    if (slotEnd <= startDate) continue;

    const effectiveStart = slotStart < startDate ? startDate : slotStart;
    const availableSeconds = (slotEnd.getTime() - effectiveStart.getTime()) / 1000;

    if (availableSeconds <= 0) continue;

    if (remainingSeconds > availableSeconds) {
      remainingSeconds -= availableSeconds;
    } else {
      currentEndTime = new Date(effectiveStart.getTime() + remainingSeconds * 1000);
      const rawEnd = formatTime(currentEndTime);

      // กรณีเวลาผ่านเที่ยงคืน อาจต้องแสดงวันถัดไป หรือคำนวณเวลานาทีแบบรวม
      // สำหรับการเปรียบเทียบ ให้ใช้ timeToMinutes แต่ถ้าเวลาน้อยกว่า 7:00 ให้ + 24*60 เพื่อเป็นวันถัดไป
      function timeToMinutesWithDay(t: string): number {
        const [h, m] = t.split(":").map(Number);
        return h < 7 ? h * 60 + m + 24 * 60 : h * 60 + m;
      }

      // const slotEndMin = timeToMinutesWithDay(slotEndStr);
      const rawEndMin = timeToMinutesWithDay(rawEnd);

      // ปรับ rawEnd ให้อยู่ใน slot (เช่น round up 10 นาที)
      const roundedMin = Math.ceil(rawEndMin / 10) * 10;

      if (roundedMin > timeToMinutesWithDay("06:50")) {
        return "06:50";
      }

      const roundedH = Math.floor(roundedMin / 60) % 24;
      const roundedM = roundedMin % 60;
      const roundedStr = `${String(roundedH).padStart(2, "0")}:${String(roundedM).padStart(2, "0")}`;

      return roundedStr;
    }
  }

  return "06:50";
};

type ModalProps = {
  nametableurl: string;
  dateTime: string;
};

export default function Modal({ nametableurl, dateTime }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      partNumber: "",
      model: "",
      qty: "",
      ctTarget: "",
      startTime: "07:35",
      endTime: "",
      stockPart: "",
      sequence: 1,
      remark: "",
    },
  ]);

  const loadPlanData = useCallback(async () => {
    const res = await fetch(
      `/api/plan-b?nametableurl=${encodeURIComponent(
        nametableurl
      )}&date=${encodeURIComponent(dateTime)}`
    );
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data;
  }, [nametableurl, dateTime]);
  
  function updateAllRows(rows: Row[]): Row[] {
    if (rows.length === 0) return rows;

    const updatedRows = [...rows];

    if (updatedRows[0].startTime && updatedRows[0].qty && updatedRows[0].ctTarget) {
      updatedRows[0].endTime = calculateEndTime(
        updatedRows[0].startTime,
        updatedRows[0].qty,
        updatedRows[0].ctTarget
      );
    } else {
      updatedRows[0].endTime = "";
    }

    for (let i = 1; i < updatedRows.length; i++) {
      const prevRow = updatedRows[i - 1];
      const row = { ...updatedRows[i] };

      row.startTime = prevRow.endTime || "";

      if (row.startTime && row.qty && row.ctTarget) {
        row.endTime = calculateEndTime(row.startTime, row.qty, row.ctTarget);
      } else {
        row.endTime = "";
      }

      updatedRows[i] = row;
    }
    return updatedRows;
  }

  useEffect(() => {
    if (isOpen) {
      loadPlanData()
        .then((data) => {
          const updatedRows = updateAllRows(data);
          setRows(updatedRows);
        })
        .catch(console.error);
    }
  }, [isOpen, loadPlanData]);

  const handleSubmit = async () => {
    const hasInvalidRow = rows.some((row) => {
      return (
        !row.partNumber?.trim() ||
        !row.model?.trim() ||
        !row.qty ||
        !row.ctTarget ||
        !row.startTime ||
        !row.endTime
      );
    });

    if (hasInvalidRow) {
      alert("กรุณากรอกข้อมูลให้ครบทุกแถวก่อน Submit");
      return;
    }

    const payload = rows.map((row, index) => ({
      partnumber: row.partNumber,
      model: row.model,
      qty: parseInt(row.qty, 10),
      cttarget: parseInt(row.ctTarget, 10),
      starttime: row.startTime,
      endtime: row.endTime,
      sequence: index + 1,
    }));

    try {
      const res = await fetch(
        `/api/insert-plan-2?table=${nametableurl}&date=${encodeURIComponent(dateTime)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Submit failed");

      const updated = await loadPlanData();
      setRows(updated);
      setIsOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Error: " + err.message);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };


  const updateRow = (id: number, key: keyof Row, value: string) =>
    setRows((rows) => {
      const updatedRows = [...rows];
      const index = updatedRows.findIndex((r) => r.id === id);

      if (index === -1) return rows;

      const row = { ...updatedRows[index], [key]: value };

      if (
        ["startTime", "qty", "ctTarget"].includes(key) &&
        row.startTime &&
        row.qty &&
        row.ctTarget
      ) {
        const calculatedEnd = calculateEndTime(
          row.startTime,
          row.qty,
          row.ctTarget
        );

        if (calculatedEnd === "06:50") {
          const [startH, startM] = row.startTime.split(":").map(Number);
          const startDate = new Date();
          startDate.setHours(startH, startM, 0, 0);

          const limitDate = new Date();
          limitDate.setHours(18, 50, 0, 0);

          const availableSeconds =
            (limitDate.getTime() - startDate.getTime()) / 1000;

          const ct = parseInt(row.ctTarget);
          const maxQty = Math.floor(availableSeconds / ct);

          row.qty = maxQty.toString();
          row.endTime = "06:50";
        } else {
          row.endTime = calculatedEnd;
        }
        if (index + 1 < updatedRows.length) {
          const nextRow = { ...updatedRows[index + 1] };
          nextRow.startTime = row.endTime;

          if (
            nextRow.qty &&
            nextRow.ctTarget &&
            nextRow.startTime
          ) {
            nextRow.endTime = calculateEndTime(
              nextRow.startTime,
              nextRow.qty,
              nextRow.ctTarget
            );
          } else {
            nextRow.endTime = "";
          }

          updatedRows[index + 1] = nextRow;
        }
      }

      updatedRows[index] = row;
      return recalculateRowsFromIndex(updatedRows, index + 1);
    });

  const addRow = () =>
    setRows((rows) => {
      if (rows.length === 0) {
        return [
          {
            id: Date.now(),
            partNumber: "",
            model: "",
            qty: "",
            ctTarget: "",
            startTime: "07:35",
            endTime: "",
            stockPart: "",
            sequence: 1,
          },
        ];
      }

      const prevRow = rows[rows.length - 1];
      const newStartTime = prevRow.endTime || "07:35";
      
      const [newStartHour, newStartMin] = newStartTime.split(":").map(Number);
      
      // สร้างวันที่ใหม่สำหรับ newStartDate
      const now = new Date();
      const newStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), newStartHour, newStartMin, 0, 0);
      
      // สร้าง endLimit เป็น 06:50 ของวันถัดไป
      const endLimit = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 50, 0, 0);
      
      if (newStartDate >= endLimit) {
        alert("Cannot add more rows. End time limit reached (06:50 next day).");
        return rows;
      }
      

      return [
        ...rows,
        {
          id: Date.now(),
          partNumber: "",
          model: "",
          qty: "",
          ctTarget: "",
          startTime: newStartTime,
          endTime: "",
          stockPart: "",
          sequence: rows.length + 1,
        },
      ];
    });

  const recalculateRowsFromIndex = (updated: Row[], startIdx: number) => {
    for (let i = startIdx; i < updated.length; i++) {
      const prevRow = i === 0 ? null : updated[i - 1];
      const current = { ...updated[i] };

      if (prevRow) current.startTime = prevRow.endTime;
      if (current.startTime && current.qty && current.ctTarget) {
        current.endTime = calculateEndTime(current.startTime, current.qty, current.ctTarget);
      } else {
        current.endTime = "";
      }

      updated[i] = current;
    }
    return updated;
  };
  const deleteRow = async (id: number) => {
    try {
      const res = await fetch(`/api/plan/${id}?table=${nametableurl}&date=${encodeURIComponent(dateTime)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error("Delete failed: " + data.message);
        return;
      }

      setRows((prevRows) => {
        const indexToDelete = prevRows.findIndex((row) => row.id === id);
        const updatedRows = prevRows.filter((r) => r.id !== id);
        toast.success("Deleted successfully");
        return recalculateRowsFromIndex(updatedRows, indexToDelete);
      });
    } catch (error) {
      toast.error("Delete error: " + (error as Error).message);
    }
  };

  const remarkeRow = async (id: number) => {
    try {
      // เรียก API PUT ครั้งแรก
      const res1 = await fetch(`/api/plan-remark/${id}?table=${nametableurl}&date=${encodeURIComponent(dateTime)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remark: "remark" }),
      });

      if (!res1.ok) {
        const data = await res1.json();
        toast.error("Update remark failed: " + (data.message || "Unknown error"));
        return;
      }

      // เรียก API PUT ครั้งที่สอง (ตัวอย่าง URL อาจเปลี่ยนตาม API จริง)
      const res2 = await fetch(`/api/edit-plan-target-2/${id}?table=${nametableurl}&date=${encodeURIComponent(dateTime)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ /* data ที่ต้องส่ง */ }),
      });

      if (!res2.ok) {
        const data = await res2.json();
        toast.error("Update target failed: " + (data.message || "Unknown error"));
        return;
      }

      // ถ้าเรียกสำเร็จทั้ง 2 ครั้ง อัปเดต state
      setRows((prevRows) =>
        prevRows.map(row =>
          row.id === id ? { ...row, remark: "remark" } : row
        )
      );
      const data = await loadPlanData();
      const updatedRows = updateAllRows(data);
      setRows(updatedRows);
      toast.success("Updated remark and target successfully");
    } catch (error) {
      toast.error("Update error: " + (error as Error).message);
    }
  };



  return (
    <div className="w-full bg-[#465e86] p-4">
      <div className="flex items-center justify-between gap-4 w-full">
        <h1 className="text-xl font-bold text-white">
          Production Plan Today Status
        </h1>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 flex items-center bg-[#1890ff] text-white rounded hover:bg-blue-700"
        >
          <FaPlus /> Add New
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-[#182039] w-[95%] max-w-6xl p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Config Daily Production Plan
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm border-collapse">
                <thead className="bg-[#465e86] text-white">
                  <tr>
                    <th className="p-2 border rounded-tl-lg whitespace-nowrap">
                      Sequence
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="p-2 border whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="p-2 border rounded-tr-lg whitespace-nowrap">
                      Remark
                    </th>
                    <th className="p-2 border rounded-tr-lg whitespace-nowrap">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id} className="text-center text-black">
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full p-2 bg-white rounded border"
                          value={idx + 1}
                          disabled
                        />
                      </td>
                      {columns.map(({ key, type, options }) => (
                        <td key={key} className="p-2">
                          {type === "select" ? (
                            <select
                              className="w-full p-2 bg-white rounded border"
                              value={row[key as keyof Row]}
                              onChange={(e) =>
                                updateRow(row.id, key as keyof Row, e.target.value)
                              }
                            >
                              <option value="">Select</option>
                              {options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : key === "startTime" || key === "endTime" ? (
                            <div className="w-full p-2 bg-gray-100 rounded border text-left text-black">
                              {row[key as keyof Row] || "-"}
                            </div>
                          ) : (
                            <input
                              type={type || "text"}
                              className="w-full p-2 bg-white rounded border"
                              value={row[key as keyof Row]}
                              onChange={(e) =>
                                updateRow(row.id, key as keyof Row, e.target.value)
                              }
                              min={type === "number" ? 0 : undefined}
                            />
                          )}
                        </td>
                      ))}
                      <td className="p-2">
                        <button
                          onClick={() => remarkeRow(row.id)}
                          className="text-amber-500 hover:text-amber-800 text-2xl"
                        >
                          <FaFilterCircleXmark />
                        </button>
                      </td>

                      <td className="p-2">
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="text-red-600 hover:text-red-800 text-2xl"
                        >
                          <RiDeleteBin6Line />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={addRow}
                className="flex items-center gap-1 px-4 py-2 bg-[#1890ff] text-white rounded hover:bg-blue-700"
              >
                <FaPlus /> Add New
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-[#1890ff] rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-[#1890ff] text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
