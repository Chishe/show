import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CostStatusCard({ type }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("Normal");

    const apiEndpoint = type === "hvac" ? "cost-hvac" : "cost-brs";
    const editApiEndpoint = type === "hvac" ? "edit-cost-hvac" : "edit-cost-brs";

    useEffect(() => {
        fetch(`http://192.168.1.100:4000/api/${apiEndpoint}`)
            .then((res) => res.json())
            .then((data) => {
                setData(data[0]);
                setStatus(data[0].status);
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
            current_productivity: data.current_productivity,
            target_productivity: data.target_productivity,
            manhours: data.manhours,
            overtime: data.overtime,
            expense: data.expense,
        };
        console.log(updatedData);

        fetch(`http://192.168.1.100:4000/api/${editApiEndpoint}/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === 'Safety status updated successfully') {
                    toast.success("Safety status updated successfully!");
                    setOpen(false);
                } else {
                    toast.error(data.message || "Failed to update safety status.");
                }
            })
            .catch((err) => {
                console.error("Error updating data:", err);
                toast.error("Failed to update safety status.");
            });
    };

    return (
        <>
            <div
                className="cursor-pointer text-white shadow-lg rounded-xl w-full p-4"
                onClick={() => setOpen(true)}
            >
                <h2 className="text-lg font-bold bg-[#586F97] rounded-t-lg p-2 flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="rounded-full bg-[#2d29FF] px-2 mr-2">C</span>
                        Cost
                    </div>
                    <span className={`${bgColor} rounded-lg px-2`}>{data.status}</span>
                </h2>

                <hr className="border-t-2 border-[#182039]" />
                <div className="bg-[#465E86] p-2 rounded-b-lg px-4">
                    <p className={`flex justify-between ${data.manhours < data.overtime ? "text-yellow-500" : ""}`}>
                        <span>Productivity</span>
                        <span>{data.manhours}%</span>
                    </p>
                    <p className={`flex justify-between ${data.manhours < data.overtime ? "text-yellow-500" : ""}`}>
                        <span>MH and OT</span>
                        <span>{data.manhours}/{data.overtime}</span>
                    </p>
                    <p className={`flex justify-between ${data.expense < 0 ? "text-yellow-500" : ""}`}>
                        <span>Expense</span>
                        <span>{data.expense}%</span>
                    </p>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-[#182039] rounded-sm border-none">
                    <DialogHeader>
                        <DialogTitle className="text-white text-2xl">Cost Form</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="name" className="text-white">Name</label>
                        <input id="name" className="text-white bg-[#212b4d] p-1 rounded-sm px-2" value="Cost" disabled />

                        <label htmlFor="status" className="text-white"><span className="text-red-500">*</span> Status</label>
                        <select id="status" className="bg-white p-1 rounded-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Normal">Normal</option>
                            <option value="Warning">Warning</option>
                            <option value="Critical">Critical</option>
                        </select>

                        <label htmlFor="CurrentProductivity" className="text-white">Current Productivity</label>
                        <input
                            id="CurrentProductivity"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.current_productivity}
                            onChange={(e) => setData({ ...data, current_productivity: e.target.value })}
                        />

                        <label htmlFor="TargetProductivity" className="text-white">Target Productivity</label>
                        <input
                            id="TargetProductivity"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.target_productivity}
                            onChange={(e) => setData({ ...data, target_productivity: e.target.value })}
                        />

                        <label htmlFor="Manhours" className="text-white">Manhours</label>
                        <input
                            id="Manhours"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.manhours}
                            onChange={(e) => setData({ ...data, manhours: e.target.value })}
                        />

                        <label htmlFor="Overtime" className="text-white">Overtime</label>
                        <input
                            id="Overtime"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.overtime}
                            onChange={(e) => setData({ ...data, overtime: e.target.value })}
                        />
                        <label htmlFor="Expense" className="text-white">Expense</label>
                        <input
                            id="Expense"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.expense}
                            onChange={(e) => setData({ ...data, expense: e.target.value })}
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
