import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface EnergyStatusCardProps {
    type: "hvac" | "brs";
  }
  interface EnergyData {
    id: number;
    status: string;
    shipping_status: string;
    current_energy: number;
    target_energy: number;
    dekidaka: string;
  }
  
export default function EnergyStatusCard({ type }: EnergyStatusCardProps) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<EnergyData | null>(null);
    const [status, setStatus] = useState("Normal");
    const [shippingStatus, setShippingStatus] = useState("On Time");

    const apiEndpoint = type === "hvac" ? "energy-hvac" : "energy-brs";
    const editApiEndpoint = type === "hvac" ? "edit-energy-hvac" : "edit-energy-brs";

    useEffect(() => {
        fetch(`/api/${apiEndpoint}`)
            .then((res) => res.json())
            .then((data) => {
                setData(data[0]);
                setStatus(data[0].status);
                setShippingStatus(data[0].shipping_status);
                console.log(data[0]);
            })
            .catch((err) => console.error("Error fetching data:", err));
    }, [apiEndpoint]);

    if (!data) return <p>Loading...</p>;

    const bgColor = {
        Normal: "bg-[#41D4A8]",
        Warning: "bg-[#F6D365]",
        Critical: "bg-[#FF5672]",
    }[status];

    const handleUpdate = () => {
        const updatedData = {
            status,
            shipping_status: shippingStatus,
            current_energy: data.current_energy,
            target_energy: data.target_energy,
            dekidaka: data.dekidaka,
        };
        console.log(updatedData);

        fetch(`/api/${editApiEndpoint}/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === 'Delivery status updated successfully') {
                    toast.success("Delivery status updated successfully!");
                    setOpen(false);
                } else {
                    toast.error(data.message || "Failed to update delivery status.");
                }
            })
            .catch((err) => {
                console.error("Error updating data:", err);
                toast.error("Failed to update delivery status.");
            });
    };

    return (
        <>
            <div
                className="cursor-pointer text-white shadow-lg rounded-xl p-4 w-full"
                onClick={() => setOpen(true)}
            >
                <h2 className="text-lg font-bold bg-[#586F97] rounded-t-lg p-2 flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="rounded-full bg-[#2d29FF] px-2 mr-2">E</span>
                        Energy
                    </div>
                    <span className={`${bgColor} rounded-lg px-2`}>{data.status}</span>
                </h2>

                <hr className="border-t-2 border-[#182039]" />
                <div className="bg-[#465E86] p-2 rounded-b-lg">
                    <p className={`flex justify-between ${data.current_energy} > ${data.target_energy}  ? "text-yellow-500" : ""}`}>
                        <span>Energy Dekidaka   </span>
                        <span>{data.current_energy}/{data.current_energy}</span>
                    </p>
                    <p className={`flex justify-between ${data.dekidaka == "" ? "text-yellow-500" : ""}`}>
                        <span></span>
                        <span>{data.dekidaka}%</span>
                    </p>
                    <br></br>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-[#182039] rounded-sm border-none">
                    <DialogHeader>
                        <DialogTitle className="text-white text-2xl">Energy Form</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="name" className="text-white">Name</label>
                        <input id="name" className="text-white bg-[#212b4d] p-1 rounded-sm px-2" value="Energy" disabled />

                        <label htmlFor="status" className="text-white"><span className="text-red-500">*</span> Status</label>
                        <select id="status" className="bg-white p-1 rounded-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Normal">Normal</option>
                            <option value="Warning">Warning</option>
                            <option value="Critical">Critical</option>
                        </select>

                        <label htmlFor="CurrentEnergy" className="text-white">Current Energy</label>

                        <input
                            id="CurrentEnergy"
                            className="bg-white p-1 rounded-sm px-2"
                            type="number"
                            value={data.current_energy}
                            onChange={(e) => setData({ ...data, current_energy: parseInt(e.target.value) || 0 })}
                        />

                        <label htmlFor="TargetEnergy" className="text-white">Target Energy</label>
                        <input
                            id="TargetEnergy"
                            className="bg-white p-1 rounded-sm px-2"
                            type="number"
                            value={data.target_energy}
                            onChange={(e) => setData({ ...data, target_energy: parseInt(e.target.value) || 0 })}
                        />
                        <label htmlFor="Dekidaka" className="text-white">
                            <span className="text-red-500">*</span> Dekidaka
                        </label>
                        <input
                            id="Dekidaka"
                            className="bg-white p-1 rounded-sm px-2"
                            type="text"
                            value={data.dekidaka}
                            onChange={(e) => setData({ ...data, dekidaka: e.target.value })}
                        />


                    </div>

                    <div className="flex flex-row gap-4">
                        <button onClick={() => setOpen(false)} className="mt-4 w-full text-[#1890FF] py-2 rounded">
                            Cancel
                        </button>
                        <button onClick={handleUpdate} className="mt-4 w-full bg-[#1890FF] hover:bg-[#189FFF] text-white py-2 rounded">
                            Submit
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
