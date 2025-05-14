"use client";
import Modal from "@/components/Modal";
import PlanTable from "@/components/PlanTable";
import LossMemo from "@/components/LossMemo";

export default function Loss() {
  return (
    <div className="h-full flex justify-center p-4">
      <div className="w-full mt-25 p-4 shadow-lg overflow-y-auto
      [&::-webkit-scrollbar]:w-1 
               [&::-webkit-scrollbar-track]:bg-gray-100 
               [&::-webkit-scrollbar-thumb]:bg-gray-300 
               dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
               dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]">
        <Modal />
        <PlanTable />
        <LossMemo />
      </div>
    </div>
  );
}
