import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import ReactFlow, {
  addEdge,
  useEdgesState,
  useNodesState,
  Controls,
  Background,
  Position,
} from "react-flow-renderer";
import axios from "axios";
import { useDnD } from "@/components/DnDContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from 'next/link';
const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    border: "none",
    borderRadius: "8px",
    width: "100px",
    height: "50px",
  },
};

const handleChange = (event) => {
  const selectedPage = event.target.value;
  window.location.href = selectedPage;
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const customNode = ({ data }) => (
  <div
    style={{
      padding: "10px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      textAlign: "center",
    }}
  >
    <div>
      <strong>Label:</strong> {data?.label}
    </div>
    <div>
      <strong>Or:</strong> {data?.Or}
    </div>
    <div>
      <strong>Defect:</strong> {data?.Defect}
    </div>
  </div>
);

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { type } = useDnD();
  const [editingNode, setEditingNode] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const fetchData = async () => {
    try {
      const [nodesResponse, edgesResponse, valuesResponse] = await Promise.all([
        axios.get("/api/loaded-hvac-nodes"),
        axios.get("/api/loaded-hvac-edges"),
        axios.get("/api/hvac-values"),
      ]);

      const valuesMap = valuesResponse.data.reduce((acc, item) => {
        acc[item.label] = item;
        return acc;
      }, {});

      setNodes(
        nodesResponse.data.map((node) => {
          const nodeData = valuesMap[node.label] || {};
          let backgroundColor = "#41d4a8";

          if (nodeData.value !== undefined) {
            if (nodeData.value > nodeData.max) {
              backgroundColor = "#00FF00";
            } else if (nodeData.value < nodeData.min) {
              backgroundColor = "#DC143C";
            }
          }

          return {
            id: node.id.toString(),
            type: node.type,
            data: {
              label: (
                <div>
                  <div className="bg-[#4B0082] text-white rounded-t-sm mt-[-3px] w-full">{node.label}</div>
                  <div className="nowrap-text bg-emerald-200 rounded-b-sm w-full">
                    {node.Or || "0%"} | {node.Defect || 0}
                  </div>
                  <div className="hover-container mt-2">
                    <a
                      href="https://www.tsdmcd.com/dekidaka"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-link text-white bg-rose-700 hover:bg-rose-900 rounded-sm text-[8px] p-1"
                    >
                      MORE INFO..
                    </a>
                  </div>
                </div>
              ),
            },
            position: { x: node.x, y: node.y },
            ...nodeDefaults,
            style: { ...nodeDefaults.style, backgroundColor },
          };
        })
      );

      setEdges(
        edgesResponse.data.map((edge) => ({
          id: edge.id.toString(),
          source: edge.source,
          target: edge.target,
        }))
      );

      toast.success("Nodes & Edges loaded successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading nodes or edges.");
    }
  };

  useEffect(() => {
    const updateHandlesColor = () => {
      if (!reactFlowWrapper.current) return;

      nodes.forEach((node) => {
        if (!node.style) return;

        const color = node.style.backgroundColor || "#41d4a8";

        const handleLeft = reactFlowWrapper.current.querySelector(`.react-flow__handle-left[data-nodeid="${node.id}"]`);
        const handleRight = reactFlowWrapper.current.querySelector(`.react-flow__handle-right[data-nodeid="${node.id}"]`);

        if (handleLeft) handleLeft.style.backgroundColor = color;
        if (handleRight) handleRight.style.backgroundColor = color;

        console.log(`Node ${node.id} handle color set to: ${color}`);
      });
    };

    if (nodes.length > 0) {
      updateHandlesColor();
    }
  }, [nodes]);


  useEffect(() => {
    fetchData();
  }, []);



  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();
      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} Node` },
        ...nodeDefaults,
      };

      setNodes((nds) => [...nds, newNode]);

      try {
        await axios.post("/api/hvac-nodes", {
          label: `${type} Node`,
          x: position.x,
          y: position.y,
          bg: "#41d4a8",
          type,
        });

        toast.success("Node added successfully!");
        fetchData();
      } catch (error) {
        console.error("Error adding node:", error);
        toast.error("Error adding node. Please try again.");
        setNodes((nds) => nds.filter((node) => node.id !== newNode.id));
      }
    },
    [type]
  );

  const handleConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));

      axios
        .post("/api/hvac-edges", {
          source: params.source,
          target: params.target,
        })
        .then(() => {
          toast.success("Edge added successfully!");
        })
        .catch((error) => {
          console.error("Error adding edge:", error);
          toast.error("Error adding edge. Please try again.");
        });
    },
    [setEdges]
  );
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeDragStop = (event, node) => {
    const { id, position } = node;
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, position } : n)));
    axios
      .put(`/api/hvac-nodes/${id}`, position)
      .then(() => toast.success("Node position updated!"))
      .catch((error) => toast.error("Error updating node position."));
  };

  const deleteNode = async (id) => {
    try {
      await axios.delete(`/api/hvac-nodes/${id}`);
      setNodes((nds) => nds.filter((node) => node.id !== id));
      toast.success("Node deleted successfully!");
    } catch (error) {
      console.error("Error deleting node:", error);
      toast.error("Error deleting node. Please try again.");
    }
  };

  const deleteEdge = async (id) => {
    try {
      await axios.delete(`/api/hvac-edges/${id}`);
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      toast.success("Edge deleted successfully!");
    } catch (error) {
      console.error("Error deleting edge:", error);
      toast.error("Error deleting edge. Please try again.");
    }
  };

  const onEdgesDelete = (deletedEdges) => {
    deletedEdges.forEach((edge) => deleteEdge(edge.id));
  };

  const onNodesDelete = (deletedNodes) => {
    deletedNodes.forEach((node) => deleteNode(node.id));
  };

  const handleNodeClick = (event, node) => {
    setEditingNode(node);

    let labelText = node.data.label;

    if (React.isValidElement(labelText)) {
      labelText = labelText.props.children[0].props.children;
    }

    setNewLabel(labelText);
    console.log(labelText);
  };

  const handleLabelChange = (e) => {
    setNewLabel(e.target.value);
  };

  const handleSaveLabel = async () => {
    if (editingNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === editingNode.id
            ? { ...node, data: { label: newLabel } }
            : node
        )
      );

      try {
        await axios.put(
          `/api/label-hvac-nodes/${editingNode.id}`,
          {
            label: newLabel,
          }
        );
        toast.success("Label updated successfully!");
        window.location.reload();
        setEditingNode(null);
      } catch (error) {
        console.error("Error updating label:", error);
        toast.error("Error updating label.");
      }
    }
  };

  return (
    <div className="dndflow w-full">
      <div
        className="reactflow-wrapper w-full h-screen p-4"
        ref={reactFlowWrapper}
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{ backgroundColor: "#151c34" }}
      >
        <div className="w-full h-full rounded-lg overflow-hidden">

          <h1 className="text-white text-2xl font-bold p-4 bg-[#586f97]">
            Production Status
            <select
              className="ml-4 p-2 rounded bg-white text-black"
              onChange={handleChange}
            >
              <option value="/hvac">HVAC</option>
              <option value="/">BRS</option>
            </select>
          </h1>

          <hr className="border-t-2 border-[#182039]" />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeDragStop={onNodeDragStop}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            className="touch-flow"
            fitView
            style={{ backgroundColor: "#465e86" }}
            onNodeClick={handleNodeClick}
          >
            <Controls
              showZoom={true}
              showFitView={true}
              showInteractive={false}
              className="custom-controls"
            />
            <Background color="#aaa" gap={16} size={1} />
          </ReactFlow>
        </div>
      </div>

      {editingNode && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 p-6 bg-[#182039] text-white rounded-sm shadow-lg z-10 max-w-md">
          <h3 className="text-2xl font-semibold text-center text-white mb-4">
            Edit Node Label
          </h3>

          <input
            type="text"
            value={newLabel}
            onChange={handleLabelChange}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-200 mb-6"
            placeholder="Enter new label"
          />

          <div className="flex justify-between gap-4">
            <button
              onClick={handleSaveLabel}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Save
            </button>
            <button
              onClick={() => setEditingNode(null)}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DnDFlow;
