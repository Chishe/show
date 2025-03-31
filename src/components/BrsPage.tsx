"use client";
import React from "react";
import { ReactFlowProvider } from "react-flow-renderer";
import { DnDProvider } from "@/components/DnDContext";
import NdNFlow from "@/components/NdNFlow";
import Sidebars from "@/components/Sidebars";
import { ToastContainer } from "react-toastify";

const BrsPage = () => {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <div className="flex">
          <NdNFlow />
          <Sidebars />
        </div>
        <ToastContainer />
      </DnDProvider>
    </ReactFlowProvider>
  );
};

export default BrsPage;
