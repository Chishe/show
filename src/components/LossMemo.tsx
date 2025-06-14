import React, { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GiCardboardBox } from "react-icons/gi";

interface LossMemoItem {
  itemno: number;
  situation: string;
  problemtype: string;
  factor: string;
  partNo: string;
  details: string;
  action: string;
  pic: string;
  due: string;
  status: string;
  effectiveLot: string;
}

interface LossMemoProps {
  nametableurl: string;
  dateTime: string;
}

export default function LossMemo({ nametableurl, dateTime }: LossMemoProps) {
  const [data, setData] = useState<LossMemoItem[]>([]);
  const [editing, setEditing] = useState<{ itemno: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // useCallback เพื่อให้ fetchData อ้างอิงเดิม ไม่เกิด warning
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/getRecords?nametableurl=${encodeURIComponent(nametableurl)}&date=${encodeURIComponent(dateTime)}`
      );
      setData(response.data);
    } catch {
      toast.error("Failed to fetch records");
    }
  }, [nametableurl, dateTime]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LossMemo");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(dataBlob, `LossMemo_${new Date().toISOString()}.xlsx`);
  };

  const handleEdit = (itemno: number, field: keyof LossMemoItem, value: string) => {
    setEditing({ itemno, field });
    setEditValue(value);
  };

  const saveEdit = async () => {
    if (!editing) return;

    const { itemno, field } = editing;
    try {
      await axios.put(`/api/updateRecord?table=${nametableurl}`, {
        itemno,
        field,
        value: editValue,
      });
      setEditing(null);
      fetchData();
      toast.success("Record updated successfully");
    } catch (error) {
      console.error("Failed to update record:", error);
      toast.error("Failed to update record");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getColorClass = (field: string, value: string) => {
    switch (field) {
      case "situation":
        if (value === "Abnormal") return "bg-red-500 text-white";
        if (value === "KAIZEN") return "bg-green-500 text-white";
        break;
      case "problemtype":
        if (value === "Quality") return "bg-red-500 text-white";
        if (value === "Cost") return "bg-green-500 text-white";
        break;
      case "factor":
        if (value === "Part Dim") return "bg-red-500 text-white";
        break;
      case "status":
        if (value === "Pending") return "bg-yellow-400 text-black";
        if (value === "Finnish") return "bg-green-500 text-white";
        break;
    }
    return "px-2 py-1";
  };

  return (
    <div className="w-full bg-[#100C2A] py-4 rounded-lg">
      <div className="flex justify-end px-4 mb-2">
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-900"
        >
          Export to Excel
        </button>
      </div>
      <div className="overflow-x-auto max-h-[80vh] w-full p-4">
        <table className="w-full table-auto border-collapse text-xs text-center">
          <thead>
            <tr className="bg-[#465e86] text-white">
              <th className="px-4 py-2 border">Item No</th>
              <th className="px-4 py-2 border">Situation</th>
              <th className="px-4 py-2 border">Problem Type</th>
              <th className="px-4 py-2 border">Factor</th>
              <th className="px-4 py-2 border">P/No</th>
              <th className="px-4 py-2 border">Details</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">PIC</th>
              <th className="px-4 py-2 border">Due</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Effective Lot</th>
              <th className="px-4 py-2 border">Createdat</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center text-gray-500 py-4 border">
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                    <GiCardboardBox size={32} />
                    <span>No data</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.itemno} className="text-center text-white">
                  {Object.entries(item).map(([field, value]) => {
                    const isEditing = editing?.itemno === item.itemno && editing.field === field;
                    const isEditable = field !== "itemno";

                    return (
                      <td
                        key={field}
                        className={`border ${getColorClass(field, String(value))}`}
                        onClick={() =>
                          isEditable && handleEdit(item.itemno, field as keyof LossMemoItem, String(value))
                        }
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") setEditing(null);
                            }}
                            autoFocus
                            className="w-full bg-black text-white border border-white px-1"
                          />
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
