"use client";
import React, { useEffect, useState } from "react";
import Modal3 from "@/components/Modal3";
import PlanTable from "@/components/PlanTable";
import PlanTable2 from "@/components/PlanTable2";
import PlanTable3 from "@/components/PlanTable3";
import LossMemo from "@/components/LossMemo";
import TimeSlotChart from "@/components/TimeSlotChart";
import ComboStatus from "@/components/ComboStatus";
import { useShift } from "@/context/ShiftContext";
export default function Loss() {
  const [dateTime, setDateTime] = useState("");
  const { shiftState } = useShift();
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDateTime(today);
  }, []);
  useEffect(() => {
    console.log("✅ shiftState changed to:", shiftState);
  }, [shiftState]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateTime(event.target.value);
  };

  if (!dateTime) return null;

  const renderModel2 = () => {
    switch (shiftState) {
      case "☀️":
        return <PlanTable nametableurl="core_5" dateTime={dateTime} />;
      case "🌙":
        return <PlanTable2 nametableurl="core_5" dateTime={dateTime} />;
      case "All":
        return <PlanTable3 nametableurl="core_5" dateTime={dateTime} />;
      default:
        return null;
    }
  };
  return (
    <div className="h-full flex justify-center p-4">

      <div
        className="w-full mt-25 p-4 bg-[#465e86] shadow-lg overflow-y-auto  
               [&::-webkit-scrollbar]:w-1 
               [&::-webkit-scrollbar-track]:bg-gray-100 
               [&::-webkit-scrollbar-thumb]:bg-gray-300 
               dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
               dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]"
      >
        <div className="flex justify-end p-4">
          <input
            type="date"
            value={dateTime}
            onChange={handleDateChange}
            className="px-6 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full max-w-full h-[400px] bg-[#100C2A] rounded-lg p-4">
          <TimeSlotChart nametableurl="core_5" dateTime={dateTime} />
        </div>
        <div><Modal3 nametableurl="core_5" dateTime={dateTime} /></div>
        <div>{renderModel2()}</div>
        <div>
          <h2 className="text-2xl font-bold ml-4 my-4 text-white">
            Component Status
          </h2>
          <ComboStatus />
        </div>
        <div>
          <h2 className="text-2xl font-bold ml-4 my-4 text-white">Loss Memo</h2>
          <LossMemo nametableurl="core_5" dateTime={dateTime} />
        </div>
      </div>
    </div>
  );
}
