"use client";
import React, { useState, useEffect } from "react";
import { GiCardboardBox } from "react-icons/gi";
import axios from "axios";

const TIME_SLOTS = [
    '19:35-20:30',
    '20:30-21:30',
    '21:40-22:30',
    '22:30-23:30',
    '23:30-00:30',  // เพิ่มบรรทัดนี้
    '00:30-01:30',
    '01:30-02:30',
    '02:40-03:30',
    '03:30-04:30',
    '04:50-05:50',
    '05:50-06:50'
];

type timeslots = {
    [key: string]: {
        target: (number | null)[];
        actual: (number | null)[];
    };
};

type RawRow = {
    seq: number;
    partnumber: string;
    target: number;
    actual: number;
    partdimension: string;
    firstpiece: string;
    machinestatus: string;
    componentstatus: string;
    timeslots: timeslots;
};

type Row = Omit<
    RawRow,
    "partdimension" | "firstpiece" | "machinestatus" | "componentstatus"
> & {
    partdimension: React.ReactNode;
    firstpiece: React.ReactNode;
    machinestatus: React.ReactNode;
    componentstatus: React.ReactNode;
};

const getCellBgColor = (targetVal: number | null, actualVal: number | null) => {
    if (actualVal === null) return "";
  
    if (targetVal === null || targetVal === 0) return "#41D4A8";
  
    if (actualVal === 0) return "#F44336";          // แดง
    if (actualVal >= targetVal) return "#41D4A8";   // เขียว
    if (actualVal < targetVal) return "#FCC21B";    // เหลือง
  
    return "";
  };
  
  

const renderStatusDot = (status: string) => {
    let color = "#9ca3af";
    let tooltip = "Unknown";

    if (status === "OK") {
        color = "#41D4A8";
        tooltip = "Status: OK";
    } else if (status === "NG") {
        color = "#F44336";
        tooltip = "Status: NG";
    } else if (status === "WAIT") {
        color = "#FCC21B";
        tooltip = "Status: Waiting";
    }

    return (
        <div
            className="mx-auto w-6 h-6 rounded-full cursor-pointer"
            style={{ backgroundColor: color }}
            title={tooltip}
            onClick={() => alert(`Status clicked: ${status}`)}
        />
    );
};
const statusOptions = ["OK", "NG", "WAIT"];

const renderStatusDropdown = (
    currentValue: string,
    onChange: (newValue: string) => void
) => {
    return (
        <select
            className="bg-[#100C2A] text-white text-xs p-1 rounded border border-gray-600"
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
        >
            {statusOptions.map((status) => (
                <option key={status} value={status}>
                    {status}
                </option>
            ))}
        </select>
    );
};
type PlanTableProps = {
    nametableurl: string;
    dateTime: string;
};
export default function PlanTable({ nametableurl, dateTime }: PlanTableProps) {
    const [rows, setRows] = useState<Row[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!dateTime || !nametableurl) return;

            axios
                .get(
                    `/api/planTableData-b?nametableurl=${encodeURIComponent(
                        nametableurl
                    )}&date=${encodeURIComponent(dateTime)}`
                )
                .then((res) => {
                    const rawData: RawRow[] = res.data;

                    const withIcons: Row[] = rawData.map((row) => ({
                        ...row,
                        partdimension: row.partdimension,
                        firstpiece: row.firstpiece,
                        machinestatus: row.machinestatus,
                        componentstatus: row.componentstatus,
                    }));

                    setRows(withIcons);
                });
        }, 1000);

        return () => clearInterval(interval);
    }, [dateTime, nametableurl]);


    const updateTimeSlotValue = (
        seq: number,
        timeSlot: string,
        type: "target" | "actual",
        index: number,
        value: number | null
    ) => {
        setRows((rows) =>
            rows.map((row) => {
                if (row.seq !== seq) return row;

                const slotData = row.timeslots[timeSlot];
                if (!slotData) return row;

                return {
                    ...row,
                    timeslots: {
                        ...row.timeslots,
                        [timeSlot]: {
                            ...slotData,
                            [type]: slotData[type].map((v, i) => (i === index ? value : v)),
                        },
                    },
                };
            })
        );
    };
    const [popupData, setPopupData] = useState<{
        isOpen: boolean;
        seq: number;
        slot: string;
        index: number;
        type: "target" | "actual";
        value: number | null;
    } | null>(null);

    const handleStatusChange = (
        seq: number,
        field: "partdimension" | "firstpiece" | "machinestatus" | "componentstatus",
        newValue: string
    ) => {
        console.log("📤 Sending to API:", {
            seq,
            field,
            value: newValue,
        });

        setRows((prevRows) =>
            prevRows.map((row) =>
                row.seq === seq ? { ...row, [field]: newValue } : row
            )
        );

        axios
            .post(`/api/update-status?table=${nametableurl}`, {
                seq,
                field,
                value: newValue,
            })
            .catch((err) => {
                console.error("❌ API Error:", err);
            });
    };

    return (
        <div className="w-full bg-[#100C2A] py-4 rounded-lg">
            <div className="overflow-x-auto max-h-[80vh] w-full p-4">
                <table className="w-full table-auto border-collapse text-xs">
                    <thead>
                        <tr className="bg-[#465e86] text-white text-xs text-center">
                            <th className="p-2 border border-white sticky left-0 z-10 bg-[#465e86]">
                                Seq
                            </th>
                            <th className="p-2 border border-white sticky left-[3px] z-10 bg-[#465e86]">
                                P/N
                            </th>
                            <th className="p-2 border whitespace-nowrap">Part Dimension</th>
                            <th className="p-2 border whitespace-nowrap">Component Status</th>
                            <th className="p-2 border whitespace-nowrap">M/C Status</th>
                            <th className="p-2 border whitespace-nowrap">1st Piece</th>

                            <th className="p-2 border whitespace-nowrap"></th>
                            <th className="p-2 border whitespace-nowrap">Qty</th>
                            {TIME_SLOTS.map((slot) => (
                                <th
                                    key={slot}
                                    colSpan={
                                        ["21:40-22:30", "02:40-03:30"].includes(slot) ? 5 : 6
                                    }
                                    className="p-2 border text-xs text-center whitespace-nowrap"
                                >
                                    {slot}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-center w-full">
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8 + TIME_SLOTS.length * 6}
                                    className="text-white text-center py-10 relative"
                                >
                                    <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                                        <GiCardboardBox size={32} />
                                        <span>No data</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => (
                                <React.Fragment key={row.seq}>
                                    <tr className="text-white">
                                        <td
                                            className="p-2 border sticky left-0 z-10 bg-[#100C2A]"
                                            rowSpan={2}
                                        >
                                            {index + 1}
                                        </td>
                                        <td
                                            className="p-2 border sticky left-[3px] z-10 bg-[#100C2A]"
                                            rowSpan={2}
                                        >
                                            {row.partnumber}
                                        </td>
                                        <td className="p-2 border" rowSpan={2}>
                                            <div className="flex items-center gap-2 justify-center">
                                                {renderStatusDot(row.partdimension as string)}
                                                {renderStatusDropdown(
                                                    row.partdimension as string,
                                                    (newVal) =>
                                                        handleStatusChange(row.seq, "partdimension", newVal)
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2 border" rowSpan={2}>
                                            <div className="flex items-center gap-2 justify-center">
                                                {renderStatusDot(row.componentstatus as string)}
                                                {renderStatusDropdown(
                                                    row.componentstatus as string,
                                                    (newVal) =>
                                                        handleStatusChange(
                                                            row.seq,
                                                            "componentstatus",
                                                            newVal
                                                        )
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2 border" rowSpan={2}>
                                            <div className="flex items-center gap-2 justify-center">
                                                {renderStatusDot(row.machinestatus as string)}
                                                {renderStatusDropdown(
                                                    row.machinestatus as string,
                                                    (newVal) =>
                                                        handleStatusChange(row.seq, "machinestatus", newVal)
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2 border" rowSpan={2}>
                                            <div className="flex items-center gap-2 justify-center">
                                                {renderStatusDot(row.firstpiece as string)}
                                                {renderStatusDropdown(
                                                    row.firstpiece as string,
                                                    (newVal) =>
                                                        handleStatusChange(row.seq, "firstpiece", newVal)
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-2 border whitespace-nowrap">Target</td>
                                        <td className="p-2 border whitespace-nowrap">
                                            {row.timeslots &&
                                                Object.values(row.timeslots).reduce((total, slot) => {
                                                    if (!slot || !Array.isArray(slot.target))
                                                        return total;

                                                    const sumTarget = slot.target.reduce(
                                                        (sum: number, val: number | null) =>
                                                            sum + (val ?? 0),
                                                        0
                                                    );

                                                    return total + sumTarget;
                                                }, 0)}
                                        </td>
                                        {row.timeslots &&
                                            Object.entries(row.timeslots).map(([slot, values]) => {
                                                const targets = values.target || [];
                                                const mustHaveFive = [
                                                    "21:40-22:30",
                                                    "02:40-03:30",
                                                ].includes(slot);
                                                const paddedTargets = [...targets];

                                                if (mustHaveFive) {
                                                    while (paddedTargets.length < 5) {
                                                        paddedTargets.push(null);
                                                    }
                                                } else {
                                                    paddedTargets.length = 6;
                                                }

                                                return paddedTargets.map((val, i) => {
                                                    const isNull = val === null;
                                                    const bgColor = isNull ? "" : "bg-[#e0e0e0a2]";
                                                    return (
                                                        <td
                                                            key={`${slot}-target-${i}`}
                                                            className={`p-1 border whitespace-nowrap ${bgColor}`}
                                                        >
                                                            <div
                                                                className="w-full text-xs text-center cursor-pointer p-2"
                                                                onClick={() =>
                                                                    setPopupData({
                                                                        isOpen: true,
                                                                        seq: row.seq,
                                                                        slot,
                                                                        index: i,
                                                                        type: "target",
                                                                        value: val,
                                                                    })
                                                                }
                                                            >
                                                                {val !== null ? val : ""}
                                                            </div>
                                                        </td>
                                                    );
                                                });
                                            })}
                                    </tr>

                                    <tr className="text-white">
                                        <td className="p-2 border whitespace-nowrap">Actual</td>

                                        <td className="p-2 border whitespace-nowrap">
                                            {row.timeslots &&
                                                Object.values(row.timeslots).reduce((total, slot) => {
                                                    if (!slot || !Array.isArray(slot.actual))
                                                        return total;

                                                    const sumActual = slot.actual.reduce(
                                                        (sum: number, val: number | null) =>
                                                            sum + (val ?? 0),
                                                        0
                                                    );

                                                    return total + sumActual;
                                                }, 0)}
                                        </td>
                                        {row.timeslots &&
                                            Object.entries(row.timeslots).map(([slot, values]) => {
                                                const actuals = values.actual || [];
                                                const targets = values.target || [];
                                                const mustHaveFive = [
                                                    "21:40-22:30",
                                                    "02:40-03:30",
                                                ].includes(slot);

                                                const paddedActuals = [...actuals];
                                                const paddedTargets = [...targets];

                                                if (mustHaveFive) {
                                                    while (paddedActuals.length < 5)
                                                        paddedActuals.push(null);
                                                    while (paddedTargets.length < 5)
                                                        paddedTargets.push(null);
                                                } else {
                                                    paddedActuals.length = 6;
                                                    paddedTargets.length = 6;
                                                }

                                                return paddedActuals.map((val, i) => {
                                                    const actualVal = paddedActuals[i];
                                                    const targetVal = paddedTargets[i];
                                                    const bgColor = getCellBgColor(targetVal, actualVal);

                                                    return (
                                                        <td
                                                            key={`${slot}-actual-${i}`}
                                                            className="p-1 border whitespace-nowrap"
                                                            style={{ backgroundColor: bgColor || undefined }}
                                                        >
                                                            <div
                                                                className="w-full text-xs text-center cursor-pointer p-2"
                                                                onClick={() =>
                                                                    setPopupData({
                                                                        isOpen: true,
                                                                        seq: row.seq,
                                                                        slot,
                                                                        index: i,
                                                                        type: "actual",
                                                                        value: val,
                                                                    })
                                                                }
                                                            >
                                                                {val ?? ""}
                                                            </div>
                                                        </td>
                                                    );
                                                });
                                            })}
                                    </tr>
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
                {popupData?.isOpen && (
                    <div className="fixed inset-0 flex justify-center items-center z-50 text-white">
                        <div className="bg-[#182039] p-6 rounded shadow-md w-80">
                            <h2 className="text-lg font-semibold text-center mb-4">
                                Edit {popupData.type.toUpperCase()}
                            </h2>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const inputEl = e.currentTarget.elements.namedItem(
                                        "qty"
                                    ) as HTMLInputElement;
                                    const newValue =
                                        inputEl.value.trim() === ""
                                            ? null
                                            : parseInt(inputEl.value.trim(), 10);

                                    console.log("Submit popupData:", popupData);
                                    console.log("New Value:", newValue);

                                    updateTimeSlotValue(
                                        popupData.seq,
                                        popupData.slot,
                                        popupData.type,
                                        popupData.index,
                                        newValue
                                    );

                                    await axios.post(`/api/update-timeslot?table=${nametableurl}`, {
                                        seq: popupData.seq,
                                        slot: popupData.slot,
                                        index: popupData.index,
                                        type: popupData.type,
                                        value: newValue,
                                    });

                                    setPopupData(null);
                                }}
                            >
                                <input
                                    name="qty"
                                    type="number"
                                    defaultValue={popupData.value ?? ""}
                                    className="w-full border rounded px-3 py-2 mb-4"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setPopupData(null)}
                                        className="px-4 py-2 text-[#1890ff] rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-1 rounded"
                                    >
                                        Submith
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
