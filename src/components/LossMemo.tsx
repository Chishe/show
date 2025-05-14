import React from "react";

interface LossMemoItem {
  itemNo: number;
  situation: string;
  problemType: string;
  factor: string;
  partNo: string;
  details: string;
  action: string;
  pic: string;
  due: string;
  status: string;
  effectiveLot: string;
}

const sampleData: LossMemoItem[] = [
  {
    itemNo: 1,
    situation: "Abnormal",
    problemType: "Quality",
    factor: "Part Dim",
    partNo: "TGXXXXX-XXXXX",
    details: "Tank H. NG",
    action: "Die Fix",
    pic: "JMD",
    due: "DD/MM/YYYY:HH:MM",
    status: "Pending",
    effectiveLot: "Lot ID",
  },
  {
    itemNo: 2,
    situation: "KAIZEN",
    problemType: "Cost",
    factor: "-",
    partNo: "-",
    details: "Improve Jig",
    action: "Imporovement",
    pic: "PE",
    due: "DD/MM/YYYY:HH:MM",
    status: "Finnish",
    effectiveLot: "Lot ID",
  },
];

const LossMemo: React.FC = () => {
  const getColorClass = (field: string, value: string) => {
    switch (field) {
      case "situation":
        if (value === "Abnormal") return "bg-red-500 text-white rounded-lg";
        if (value === "KAIZEN") return "bg-green-500 text-white rounded-lg";
        break;
      case "problemType":
        if (value === "Quality") return "bg-red-500 text-white rounded-lg";
        if (value === "Cost") return "bg-green-500 text-white rounded-lg";
        break;
      case "factor":
        if (value === "Part Dim") return "bg-red-500 text-white rounded-lg";
        break;
      case "status":
        if (value === "Pending") return "bg-yellow-400 text-black rounded-lg";
        if (value === "Finnish") return "bg-green-500 text-white rounded-lg";
        break;
    }
    return "px-2 py-1"; // default padding
  };

  return (
    <div className="w-full bg-[#100C2A] py-4">
      <div className="overflow-x-auto max-h-[80vh] w-full p-4">
        <table className="w-full table-auto border-collapse text-xs text-center">
          <thead>
            <tr className="bg-[#465e86] text-white">
              <th className="px-4 py-2 border">Item No</th>
              <th className="px-4 py-2 border">Situation</th>
              <th className="px-4 py-2 border">Problem Type</th>
              <th className="px-4 py-2 border">Factor</th>
              <th className="px-4 py-2 border">P/No</th>
              <th className="px-4 py-2 border">Details</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">PIC</th>
              <th className="px-4 py-2 border">Due</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Effective Lot</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 py-4 border">
                  No data
                </td>
              </tr>
            ) : (
              sampleData.map((item) => (
                <tr key={item.itemNo} className="text-center text-white">
                  <td className="px-4 py-2 border">{item.itemNo}</td>
                  <td className={`border ${getColorClass("situation", item.situation)}`}>
                    {item.situation}
                  </td>
                  <td className={`border ${getColorClass("problemType", item.problemType)}`}>
                    {item.problemType}
                  </td>
                  <td className={`border ${getColorClass("factor", item.factor)}`}>
                    {item.factor}
                  </td>
                  <td className="px-2 py-1 border">{item.partNo}</td>
                  <td className="px-2 py-1 border">{item.details}</td>
                  <td className="px-2 py-1 border">{item.action}</td>
                  <td className="px-2 py-1 border">{item.pic}</td>
                  <td className="px-2 py-1 border">{item.due}</td>
                  <td className={`border ${getColorClass("status", item.status)}`}>
                    {item.status}
                  </td>
                  <td className="px-2 py-1 border">{item.effectiveLot}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LossMemo;
