"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface TableData {
  date: string;
  video: string;
  station?: string | number;
  [key: string]: any;
}

interface TableComponentProps {
  title: string;
  station: number;
  apiUrl: string;
}

const TableComponent: React.FC<TableComponentProps> = ({ title, station, apiUrl }) => {
  const [data, setData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formatDate = (utcDate: string): string => {
    const date = new Date(utcDate);
    return date.toISOString().slice(0, 16).replace("T", " ");
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl);
        const result: TableData[] = await response.json();
        const filteredData = result.filter(
          (item) => item.station?.toString() === station.toString()
        );
        const formattedData = filteredData.map((item) => ({
          ...item,
          date: formatDate(item.date),
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [station, apiUrl]);

  const visibleData = Array.from(
    { length: 4 },
    (_, i) => data[i] ?? { date: "", video: "" }
  );

  return (
    <div>
      <div className="overflow-auto">
        <table className="w-full border-separate border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date & Time</th>
              <th className="border p-2">Video</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, index) => (
              <tr key={index} className="border text-center">
                <td className="border p-2 whitespace-nowrap bg-white">
                  {row.date || "-"}
                </td>
                <td className="border p-2 whitespace-nowrap bg-white">
                  {row.video || "-"}
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

        <DialogContent className="bg-[#182039] text-white border-none">
          <h3 className="text-lg font-semibold text-center">{title}</h3>
          <div className="overflow-auto max-h-96">
            <table className="w-full border-collapse border mt-3">
              <thead>
                <tr className="bg-amber-300 text-black">
                  <th className="border p-2">Date & Time</th>
                  <th className="border p-2">Video</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="border text-center">
                    <td className="border p-2 whitespace-nowrap">{row.date}</td>
                    <td className="border p-2 whitespace-nowrap">{row.video}</td>
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

// Optional: Define prop types for main component if needed
interface CTIndividualProcessProps {
  apiUrl?: string;
  label?: string;
}

const getLegendColor = (label: string): string => {
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

export default function CTIndividualProcess({
  apiUrl = "/api/individual",
  label = "CT Individual Process",
}: CTIndividualProcessProps) {
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
