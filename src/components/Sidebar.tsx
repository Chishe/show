import { FaFileUpload, FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";  // Import toastify styles
import { useState, useEffect } from "react";
import axios from "axios";
import { useDnD } from "./DnDContext";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const NodesForm = ({ closeModal }) => {
  const [nodes, setNodes] = useState([]);
  const [formData, setFormData] = useState({ label: "", value: "", min: "", max: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const response = await axios.get("http://192.168.1.100:4000/api/hvac-values");
      setNodes(response.data);
    } catch (error) {
      console.error("Error fetching nodes:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valueNum = parseFloat(formData.value);
    const minNum = parseFloat(formData.min);
    const maxNum = parseFloat(formData.max);

    if (isNaN(valueNum) || isNaN(minNum) || isNaN(maxNum)) {
      console.error("Invalid numeric values:", {
        value: formData.value,
        min: formData.min,
        max: formData.max,
      });
      alert("Please ensure all numeric fields (value, min, max) are valid numbers.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('label', formData.label);
    formDataToSend.append('value', valueNum.toString());
    formDataToSend.append('min', minNum.toString());
    formDataToSend.append('max', maxNum.toString());

    try {
      if (editId) {
        await axios.put(`http://192.168.1.100:4000/api/form/${editId}`, formDataToSend);
        toast.success("Node updated successfully!");
      } else {
        await axios.post("http://192.168.1.100:4000/api/form", formDataToSend);
        toast.success("Node added successfully!");
      }

      fetchNodes();
      setEditId(null);
      setFormData({ label: "", value: "", min: "", max: "" });
    } catch (error) {
      console.error("Error saving node:", error);
      toast.error("Failed to save node!");
    }
  };

  const handleEdit = (node) => {
    setFormData(node);
    setEditId(node.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this node?")) {
      try {
        await axios.delete(`http://192.168.1.100:4000/api/form-del/${id}`);
        toast.success("Node deleted successfully!");
        fetchNodes();
      } catch (error) {
        console.error("Error deleting node:", error);
        toast.error("Failed to delete node!");
      }
    }
  };

  return (
    <div className="p-4">
      <Dialog open={true} onOpenChange={closeModal}>
        <DialogContent className="bg-[#182039] border-none text-white rounded-lg p-6 max-w-4xl w-full text-center">
          <DialogTitle>Manage Nodes</DialogTitle>
          <div className="overflow-y-auto max-h-[200px]
               [&::-webkit-scrollbar]:w-1 
               [&::-webkit-scrollbar-track]:bg-gray-100 
               [&::-webkit-scrollbar-thumb]:bg-gray-300 
               dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
               dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]">
            <table className="w-full mt-4 border">
              <thead className="sticky top-0 bg-indigo-200 text-black">
                <tr>
                  <th className="border p-2">Label</th>
                  <th className="border p-2">Value</th>
                  <th className="border p-2">Min</th>
                  <th className="border p-2">Max</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.id} className="border">
                    <td className="border p-2">{node.label}</td>
                    <td className="border p-2">{node.value}</td>
                    <td className="border p-2">{node.min}</td>
                    <td className="border p-2">{node.max}</td>
                    <td className="border p-2 flex space-x-2 justify-center">
                      <button onClick={() => handleEdit(node)} className="bg-yellow-500 text-white p-2 rounded">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(node.id)} className="bg-red-500 text-white p-2 rounded">
                        <MdDeleteForever />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <form onSubmit={handleSubmit} className="mt-4">
            <input type="text" name="label" value={formData.label} onChange={handleInputChange} placeholder="Label" className="w-full p-2 border mb-2" required />
            <input type="number" name="value" value={formData.value} onChange={handleInputChange} placeholder="Value" className="w-full p-2 border mb-2" required />
            <input type="number" name="min" value={formData.min} onChange={handleInputChange} placeholder="Min" className="w-full p-2 border mb-2" required />
            <input type="number" name="max" value={formData.max} onChange={handleInputChange} placeholder="Max" className="w-full p-2 border mb-2" required />
            <div className="flex justify-end">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                <FaFileUpload className="inline mr-2" />
                Save
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

const Sidebar = () => {
  const { setType } = useDnD();
  const [open, setOpen] = useState(false);

  const onDragStart = (event: React.DragEvent, type: string) => {
    setType(type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="sidebar w-full">
      <div
        className="node cursor-pointer p-2 mb-2 bg-[#41d4a8] rounded-md hover:bg-[#36b093] mt-45"
        draggable
        onDragStart={(event) => onDragStart(event, "input")}
      >
        Input Node
      </div>

      <div
        className="node cursor-pointer p-2 mb-2 bg-[#41d4a8] rounded-md hover:bg-[#36b093]"
        draggable
        onDragStart={(event) => onDragStart(event, "output")}
      >
        Output Node
      </div>

      <div
        className="node cursor-pointer p-2 mb-2 bg-[#41d4a8] rounded-md hover:bg-[#36b093]"
        draggable
        onDragStart={(event) => onDragStart(event, "default")}
      >
        Default Node
      </div>
      <button
        className="bg-indigo-500 hover:bg-indigo-900 text-white px-4 py-2 rounded w-full"
        onClick={() => setOpen(true)}
      >
        Manage Nodes
      </button>

      {open && <NodesForm closeModal={() => setOpen(false)} />}

      <Link href="/operation">
        <div className="bg-red-500 hover:bg-red-900 text-white x-4 py-2 rounded w-full text-center mt-2">
          Operation
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
