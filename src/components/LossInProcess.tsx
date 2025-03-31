"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TableComponent = ({ title, station, apiUrl }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (utcDate) => {
    const date = new Date(utcDate);
    return date.toISOString().slice(0, 16).replace("T", " ");
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        const filteredData = result.filter(
          (item) => item.station === station.toString()
        );
        const formattedData = filteredData.map((item) => ({
          ...item,
          date: formatDate(item.date),
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
    (_, i) => data[i] ?? { date: "", Loss: "" }
  );

  return (
    <div className="">
      <div className="overflow-auto">
        <table className="w-full border-separate border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date & Time</th>
              <th className="border p-2">Loss</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, index) => (
              <tr key={index} className="border text-center">
                <td className="border p-2 whitespace-nowrap bg-white">
                  {row.date || "-"}
                </td>
                <td className="border p-2 whitespace-nowrap bg-white">
                  {row.Loss || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog>
        <DialogTrigger className="mt-3 bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 active:bg-blue-700 transition duration-200 block mx-auto text-center">
          View All
        </DialogTrigger>

        <DialogContent>
          <h3 className="text-lg font-semibold text-center">{title}</h3>
          <div className="overflow-auto max-h-96">
            <table className="w-full border-collapse border mt-3">
              <thead>
                <tr className="bg-fuchsia-300">
                  <th className="border p-2">Date & Time</th>
                  <th className="border p-2">Loss</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="border text-center">
                    <td className="border p-2 whitespace-nowrap">{row.date}</td>
                    <td className="border p-2 whitespace-nowrap">
                      {row.Loss}
                    </td>
                  </tr>
                ))}
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

export default function LossInProcess({
  apiUrl = "http://192.168.1.100:4000/api/loss",
  label = "Loss In-Process",
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
