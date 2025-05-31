"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FaFileUpload, FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

interface KadaiListProps {
  title: string;
  station: number | string;
  apiUrl: string;
}
interface KadaiItem {
  id: number;
  station: string;
  due: string;
  item: string;
}

interface DataItem {
  id: number;
  station: string;
  due: string;
  item: string;
  [key: string]: string | number | undefined;
}

const KadaiList = ({ title, station, apiUrl}: KadaiListProps) => {
  const [data, setData] = useState<KadaiItem[]>([]);
  const [item, setItem] = useState("");
  const [due, setDue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setItem("");
    setDue("");
    setEditIndex(null);
  };

  const handleAddOrUpdate = async () => {
    const payload = { item, due, station: station.toString() };

    if (!item || !due) {
      toast.error("Please enter both item and due date", { autoClose: 2000 });
      return;
    }

    if (editIndex !== null) {
      const id = data[editIndex].id;
      try {
        const response = await axios.put(
          `/api/kadai/${id}`,
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 200 && response.data.result) {
          toast.success("Kadai updated successfully!", { autoClose: 2000 });

          const updatedItem = response.data.result[0];

          setData((prevData) =>
            prevData.map((item) => (item.id === id ? updatedItem : item))
          );

          resetForm();
        } else {
          toast.error("Failed to update kadai", { autoClose: 2000 });
        }
      } catch (error) {
        toast.error("Error submitting data", { autoClose: 4000 });
        console.error("Error:", error);
      }
    } else {
      try {
        const response = await axios.post(
          "/api/kadai",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 201 && response.data.result) {
          toast.success("Kadai added successfully!", { autoClose: 2000 });
          setData((prevData) => [...prevData, response.data.result[0]]);
          resetForm();
        } else {
          toast.error("Failed to add kadai", { autoClose: 2000 });
        }
      } catch (error) {
        toast.error("Error submitting data", { autoClose: 4000 });
        console.error("Error:", error);
      }
    }
  };

  const handleDeleteKadai = async (id: number) => {
    try {
      const response = await axios.delete(
        `/api/kadai-del/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Kadai deleted successfully!", { autoClose: 2000 });
        setData((prevData) => prevData.filter((item) => item.id !== id));
      } else {
        toast.error("Failed to delete kadai. Please try again.", {
          autoClose: 2000,
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting kadai:", error.response || error.message);
        toast.error(
          `Error deleting kadai: ${error.response?.data?.message ?? error.message}`,
          { autoClose: 4000 }
        );
      } else if (error instanceof Error) {
        console.error("Error deleting kadai:", error.message);
        toast.error(`Error deleting kadai: ${error.message}`, { autoClose: 4000 });
      } else {
        console.error("Unexpected error deleting kadai:", error);
        toast.error("Unexpected error deleting kadai", { autoClose: 4000 });
      }
    }
  };

  const formatDate = (utcDate: string | Date): string => {
    const date = new Date(utcDate);
    return date.toISOString().slice(0, 16).replace("T", " ");
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl);
        const result: DataItem[] = await response.json();

        const filteredData = result
          .filter((item: DataItem) => item.station === station.toString())
          .map((item: DataItem) => ({
            ...item,
            due: formatDate(item.due),
          }));

        const formattedData = filteredData.map((item: DataItem) => ({
          ...item,
          id: item.id || Date.now() + Math.random(),
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); // Fetch immediately on mount
    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds to reduce load
    return () => clearInterval(interval);
  }, [station, apiUrl]);

  const visibleData = Array.from(
    { length: 4 },
    (_, i) => data[i] ?? { item: "", due: "", id: `empty-${i}` }
  );

  return (
    <div className="overflow-auto">
      {isLoading && (
        <div className="text-center py-2 text-blue-600 font-semibold">Loading...</div>
      )}
      <table className="w-full border-separate border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Item</th>
            <th className="border p-2">Due</th>
          </tr>
        </thead>
        <tbody>
          {visibleData.map((row, idx) => (
            <tr key={row.id ?? `row-${idx}`} className="border text-center">
              <td className="border p-2 whitespace-nowrap bg-white">
                {row.item || "-"}
              </td>
              <td className="border p-2 whitespace-nowrap bg-white">
                {row.due || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog>
        <DialogTrigger className="mt-3 bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 active:bg-blue-700 transition duration-200 block mx-auto text-center mb-2">
          View All
        </DialogTrigger>

        <DialogContent className="bg-[#182039] text-white border-none">
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          <div className="flex gap-2 my-3 justify-center">
            <input
              type="text"
              placeholder="Item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="border p-2 w-1/3"
            />
            <input
              type="datetime-local"
              placeholder="Due"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="border p-2 w-1/3"
            />
            <button
              onClick={handleAddOrUpdate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-sm"
            >
              {editIndex !== null ? (
                <>
                  <FaEdit className="inline" /> Update
                </>
              ) : (
                <>
                  <FaFileUpload className="inline" /> Add
                </>
              )}
            </button>
          </div>

          <div className="overflow-auto max-h-96">
            <table className="w-full border-collapse border mt-3">
              <thead>
                <tr className="bg-rose-300 text-black">
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Due</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {data.map((row) =>
                  row && row.id ? (
                    <tr key={row.id} className="border text-center">
                      <td className="border p-2 whitespace-nowrap bg-white">
                        {row.item || "-"}
                      </td>
                      <td className="border p-2 whitespace-nowrap bg-white">
                        {row.due || "-"}
                      </td>
                      <td className="border p-2 whitespace-nowrap bg-white">
                        <button
                          onClick={() => {
                            setEditIndex(data.findIndex((d) => d.id === row.id));
                            setItem(row.item);
                            setDue(row.due);
                          }}
                          className="px-2 text-green-600 hover:text-green-700"
                          title="Edit"
                          aria-label={`Edit item ${row.item}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteKadai(row.id)}
                          className="px-2 text-red-600 hover:text-red-700"
                          title="Delete"
                          aria-label={`Delete item ${row.item}`}
                        >
                          <MdDeleteForever />
                        </button>
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default KadaiList;
