import { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";

const columns = [
  {
    key: "partNumber",
    label: "Part Number",
    type: "select",
    options: ["PN001", "PN002"],
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
  const limitDate = new Date();
  limitDate.setHours(18, 50, 0, 0); // 18:50:00

  if (endDate > limitDate) return "18:50";

  const hh = String(endDate.getHours()).padStart(2, "0");
  const mm = String(endDate.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};


export default function Model() {
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
    },
  ]);

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
        updated.endTime = calculateEndTime(
          updated.startTime,
          updated.qty,
          updated.ctTarget
        );
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
        },
      ];
    }

    const prevRow = rows[rows.length - 1];
    const newStartTime = prevRow.endTime || "07:35";

    const [newStartHour, newStartMin] = newStartTime.split(":").map(Number);
    const endLimit = new Date();
    endLimit.setHours(18, 50, 0, 0);

    const newStartDate = new Date();
    newStartDate.setHours(newStartHour, newStartMin, 0, 0);

    if (newStartDate >= endLimit) {
      alert("Cannot add more rows. End time limit reached (18:50).");
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
      },
    ];
  });


  const deleteRow = (id: number) =>
    setRows((rows) => rows.filter((r) => r.id !== id));

  return (
    <div className="w-full bg-[#465e86] p-4">
      <div className="flex items-center justify-between gap-4 w-full">
        <h1 className="text-xl font-bold text-white">Production Plan Today Status</h1>
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
                      <th key={col.key} className="p-2 border whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                    <th className="p-2 border rounded-tr-lg whitespace-nowrap">Action</th>
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
                          ) : (
                            <input
                              type={type || "text"}
                              className="w-full p-2 bg-white rounded border"
                              value={row[key as keyof Row]}
                              onChange={(e) =>
                                updateRow(row.id, key as keyof Row, e.target.value)
                              }
                              disabled={key === "endTime"}
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
                <button className="px-4 py-2 bg-[#1890ff] text-white rounded hover:bg-blue-700">
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
