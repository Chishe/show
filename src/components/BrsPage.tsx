"use client";
import React from "react";
import { ReactFlowProvider } from "react-flow-renderer";
import { DnDProvider } from "@/components/DnDContext";
import NdNFlow from "@/components/NdNFlow";
import Sidebars from "@/components/Sidebars";
import { ToastContainer } from "react-toastify";
import SafetyStatusCard from "@/components/SafetyStatusCard";
import QualityStatusCard from "@/components/QualityStatusCard";
import DeliveryStatusCard from "@/components/DeliveryStatusCard";
import CostStatusCard from "@/components/CostStatusCard";
import EnergyStatusCard from "@/components/EnergyStatusCard";
import ProductionStatusCards from "@/components/ProductionStatusCards";

const HvacPage = () => {
  return (
    <div className="h-full flex justify-center p-4">
      <div className="w-full mt-24 p-4 shadow-lg overflow-y-auto
      [&::-webkit-scrollbar]:w-1 
      [&::-webkit-scrollbar-track]:bg-gray-100 
      [&::-webkit-scrollbar-thumb]:bg-gray-300 
      dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
      dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]">
        <ReactFlowProvider>
          <DnDProvider>
            <div className="flex">
              <div className="flex flex-col flex-1 overflow-y-auto p-4">
                <div className="flex shadow-sm overflow-x-auto
                                [&::-webkit-scrollbar]:h-1 
                                [&::-webkit-scrollbar-track]:bg-gray-100 
                                [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
                                dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]">
                  <SafetyStatusCard type="brs" />
                  <QualityStatusCard type="brs" />
                  <DeliveryStatusCard type="brs" />
                  <CostStatusCard type="brs" />
                  <EnergyStatusCard type="brs" />
                </div>
                <div className="flex-1 flex items-stretch justify-between gap-2 h-full py-4">
                  <div className="basis-4/5 h-full">
                    <NdNFlow />
                  </div>
                  <div className="basis-1/5 h-full">
                    <Sidebars />
                  </div>
                </div>

                <ProductionStatusCards type="brs" />
              </div>

            </div>
            <ToastContainer />
          </DnDProvider>
        </ReactFlowProvider>
      </div>
    </div>

  );
};

export default HvacPage;
