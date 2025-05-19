"use client";
import Modal from "@/components/Modal";
import PlanTable from "@/components/PlanTable";
import LossMemo from "@/components/LossMemo";
import TimeSlotChart from "@/components/TimeSlotChart";
import ComboStatus from "@/components/ComboStatus";

export default function Loss() {
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
        <div className="w-full max-w-full h-[400px] bg-[#100C2A] rounded-lg p-4">
          <TimeSlotChart nametableurl="core_5"/>
        </div>

        <Modal nametableurl="core_5" />
        <PlanTable nametableurl="core_5" />
        <div>
          <h2 className="text-2xl font-bold ml-4 my-4 text-white">
            Component Status
          </h2>
          <ComboStatus />
        </div>
        <div>
          <h2 className="text-2xl font-bold ml-4 my-4 text-white">Loss Memo</h2>
          <LossMemo nametableurl="core_5"/>
        </div>
      </div>
    </div>
  );
}