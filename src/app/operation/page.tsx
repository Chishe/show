"use client";
import React, { useState } from "react";
import ProcessComponent from "@/components/ProcessComponent";
import CTIndividualProcess from "@/components/CTIndividualProcess";
import LossInProcess from "@/components/LossInProcess";
import KadaiList from "@/components/KadaiList";

const Operation = () => {
  const [dateTime, setDateTime] = useState("");

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateTime(event.target.value);
  };
  

  return (
    <div className="h-full flex justify-center p-4">
      <div className="w-full mt-25 p-4 bg-[#465e86] shadow-lg overflow-y-auto  
               [&::-webkit-scrollbar]:w-1 
               [&::-webkit-scrollbar-track]:bg-gray-100 
               [&::-webkit-scrollbar-thumb]:bg-gray-300 
               dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
               dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]">
        <div className="flex justify-start ml-6">
          <input
            type="datetime-local"
            onChange={handleDateChange}
            className="px-6 py-2 border bg-amber-300 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div><ProcessComponent /></div>
        <div><CTIndividualProcess apiUrl={`/api/individual?datetime=${encodeURIComponent(dateTime)}`} label="CTIndividualProcess"/></div>
        <div><LossInProcess apiUrl={`/api/loss?datetime=${encodeURIComponent(dateTime)}`} label="Loss In-Process"/></div>
        <div>
          <KadaiList
            apiUrl={`/api/kadai-list?datetime=${encodeURIComponent(dateTime)}`}
            label="Kadai List"
          />
        </div>
      </div>
    </div>
  );
};

export default Operation;
