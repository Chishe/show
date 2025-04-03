import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function ProductionStatusCards({ type }) {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [lineNumber, setLineNumber] = useState("");
    const [partNumber, setPartNumber] = useState("");
    const [category, setCategory] = useState("");
    const [lineStatus, setLineStatus] = useState("");
    const [partNumbers, setPartNumbers] = useState([]);
    const [selectedData, setSelectedData] = useState({ part_number: "" })

    const apiEndpoint = type === "hvac" ? "production-status-hvac" : "production-status-brs";
    const editApiEndpoint = type === "hvac" ? "edit-production-hvac" : "edit-production-brs";
    useEffect(() => {
        fetch("http://192.168.1.100:4000/api/part-no")
            .then((res) => res.json())
            .then((data) => setPartNumbers(data))
            .catch((err) => console.error("Error fetching part numbers:", err));
    }, []);

    useEffect(() => {
        fetch(`http://192.168.1.100:4000/api/${apiEndpoint}`)
            .then((res) => res.json())
            .then((data) => setData(data.slice(0, 4)))
            .catch((err) => console.error("Error fetching data:", err));
    }, []);

    if (!data.length) return <p>Loading...</p>;

    type StatusType = "Normal" | "Warning" | "Critical";

    const bdColor = (status: StatusType): string => ({
        Normal: "border-[#41D4A8]",
        Warning: "border-[#F6D365]",
        Critical: "border-[#FF5672]",
    }[status] || "border-gray-500");

    const bgColor = (status: StatusType): string => ({
        Normal: "bg-[#41D4A8]",
        Warning: "bg-[#F6D365]",
        Critical: "bg-[#FF5672]",
    }[status] || "bg-gray-500");


    const handleUpdate = () => {
        const updatedData = {
            line_number: selectedData.line_number,
            part_number: selectedData.part_number,
            process_name: selectedData.process_name,
            category: selectedData.category,
            location: selectedData.location,
            operating_rate: selectedData.operating_rate,
            problem: selectedData.problem,
            line_status: selectedData.line_status,
            product: selectedData.product,
            action: selectedData.action,
            pic: selectedData.pic,
        };
        console.log(updatedData);

        fetch(`http://192.168.1.100:4000/api/${editApiEndpoint}/${selectedData.id}`, {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4">
            {data.map((item) => (
                <div
                    key={item.id}
                    className={`cursor-pointer text-white shadow-lg rounded-xl w-full border ${bdColor(item.line_status)}`}
                    onClick={() => {
                        setSelectedData(item);
                        setOpen(true);
                    }}
                >
                    <h2 className="text-lg font-bold bg-[#586F97] rounded-t-lg p-2 flex justify-between items-center">
                        <div className="flex items-center">
                            {item.process_name}
                        </div>
                        <span className={`${bgColor(item.line_status)} rounded-lg px-2`}>{item.line_status}</span>
                    </h2>
                    <hr className="border-t-2 border-[#182039]" />
                    <div className="bg-[#465E86] p-2 rounded-b-lg px-4">
                        <p className="flex justify-between"><span>Line No :</span> <span>{item.line_number || "N/A"}</span></p>
                        <p className="flex justify-between"><span>Part No :</span> <span>{item.part_number || "N/A"}</span></p>
                        <p className="flex justify-between"><span>Problem :</span> <span>{item.problem || "N/A"}</span></p>
                        <p className="flex justify-between"><span>Action :</span> <span>{item.action || "N/A"}</span></p>
                        <p className="flex justify-between"><span>P.I.C :</span> <span>{item.pic || "N/A"}</span></p>
                    </div>
                </div>
            ))}

            {selectedData && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className={`bg-[#182039] rounded-sm border-none`}>
                        <DialogHeader>
                            <DialogTitle className="text-white text-2xl">Production Status Log Form</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between space-x-4 w-full">
                                <div className="flex flex-col w-full">
                                    <label className="text-white">Line Number</label>
                                    <select
                                        className="bg-white p-1 rounded-sm w-full"
                                        value={selectedData.line_number || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, line_number: e.target.value })}
                                    >
                                        <option value="BRS Core 1">BRS Core 1</option>
                                        <option value="BRS Core 2">BRS Core 2</option>
                                        <option value="BRS Core 3">BRS Core 3</option>
                                        <option value="BRS Core 4">BRS Core 4</option>
                                        <option value="BRS Core 5">BRS Core 5</option>
                                        <option value="BRS Core 6">BRS Core 6</option>
                                    </select>
                                </div>

                                <div className="flex flex-col w-full">
                                    <label className="text-white">Part Number</label>
                                    <select
                                        className="bg-white p-1 rounded-sm w-full"
                                        value={selectedData.part_number || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, part_number: e.target.value })}
                                    >
                                        {partNumbers.map((part) => (
                                            <option key={part.id} value={part.part_number}>
                                                {part.part_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>



                            <label className="text-white">Process Name</label>
                            <input
                                className="text-white bg-[#212b4d] p-1 rounded-sm px-2"
                                value={selectedData.process_name || ""}
                                disabled
                            />

                            <div className="flex justify-between space-x-4 w-full">
                                <div className="flex flex-col w-full">
                                    <label className="text-white">Category</label>
                                    <select
                                        className="bg-white p-1 rounded-sm"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Safety">Safety</option>
                                        <option value="Quality">Quality</option>
                                    </select>
                                </div>
                                <div className="flex flex-col w-full">
                                    <label className="text-white">Line Status</label>
                                    <select
                                        className="bg-white p-1 rounded-sm"
                                        value={selectedData.line_status || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, line_status: e.target.value })}
                                    >
                                        <option value="Normal">Normal</option>
                                        <option value="Warning">Warning</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-between space-x-4 w-full">
                                <div className="flex flex-col w-full">
                                    <label htmlFor="location" className="text-white">Location</label>
                                    <input
                                        id="location"
                                        className="bg-white p-1 rounded-sm px-2"
                                        value={selectedData.location || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, location: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col w-full">
                                    <label htmlFor="product" className="text-white">Product</label>
                                    <input
                                        id="product"
                                        className="bg-white p-1 rounded-sm px-2"
                                        value={selectedData.product || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, product: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between space-x-4 w-full">
                                <div className="flex flex-col w-full">
                                    <label htmlFor="operatingRate" className="text-white">OR%</label>
                                    <input
                                        id="operatingRate"
                                        className="bg-white p-1 rounded-sm px-2"
                                        value={selectedData.operating_rate || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, operating_rate: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col w-full">
                                    <label htmlFor="problem" className="text-white">Problem</label>
                                    <input
                                        id="problem"
                                        className="bg-white p-1 rounded-sm px-2"
                                        value={selectedData.problem || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, problem: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between space-x-4 w-full">
                                <div className="flex flex-col w-full">
                                    <label htmlFor="action" className="text-white">Action</label>
                                    <input
                                        id="action"
                                        className="bg-white p-1 rounded-sm px-2"
                                        value={selectedData.action || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, action: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col w-full">
                                    <label htmlFor="pic" className="text-white">PIC</label>
                                    <input
                                        id="pic"
                                        className="bg-white p-1 rounded-sm px-2"
                                        value={selectedData.pic || ""}
                                        onChange={(e) => setSelectedData({ ...selectedData, pic: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row gap-4">
                            <button onClick={() => setOpen(false)} className="mt-4 w-full text-[#1890FF] py-2 rounded">Cancel</button>
                            <button onClick={handleUpdate} className="mt-4 w-full bg-[#1890FF] hover:bg-[#189FFF] text-white py-2 rounded">Submit</button>
                        </div>
                    </DialogContent>
                </Dialog>
            )
            }
        </div >
    );
}
