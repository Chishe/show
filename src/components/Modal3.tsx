import { useState, useEffect } from "react";

import { RiDeleteBin6Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";

const columns = [
  {
    key: "partNumber",
    label: "Part Number",
    type: "select",
    options: ["TG447687-0171",
      "TG447687-0160",
      "TG447687-0070",
      "TG447687-0430",
      "TG447686-1830",
      "TG447686-0601",
      "TG447686-1770",
      "TG447686-1820",
      "TG447686-0591",
      "TG447686-1760",
      "TG447685-0033",
      "TG447684-1140",
      "TG447684-1130",
      "TG447682-5330",
      "TG447682-5320",
      "TG447682-5080",
      "TG447682-5090",
      "TG447683-6400",
      "TG447683-6390",
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
};

const calculateEndTime = (
  startTime: string,
  qty: string,
  ctTarget: string
): string => {
  if (!startTime || !qty || !ctTarget) return "";

  const [hourStr, minStr] = startTime.split(":");
  const startDate = new Date();
  startDate.setHours(parseInt(hourStr));
  startDate.setMinutes(parseInt(minStr));
  startDate.setSeconds(0);

  const totalSeconds = parseInt(qty) * parseInt(ctTarget);
  if (isNaN(totalSeconds)) return "";

  const endDate = new Date(startDate.getTime() + totalSeconds * 1000);

  endDate.setSeconds(0);
  const minutes = endDate.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 10) * 10;

  endDate.setMinutes(roundedMinutes);

  const limitDate = new Date();
  limitDate.setHours(18, 50, 0, 0);

  if (endDate > limitDate) return "06:50";

  const hh = String(endDate.getHours()).padStart(2, "0");
  const mm = String(endDate.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
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
    },
  ]);

  const loadPlanData = async () => {
    const res = await fetch(`/api/plan-c?nametableurl=${encodeURIComponent(
      nametableurl
    )}&date=${encodeURIComponent(dateTime)}`
    )
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data;
  };


  const handleSubmit = async () => {
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
      const res = await fetch(`/api/insert-plan?table=${nametableurl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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

  useEffect(() => {
    if (isOpen) {
      loadPlanData().then(setRows).catch(console.error);
    }
  }, [isOpen]);

  const updateRow = (id: number, key: keyof Row, value: string) =>
    setRows((rows) =>
      rows.map((r) => {
        if (r.id !== id) return r;
  
        const updated = { ...r, [key]: value };
  
        if (
          ["startTime", "qty", "ctTarget"].includes(key) &&
          updated.startTime &&
          updated.qty &&
          updated.ctTarget
        ) {
          const [startH, startM] = updated.startTime.split(":").map(Number);
          const startDate = new Date();

          startDate.setHours(startH, startM, 0, 0);
  
          const ct = parseInt(updated.ctTarget);
          let qty = parseInt(updated.qty);
  
          const durationSeconds = qty * ct;
          const endDate = new Date(startDate.getTime() + durationSeconds * 1000);

          const limitDate = new Date(startDate);
          limitDate.setDate(limitDate.getDate() + 1);
          limitDate.setHours(6, 50, 0, 0);
  
          if (endDate > limitDate) {
            const availableSeconds = (limitDate.getTime() - startDate.getTime()) / 1000;
            const maxQty = Math.floor(availableSeconds / ct);
  
            updated.qty = maxQty.toString();
            updated.endTime = "06:50";
          } else {
            const endH = endDate.getHours().toString().padStart(2, "0");
            const endM = endDate.getMinutes().toString().padStart(2, "0");
            updated.endTime = `${endH}:${endM}`;
          }
        }
  
        return updated;
      })
    );

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
      
      const now = new Date();
      
      const newStartDate = new Date(now);
      newStartDate.setHours(newStartHour, newStartMin, 0, 0);
      
      const endLimit = new Date(newStartDate);
      if (newStartHour < 7) {
      } else {
        endLimit.setDate(endLimit.getDate() + 1);
      }
      endLimit.setHours(6, 50, 0, 0);
      
      if (newStartDate >= endLimit) {
        alert("Cannot add more rows. End time limit reached (06:50).");
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

  const deleteRow = async (id: number) => {
    try {
      const res = await fetch(`/api/plan/${id}?table=${nametableurl}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Delete failed:", data.message);
        alert("Delete failed: " + data.message);
        return;
      }

      console.log("Deleted successfully");
      setRows((rows) => rows.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete error: " + (error as Error).message);
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
                      Action
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
                          onClick={() => deleteRow(row.id)}
                          className="text-red-600 hover:text-red-800"
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
