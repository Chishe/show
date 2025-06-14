import { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import type { ChartDataset } from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";
import { GiCardboardBox } from "react-icons/gi";
import { Line } from "react-chartjs-2";
import type { Chart as ChartType } from "chart.js";
import { toast, ToastContainer } from "react-toastify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface ChartData {
  timeSlot: string;
  partNumber: string;
  targetA: number[][];
  actualA: number[][];
}

interface ChartState {
  labels: string[];
  datasets: ChartDataset<"line", (number | null)[]>[];
}
interface TimeSlotChartProps {
  nametableurl: string;
  dateTime: string;
}


const TimeSlotChart = ({ nametableurl, dateTime }: TimeSlotChartProps) => {
  const [chartData, setChartData] = useState<ChartState | null>(null);
  const [timeSlotRefs, setTimeSlotRefs] = useState<string[]>([]);
  const [partnumberRefs, setpartnumbeRefs] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [selectedLoss, setSelectedLoss] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [detail, setDetail] = useState<string>("");

  const chartRef = useRef<ChartType<"line">>(null);

  useEffect(() => {
    const fetchChartData = () => {
      console.log("Fetching chartdata with:", nametableurl, dateTime);
      fetch(
        `/api/chartdata?nametableurl=${encodeURIComponent(
          nametableurl
        )}&date=${encodeURIComponent(dateTime)}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data: ChartData[]) => {
          const slotIndexPartMap = new Map<string, Map<string, { target: number, actual: number }>>();
          data.forEach((d) => {
            const timeSlot = d.timeSlot;
            const partNumber = d.partNumber;
            const tArr = d.targetA[0] ?? [];
            const aArr = d.actualA[0] ?? [];

            for (let idx = 0; idx < 6; idx++) {
              const t = tArr[idx] ?? 0;
              const a = aArr[idx] ?? 0;
              const key = `${timeSlot}_${idx}`;

              console.log(`  Slot ${idx} | Key: ${key} | t: ${t}, a: ${a}`);

              if (!slotIndexPartMap.has(key)) {
                console.log(`    ➕ Create new key: ${key}`);
                slotIndexPartMap.set(key, new Map());
              }

              const partMap = slotIndexPartMap.get(key)!;

              if (!partMap.has(partNumber)) {
                console.log(`    ➕ Add part: ${partNumber} to key: ${key}`);
                partMap.set(partNumber, { target: 0, actual: 0 });
              }

              const val = partMap.get(partNumber)!;
              val.target += t;
              val.actual += a;

            }
          });


          const labels: string[] = [];
          const target: number[] = [];
          const actual: number[] = [];
          const slots: string[] = [];
          const pn: string[] = [];

          let counter = 1;

          slotIndexPartMap.forEach((partMap, key) => {
            let sumTarget = 0;
            let sumActual = 0;

            partMap.forEach(({ target: t, actual: a }) => {
              sumTarget += t;
              sumActual += a;
            });

            if (sumTarget === 0) return;

            labels.push(counter.toString());
            target.push(sumTarget);
            actual.push(sumActual === 0 ? NaN : sumActual);

            const [timeSlot] = key.split("_");
            slots.push(timeSlot);

            const underParts = Array.from(partMap.entries())
              .filter(([, { target, actual }]) => (target > 0 || actual > 0) && actual < target)
              .map(([part]) => part);

            pn.push(underParts.length > 0 ? underParts.join(", ") : "-");

            counter++;
          });

          setTimeSlotRefs(slots);
          setpartnumbeRefs(pn);
          setChartData({
            labels,
            datasets: [
              {
                label: "Target",
                data: target,
                borderColor: "#9D00FF",
                fill: false,
                borderDash: [10, 10],
                pointRadius: 0,
              },
              {
                label: "Target 97%",
                data: target.map((val) => val * 0.97),
                borderColor: "#2CFF05",
                fill: false,
                pointRadius: 0,
              },
              {
                label: "Actual",
                data: actual,
                borderColor: "#4deeea",
                fill: false,
                pointRadius: 6,
                datalabels: {
                  display: true,
                  color: 'white',
                  anchor: 'end',
                  align: 'top',
                  font: {
                    weight: 'bold'
                  },
                  formatter: (value: number | null) =>
                    value != null && !isNaN(value) ? value : '',
                },
              },
            ],
          });
        })
        .catch((error) => {
          console.error("Error fetching chart data:", error);
        });

    };

    fetchChartData();

    const interval = setInterval(fetchChartData, 1000);

    return () => clearInterval(interval);
  }, [nametableurl, dateTime]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "",
          color: "white",
        },
        ticks: {
          color: "white",
        },
        grid: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: "white",
        },
        title: {
          display: true,
          text: "pcs/10 min",
          color: "white",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "white",
          drawOnChartArea: true,
          drawTicks: true,
          lineWidth: 0.5,
        },
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        position: "top",
        labels: {
          color: "white",
        },
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          title: (tooltipItems: TooltipItem<"line">[]) => {
            const idx = tooltipItems[0].dataIndex;
            return `Time Slot: ${timeSlotRefs[idx]}\nPartnumber: ${partnumberRefs[idx]}`;
          },
        },
        titleColor: "black",
        bodyColor: "black",
        backgroundColor: "#fff",
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    hover: {
      mode: "nearest",
      intersect: false,
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
    elements: {
      line: {
        tension: 0,
        borderColor: "white",
      },
    },
    backgroundColor: "#4deeea",
  };

  const handleClick = (event: React.MouseEvent) => {

    if (chartRef.current) {
      const chart = chartRef.current;
      const points = chart.getElementsAtEventForMode(
        event.nativeEvent,
        "nearest",
        { intersect: true },
        false
      );

      if (points.length > 0) {
        const pointIndex = points[0].index;
        setSelectedPoint(pointIndex);
        setShowPopup(true);
      }
    }
  };

  const handleLossChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLoss(event.target.value);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  const handleDetailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDetail(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedPoint === null) return;

    const newRecord = {
      situation: selectedLoss,
      problemType: selectedLoss === "Big Loss" ? selectedStatus : "",
      factor: "",
      partNo: partnumberRefs[selectedPoint],
      details: detail,
      action: "",
      pic: "",
      due: dateTime,
      status: "Pending",
      effectiveLot: `Lot-${timeSlotRefs[selectedPoint]}`,
    };

    console.log("📝 Record to Insert:", newRecord);

    fetch(`/api/insertRecord?table=${nametableurl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRecord),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to insert record");
        return res.json();
      })
      .then(() => {
        toast.success("Record successfully inserted!");
      })
      .catch(() => {
        toast.error("Error inserting record!");
      });


    setShowPopup(false);
  };

  if (!chartData)
    return (
      <div className="relative z-10 flex flex-col items-center justify-center gap-2">
        <GiCardboardBox size={32} />
        <span>No data</span>
      </div>
    );

  return (
    <>
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        onClick={handleClick}
      />
      {showPopup && selectedPoint !== null && (
        <div className="text-white fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
          <div className="bg-[#182039] p-6 rounded-lg w-96 max-w-full shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold mb-4">
              Details for Time Slot: {timeSlotRefs[selectedPoint]}
            </h3>
            <label className="mb-2">
              Loss Type:
              <select
                value={selectedLoss}
                onChange={handleLossChange}
                className="border rounded px-2 py-1 w-full bg-[#182039]"
              >
                <option value="">Select</option>
                <option value="Chokotei">Chokotei</option>
                <option value="Big Loss">Big Loss</option>
              </select>
            </label>

            {selectedLoss === "Big Loss" && (
              <label className="mb-2">
                Status:
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="border rounded px-2 py-1 w-full bg-[#182039]"
                >
                  <option value="">Select</option>
                  <option value="Alarm">Alarm</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Start Prod">Start Prod</option>
                </select>
              </label>
            )}

            <label className="mb-2">
              Detail:
              <input
                type="text"
                value={detail}
                onChange={handleDetailChange}
                className="border rounded px-2 py-1 w-full"
              />
            </label>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 text-[#1890ff] rounded hover:bg-gray-400"
              >
                Close
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
      )}
      <ToastContainer />
    </>
  );
};

export default TimeSlotChart;
