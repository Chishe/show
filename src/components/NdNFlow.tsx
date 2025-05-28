import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import ReactFlow, {
  Connection,
  Edge,
  Node,
  addEdge,
  useEdgesState,
  Controls,
  Background,
  Position,
} from "react-flow-renderer";
import axios from "axios";
import { useDnD } from "@/components/DnDContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    backgroundColor: "#41d4a8",
    border: "none",
    borderRadius: "8px",
    width: "100px",
    height: "50px",
  },
};

const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedPage = event.target.value;
  window.location.href = selectedPage;
};


let id = 0;
const getId = () => `dndnode_${id++}`;
// interface DataType {
//   label?: string;
//   Or?: string | number;
//   Defect?: string | number;
// }
// const customNode = ({ data }: { data: DataType }) => (
//   <div
//     style={{
//       padding: "10px",
//       backgroundColor: "#fff",
//       borderRadius: "8px",
//       textAlign: "center",
//     }}
//   >
//     <div>
//       <strong>Label:</strong> {data?.label}
//     </div>
//     <div>
//       <strong>Or:</strong> {data?.Or}
//     </div>
//     <div>
//       <strong>Defect:</strong> {data?.Defect}
//     </div>
//   </div>
// );
interface ItemType {
  label: string;
  [key: string]: unknown;
}

interface NodeType {
  id: number | string;
  type: string;
  label?: string;
  Or?: string | number;
  Defect?: string | number;
  x: number;
  y: number;
  [key: string]: unknown;
}
interface EdgeType {
  id: string | number;
  source: string;
  target: string;
}
interface CustomNodeData {
  label?: React.ReactNode;
}

interface CustomNode extends Node<CustomNodeData> {
  handleRightColor?: string;
}

const DnDFlow = () => {
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { type } = useDnD();
  const [editingNode, setEditingNode] = React.useState<Node | null>(null);

  const [newLabel, setNewLabel] = React.useState<string>("");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CustomNode[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [nodesResponse, edgesResponse, valuesResponse] = await Promise.all([
        axios.get("/api/loaded-brs-nodes"),
        axios.get("/api/loaded-brs-edges"),
        axios.get("/api/status-stock"),
      ]);

      const valuesMap = valuesResponse.data.reduce(
        (acc: Record<string, ItemType>, item: ItemType) => {
          acc[item.label] = item;
          return acc;
        },
        {}
      );

      function transformLabel(label?: string): string | undefined {
        if (label) {
          const match = label.match(/^Core#(\d+)$/);
          if (match) {
            const num = Number(match[1]);
            if (num >= 1 && num <= 6) {
              return `core_${num}`;
            }
          }
        }
        return undefined;
      }


      const bgNodesResponses = await Promise.all(
        nodesResponse.data.map((node: NodeType) => {
          const tableName = transformLabel(node.label);

          return tableName
            ? axios
              .get(`/api/bg-nodes?nametableurl=${encodeURIComponent(tableName)}`)
              .catch((err) => {
                console.warn(`Skipping bg-node for ${node.label}:`, err.message);
                return { data: null };
              })
            : Promise.resolve({ data: null });
        })
      );


      type BgDataMap = Record<string, unknown>; // or `Record<string, object>` if you expect non-primitives

      const bgDataMap = nodesResponse.data.reduce((acc: BgDataMap, node: NodeType, index: number) => {
        if (node.label && bgNodesResponses[index]?.data) {
          acc[node.label] = bgNodesResponses[index].data;
        }
        return acc;
      }, {} as BgDataMap);
      

      setNodes(
        nodesResponse.data.map((node: NodeType) => {
          const nodeData = node.label ? valuesMap[node.label] || {} : {};
          const bgNodeData = node.label ? bgDataMap[node.label] : null;
          const orValue = (bgNodeData?.[0]?.or_percent ?? 0) + "%";
          let backgroundColor = "#41d4a8";
          let handleRightColor = "#41d4a8";

          if (nodeData.result !== undefined) {
            handleRightColor = nodeData.result === 0 ? "#00FF00" : "#DC143C";
          }

          const nodeColor = bgNodeData?.[0]?.node_color || null;
          if (nodeColor === "red") {
            backgroundColor = "#DC143C";
          } else if (nodeColor === "green") {
            backgroundColor = "#41d4a8";
          } else if (nodeColor === "yellow") {
            backgroundColor = "#FFD700";
          }

          return {
            id: node.id.toString(),
            type: node.type,
            data: {
              label:
                node.label?.toLowerCase() === "=conn" ? null : (
                  <div>
                    <div className="bg-[#4B0082] text-white rounded-t-sm mt-[-3px] w-full">
                      {node.label}
                    </div>
                    <div className="nowrap-text bg-emerald-200 rounded-b-sm w-full">
                      {orValue} | {node.Defect || 0}
                    </div>
                    <div className="hover-container mt-2">
                      <a
                        href={
                          node.label?.match(/^Core#\d+$/)
                            ? `http://192.168.1.106:4000/loss_${node.label.toLowerCase().replace('#', '_')}`
                            : "https://www.tsdmcd.com/dekidaka"
                        }
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
            handleRightColor,
          };
        })
      );

      setEdges(
        edgesResponse.data.map((edge: EdgeType) => ({
          id: edge.id.toString(),
          source: edge.source,
          target: edge.target,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading nodes or edges.");
    }
  }, [setEdges]);



  useEffect(() => {
    const updateHandlesColor = () => {
      const wrapper = reactFlowWrapper.current;
      if (!wrapper) return;

      nodes.forEach((node) => {
        if (!node.handleRightColor) return;

        const handleRight = wrapper.querySelector(
          `.react-flow__handle-right[data-nodeid="${node.id}"]`
        );

        if (handleRight) {
          (handleRight as HTMLElement).style.backgroundColor = node.handleRightColor;
        }
      });
    };

    if (nodes.length > 0) {
      updateHandlesColor();
    }
  }, [nodes]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!type) return;

      if (!reactFlowWrapper.current) return;

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
        await axios.post("/api/brs-nodes", {
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
    [type, fetchData]
  );

  const handleConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds));
  
      axios
        .post("/api/brs-edges", {
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
    [setEdges] // ✅ satisfies lint rule
  );
  

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeDragStop = (_event: React.MouseEvent | React.DragEvent, node: Node) => {
    const { id, position } = node;
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, position } : n)));

    axios
      .put(`/api/brs-nodes/${id}`, position)
      .then(() => toast.success("Node position updated!"))
      .catch(() => toast.error("Error updating node position."));
  };

  const deleteNode = async (id: string) => {
    try {
      await axios.delete(`/api/brs-nodes/${id}`);
      setNodes((nds) => nds.filter((node) => node.id !== id));
      toast.success("Node deleted successfully!");
    } catch (error) {
      console.error("Error deleting node:", error);
      toast.error("Error deleting node. Please try again.");
    }
  };

  const deleteEdge = async (id: string) => {
    try {
      await axios.delete(`/api/brs-edges/${id}`);
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      toast.success("Edge deleted successfully!");
    } catch (error) {
      console.error("Error deleting edge:", error);
      toast.error("Error deleting edge. Please try again.");
    }
  };

  const onEdgesDelete = (deletedEdges: Edge[]) => {
    deletedEdges.forEach((edge: Edge) => deleteEdge(edge.id));
  };

  const onNodesDelete = (deletedNodes: Node[]) => {
    deletedNodes.forEach((node: Node) => deleteNode(node.id));
  };

  const handleNodeClick = (
    _event: React.MouseEvent | React.PointerEvent,
    node: Node
  ) => {
    setEditingNode(node);

    let labelText = node.data.label;

    if (React.isValidElement(labelText)) {
      const reactElement = labelText as React.ReactElement<{ children?: React.ReactNode | React.ReactNode[] }>;
    
      if (
        reactElement.props &&
        Array.isArray(reactElement.props.children) &&
        reactElement.props.children.length > 0
      ) {
        const firstChild = reactElement.props.children[0];
    
        if (firstChild && React.isValidElement(firstChild)) {
          const firstChildElement = firstChild as React.ReactElement<{ children?: React.ReactNode }>;
    
          if (typeof firstChildElement.props.children === "string") {
            labelText = firstChildElement.props.children;
          } else {
            labelText = "";
          }
        } else {
          labelText = "";
        }
      } else {
        labelText = "";
      }
    }

    setNewLabel(labelText);
    console.log(labelText);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          `/api/label-brs-nodes/${editingNode.id}`,
          {
            label: newLabel,
          }
        );
        toast.success("Label updated successfully!");
        window.location.reload();
        setEditingNode(null);
        fetchData();
      } catch (error) {
        console.error("Error updating label:", error);
        toast.error("Error updating label.");
      }
    }
  };

  return (
    <div className="dndflow w-full min-h-screen flex">
      <div
        className="reactflow-wrapper w-full flex-grow p-4"
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
              <option value="/">BRS</option>
              <option value="/hvac">HVAC</option>
            </select>
          </h1>

          <hr className="border-t-2 border-[#182039]" />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            // onNodesChange={onNodesChange}
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

          <div className="flex justify-between gap-3">
            <button
              onClick={handleSaveLabel}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Save
            </button>
            <button
              onClick={() => {
                if (editingNode) {
                  deleteNode(editingNode.id);
                  setEditingNode(null);
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Delete
            </button>
            <button
              onClick={() => setEditingNode(null)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
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
