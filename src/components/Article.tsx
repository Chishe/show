"use client";

import dynamic from "next/dynamic";
import { useState, memo, useCallback } from "react";
import { ReactFlowProvider, Background, Controls, Handle, Position } from "reactflow";
import { AiOutlineDatabase } from "react-icons/ai";
import "reactflow/dist/style.css";

const ReactFlow = dynamic(() => import("reactflow"), { ssr: false });

const nodeTypes = {
  customNode: memo(({ data }) => {
    const nodeColor =
      data.percentage > 90
        ? "rgb(65, 212, 168)"
        : data.percentage > 80
        ? "rgb(246, 211, 101)"
        : "rgb(255, 87, 98)";

    return (
      <div
        className="px-4 py-2 text-white rounded-lg shadow-lg text-center"
        style={{ backgroundColor: nodeColor }}
      >
        <div className="text-sm font-semibold">{data.label}</div>
        <div className="text-xs font-light mt-1">{data.percentage}%</div>
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-white border"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-white border"
        />
      </div>
    );
  }),
  buttonNode: memo(({ data }) => (
    <div className="w-16 h-16 bg-white rounded-full shadow-lg border flex items-center justify-center relative">
      <button
        onClick={() => data.setIsModalOpen(true)}
        className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
      >
        <AiOutlineDatabase size={20} />
      </button>
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-white border absolute left-0 top-1/2 -translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-white border absolute right-0 top-1/2 -translate-y-1/2"
      />
    </div>
  )),
};

export default function Article() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodes, setNodes] = useState([
    {
      id: "1",
      type: "customNode",
      data: { label: "H-VAC-1", percentage: 95 },
      position: { x: 100, y: 100 },
      draggable: true,
    },
    {
      id: "2",
      type: "customNode",
      data: { label: "H-VAC-2", percentage: 85 },
      position: { x: 250, y: 100 },
      draggable: true,
    },
    {
      id: "3",
      type: "customNode",
      data: { label: "H-VAC-3", percentage: 75 },
      position: { x: 400, y: 100 },
      draggable: true,
    },
    {
      id: "4",
      type: "customNode",
      data: { label: "H-VAC-4", percentage: 60 },
      position: { x: 550, y: 100 },
      draggable: true,
    },
    {
      id: "5",
      type: "customNode",
      data: { label: "H-VAC-5", percentage: 98 },
      position: { x: 700, y: 100 },
      draggable: true,
    },
    {
      id: "6",
      type: "buttonNode",
      position: { x: 400, y: 250 },
      data: { setIsModalOpen },
    },
  ]);

  const [edges] = useState([
    {
      id: "e1-2",
      source: "1",
      target: "2",
      animated: true,
      style: { stroke: "#F44336", strokeWidth: 2 },
    },
    {
      id: "e2-3",
      source: "2",
      target: "3",
      animated: true,
      style: { stroke: "#F44336", strokeWidth: 2 },
    },
    {
      id: "e3-4",
      source: "3",
      target: "4",
      animated: true,
      style: { stroke: "#F44336", strokeWidth: 2 },
    },
    {
      id: "e4-5",
      source: "4",
      target: "5",
      animated: true,
      style: { stroke: "#F44336", strokeWidth: 2 },
    },
  ]);

  const handleNodeDragStop = useCallback(
    (event, node) => {
      const updatedNodes = nodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      );
      setNodes(updatedNodes);
      // Optionally call an API to save the state or save in localStorage
      console.log("Node saved: ", updatedNodes);
    },
    [nodes]
  );

  const colorCount = nodes.reduce((acc, node) => {
    const nodeColor =
      node.data.percentage > 90
        ? "rgb(65, 212, 168)"
        : node.data.percentage > 80
        ? "rgb(246, 211, 101)"
        : "rgb(255, 87, 98)";
    acc[nodeColor] = (acc[nodeColor] || 0) + 1;
    return acc;
  }, {});

  return (
    <ReactFlowProvider>
      <article className="shadow-lg p-6 w-full bg-[#465e86] h-full min-h-screen">
        <h2 className="mt-25 text-lg font-semibold text-white border-b pb-4 mb-4">
          Production Flow |
          {["rgb(65, 212, 168)", "rgb(246, 211, 101)", "rgb(255, 87, 98)"].map(
            (color) => (
              <span
                key={color}
                style={{ backgroundColor: color }}
                className="text-white mx-2 px-2 py-1 rounded"
              >
                {colorCount[color] || 0}
              </span>
            )
          )}
        </h2>
        <FlowChart
          nodes={nodes}
          edges={edges}
          onNodeDragStop={handleNodeDragStop}
        />
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-[#100C2A] p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Factory Details
              </h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-[#3b82f6]">
                    <th className="border border-gray-300 px-4 py-2">
                      Machine
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nodes
                    .filter((node) => node.type === "customNode")
                    .map((node) => (
                      <tr key={node.id} className="text-center">
                        <td className="border border-gray-300 px-4 py-2">
                          {node.data.label}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {node.data.percentage}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </article>
    </ReactFlowProvider>
  );
}

function FlowChart({ nodes, edges, onNodeDragStop }) {
  return (
    <div className="h-[45rem] relative border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeDragStop={onNodeDragStop}
      >
        <Background variant="dots" gap={12} size={1} color="#bbb" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
