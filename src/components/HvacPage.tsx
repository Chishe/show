"use client";
import React from "react";
import { ReactFlowProvider } from "react-flow-renderer";
import { DnDProvider } from "@/components/DnDContext";
import DnDFlow from "@/components/DnDFlow";
import Sidebar from "@/components/Sidebar";
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
      <div className="w-full mt-25 p-4 shadow-lg overflow-y-auto
      [&::-webkit-scrollbar]:w-1 
               [&::-webkit-scrollbar-track]:bg-gray-100 
               [&::-webkit-scrollbar-thumb]:bg-gray-300 
               dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
               dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]">
        <ReactFlowProvider>
          <DnDProvider>
            <div className="flex">
              <div className="flex-col flex-1">
                <div className="flex flex-1">
                  <SafetyStatusCard type="hvac" />
                  <QualityStatusCard type="hvac" />
                  <DeliveryStatusCard type="hvac" />
                  <CostStatusCard type="hvac" />
                  <EnergyStatusCard type="hvac" />
                </div>
                <div className="flex flex-1">
                  <DnDFlow />
                </div>
                  <ProductionStatusCards type="hvac" />
              </div>

              <Sidebar />
            </div>
            <ToastContainer />
          </DnDProvider>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default HvacPage;
