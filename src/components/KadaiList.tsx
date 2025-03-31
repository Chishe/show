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

const TableComponent = ({ title, station, apiUrl }) => {
  const [data, setData] = useState([]);
  const [item, setItem] = useState("");
  const [due, setDue] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setItem("");
    setDue("");
    setEditIndex(null);
  };

  const handleAddOrUpdate = async () => {
    const payload = { item, station };
  
    if (editIndex !== null) {
      const id = data[editIndex].id;
      try {
        const response = await axios.put(
          `http://192.168.1.100:4000/api/kadai/${id}`,
          payload,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Update Response:", response);
  
        if (response.status === 200 && response.data.result) {
          toast.success("Kadai updated successfully!", { autoClose: 2000 });
  
          const updatedItem = response.data.result[0];
  
          setData((prevData) =>
            prevData.map((item) => (item.id === id ? updatedItem : item))
          );
  
          setEditIndex(null);
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
          "http://192.168.1.100:4000/api/kadai",
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
  

  const handleDeleteKadai = async (id) => {
    try {
      const response = await axios.delete(
        `http://192.168.1.100:4000/api/kadai-del/${id}`,
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
    } catch (error) {
      console.error("Error deleting kadai:", error.response || error.message);
      toast.error(
        `Error deleting kadai: ${
          error.response ? error.response.data.message : error.message
        }`,
        { autoClose: 4000 }
      );
    }
  };

  const formatDate = (utcDate) => {
    const due = new Date(utcDate);
    return due.toISOString().slice(0, 16).replace("T", " ");
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        console.log(result);
        const filteredData = result
          .filter((item) => item.station === station.toString())
          .map((item) => ({
            ...item,
            due: formatDate(item.due),
          }));

        const formattedData = filteredData.map((item) => ({
          ...item,
          id: item.id || Math.random(),
        }));

        setData(formattedData);
        toast.success(`Station ${station} data loaded successfully`, {
          autoClose: 2000,
        });
      } catch (error) {
        toast.error("Failed to load data", { autoClose: 4000 });
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [station, apiUrl]);

  const visibleData = Array.from(
    { length: 4 },
    (_, i) => data[i] ?? { item: "", due: "" }
  );

  return (
    <div className="overflow-auto">
      <table className="w-full border-separate border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Item</th>
            <th className="border p-2">Due</th>
          </tr>
        </thead>
        <tbody>
          {visibleData.map((row) => (
            <tr key={row.id || Math.random()} className="border text-center">
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

        <DialogContent>
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          <div className="flex gap-2 my-3 justify-center">
            <input
              type="text"
              placeholder="Item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="border p-2 w-1/2"
            />
            <button
              onClick={handleAddOrUpdate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-sm"
            >
              {/* Conditionally render icon and text */}
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
                <tr className="bg-rose-300">
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Due</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
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
                            setEditIndex(
                              data.findIndex((d) => d.id === row.id)
                            );
                            setItem(row.item);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-2 rounded-sm"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteKadai(row.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-sm ml-2"
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
    </div>
  );
};

const getLegendColor = (label) => {
  switch (label) {
    case "CTIndividualProcess":
      return "bg-yellow-500";
    case "Loss In-Process":
      return "bg-fuchsia-500";
    case "Kadai List":
      return "bg-rose-500";
    default:
      return "bg-gray-400";
  }
};
export default function KadaiList({
  apiUrl = "http://192.168.1.100:4000/api/kadai-list",
  label = "Kadai List",
}) {
  const stations = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="mt-4">
      <ToastContainer />
      <fieldset className="border-4 border-gray-300 p-4 rounded-lg bg-[#465e86]">
        <legend className={`rounded p-2 h-10 w-72 ${getLegendColor(label)}`}>
          <h1 className="text-2xl font-bold mb-4 text-center">{label}</h1>
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {stations.map((station) => (
            <TableComponent
              key={station}
              title={`Table ${station}`}
              station={station}
              apiUrl={apiUrl}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
