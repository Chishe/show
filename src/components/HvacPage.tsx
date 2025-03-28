"use client";
import React from "react";
import { ReactFlowProvider } from "react-flow-renderer";
import { DnDProvider } from "@/components/DnDContext";
import DnDFlow from "@/components/DnDFlow";
import Sidebar from "@/components/Sidebar";
import { ToastContainer } from "react-toastify";

const HvacPage = () => {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <div className="flex">
          <DnDFlow />
          <Sidebar />
        </div>
        <ToastContainer />
      </DnDProvider>
    </ReactFlowProvider>
  );
};

export default HvacPage;
