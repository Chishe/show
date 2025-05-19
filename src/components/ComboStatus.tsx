import React, { useEffect, useState } from "react";
import { GiCardboardBox } from "react-icons/gi";
interface CardData {
  title: string;
  value: string;
  additional?: string;
}

const ComboStatus = () => {
  const [data, setData] = useState<CardData[]>([]);

  useEffect(() => {
    fetch("/api/carddata")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data: CardData[]) => {
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  if (data.length === 0)
    return (
      <div className="relative z-10 flex flex-col items-center justify-center gap-2">
        <GiCardboardBox size={32} />
        <span>No data</span>
      </div>
    );

  return (
    <div className="w-full bg-[#100C2A] py-4 rounded-lg">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {data.map((item, index) => {
          const [currentValue, targetValue] = item.value
            .split("/")
            .map((val) => parseFloat(val));

          const valueColor = currentValue < targetValue ? "red" : "white";
          const additionalStyle = item.additional
            ? {
                color: "black",
                padding: "5px",
                backgroundColor: "yellow",
                borderRadius: "4px",
              }
            : {};

          return (
            <div
              key={index}
              style={{
                backgroundColor: "#808080",
                border: "1px solid white",
                borderRadius: "8px",
                padding: "20px",
                width: "250px",
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ fontWeight: "bold" }}>{item.title}</h3>
              <p style={{ color: valueColor, fontWeight: "bold" }}>
                {item.value}
              </p>
              {item.additional && (
                <p style={additionalStyle}>{item.additional}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComboStatus;
