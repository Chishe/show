"use client";
import React from "react";
import { ReactFlowProvider } from "react-flow-renderer";
import { DnDProvider } from "@/components/DnDContext";
import NdNFlow from "@/components/NdNFlow";
import Sidebar from "@/components/Sidebar";
import { ToastContainer } from "react-toastify";

const BrsPage = () => {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <div className="flex">
          <NdNFlow />
          <Sidebar />
        </div>
        <ToastContainer />
      </DnDProvider>
    </ReactFlowProvider>
  );
};

export default BrsPage;
