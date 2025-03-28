import React from "react";
import ProcessComponent from "@/components/ProcessComponent";
import CTIndividualProcess from "@/components/CTIndividualProcess";
import LossInProcess from "@/components/LossInProcess";
import KadaiList from "@/components/KadaiList";

const operation = () => {
  return (
    <div className="h-full flex justify-center p-4">
      <div className="mt-25 w-full p-4 bg-[#465e86] shadow-lg overflow-y-auto  
               [&::-webkit-scrollbar]:w-1 
               [&::-webkit-scrollbar-track]:bg-gray-100 
               [&::-webkit-scrollbar-thumb]:bg-gray-300 
               dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
               dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]">
        <div><ProcessComponent /></div>
        <div><CTIndividualProcess apiUrl="http://localhost:4000/api/individual" label="CTIndividualProcess" /></div>
        <div><LossInProcess apiUrl="http://localhost:4000/api/loss" label="Loss In-Process" /></div>
        <div><KadaiList apiUrl="http://localhost:4000/api/kadai-list" label="Kadai List" /></div>
      </div>
    </div>
  );
};

export default operation;
