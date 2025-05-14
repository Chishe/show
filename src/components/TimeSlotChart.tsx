import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  targetA: (number | null)[]; 
  actualA: (number | null)[]; 
}

interface ChartState {
  labels: number[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    fill: boolean;
    borderDash?: number[];
    pointRadius?: number;
  }[];
}

const TimeSlotChart = () => {
  const [chartData, setChartData] = useState<ChartState | null>(null);

  useEffect(() => {
    fetch("/api/chartdata")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data: ChartData[]) => {
        const labels = data.map((_, index) => index + 1);

        const target = data.map((d) => d.targetA.map((value) => value ?? 0));
        const actual = data.map((d) => d.actualA.map((value) => value ?? 0));

        setChartData({
          labels,
          datasets: [
            {
              label: "Target",
              data: target.flat(),
              borderColor: "green",
              fill: false,
              borderDash: [5, 5],
            },
            {
              label: "Actual",
              data: actual.flat(),
              borderColor: "blue",
              fill: false,
              pointRadius: 6,
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching chart data:", error);
      });
  }, []);

  if (!chartData) return <p>Loading...</p>;

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "category",
        labels: chartData.labels,
      },
      y: {
        ticks: {
          stepSize: 10,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
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
        tension: 0.4,
      },
    },
    backgroundColor: "#100C2A",
  };

  return <Line data={chartData} options={options} />;
};

export default TimeSlotChart;
