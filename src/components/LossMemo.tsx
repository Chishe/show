import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GiCardboardBox } from "react-icons/gi";
interface LossMemoItem {
  itemno: number;
  situation: string;
  problemType: string;
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
}
export default function LossMemo({ nametableurl }: LossMemoProps) {
  const [data, setData] = useState<LossMemoItem[]>([]);
  const [editing, setEditing] = useState<{
    itemno: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/getRecords?table=${nametableurl}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch records: ", error);
      toast.error("Failed to fetch records");
    }
  };

  const handleEdit = (
    itemno: number,
    field: keyof LossMemoItem,
    value: string
  ) => {
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
  }, []);

  const getColorClass = (field: string, value: string) => {
    switch (field) {
      case "situation":
        if (value === "Abnormal") return "bg-red-500 text-white";
        if (value === "KAIZEN") return "bg-green-500 text-white";
        break;
      case "problemType":
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
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="text-center text-gray-500 py-4 border"
                >
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
                    const isEditing =
                      editing?.itemno === item.itemno &&
                      editing.field === field;
                    const isEditable = field !== "itemno";

                    return (
                      <td
                        key={field}
                        className={`border ${getColorClass(
                          field,
                          String(value)
                        )}`}
                        onClick={() =>
                          isEditable &&
                          handleEdit(
                            item.itemno,
                            field as keyof LossMemoItem,
                            String(value)
                          )
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
