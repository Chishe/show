import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function QualityStatusCard({ type }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("Normal");

    const apiEndpoint = type === "hvac" ? "quality-hvac" : "quality-brs";
    const editApiEndpoint = type === "hvac" ? "edit-quality-hvac" : "edit-quality-brs";

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
            inline_defect: data.inline_defect,
            current_mp_skill: data.current_mp_skill,
            target_mp_skill: data.target_mp_skill,
            current_ll_patrol: data.current_ll_patrol,
            target_ll_patrol: data.target_ll_patrol,
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
                        <span className="rounded-full bg-[#2d29FF] px-2 mr-2">Q</span>
                        Quality
                    </div>
                    <span className={`${bgColor} rounded-lg px-2`}>{data.status}</span>
                </h2>

                <hr className="border-t-2 border-[#182039]" />
                <div className="bg-[#465E86] p-2 rounded-b-lg px-4">
                    <p className={`flex justify-between ${data.inline_defect > 0 ? "text-yellow-500" : ""}`}>
                        <span>Inline defect</span>
                        <span>{data.inline_defect} %</span>
                    </p>
                    <p className={`flex justify-between ${data.current_mp_skill > data.target_mp_skill ? "text-yellow-500" : ""}`}>
                        <span>MP Skill</span>
                        <span>{data.current_mp_skill}/{data.target_mp_skill}</span>
                    </p>
                    <p className={`flex justify-between ${data.current_ll_patrol > data.target_ll_patrol ? "text-yellow-500" : ""}`}>
                        <span>LL Patrol</span>
                        <span>{data.current_ll_patrol}/{data.target_ll_patrol}</span>
                    </p>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-[#182039] rounded-sm border-none">
                    <DialogHeader>
                        <DialogTitle className="text-white text-2xl">Quality Form</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="name" className="text-white">Name</label>
                        <input id="name" className="text-white bg-[#212b4d] p-1 rounded-sm px-2" value="Safety" disabled />

                        <label htmlFor="status" className="text-white"><span className="text-red-500">*</span> Status</label>
                        <select id="status" className="bg-white p-1 rounded-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Normal">Normal</option>
                            <option value="Warning">Warning</option>
                            <option value="Critical">Critical</option>
                        </select>

                        <label htmlFor="InlineDefect" className="text-white">Inline Defect</label>
                        <input
                            id="InlineDefect"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.inline_defect}
                            onChange={(e) => setData({ ...data, inline_defect: e.target.value })}
                        />

                        <label htmlFor="CurrentMPSkill" className="text-white">Current MP Skill</label>
                        <input
                            id="CurrentMPSkill"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.current_mp_skill}
                            onChange={(e) => setData({ ...data, current_mp_skill: e.target.value })}
                        />

                        <label htmlFor="TargetMPSkill" className="text-white">Target MP Skill</label>
                        <input
                            id="TargetMPSkill"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.target_mp_skill}
                            onChange={(e) => setData({ ...data, target_mp_skill: e.target.value })}
                        />

                        <label htmlFor="CurrentLLPatrol" className="text-white">Current LL Patrol</label>
                        <input
                            id="CurrentLLPatrol"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.current_ll_patrol}
                            onChange={(e) => setData({ ...data, current_ll_patrol: e.target.value })}
                        />
                        <label htmlFor="TargetLLPatrol" className="text-white">Target LL Patrol</label>
                        <input
                            id="TargetLLPatrol"
                            className="bg-white p-1 rounded-sm px-2"
                            value={data.target_ll_patrol}
                            onChange={(e) => setData({ ...data, target_ll_patrol: e.target.value })}
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
