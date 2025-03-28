"use client";

import React, { useState, useEffect } from "react";
import { FaUserSecret } from "react-icons/fa";

const ProcessComponent = () => {
  const processList = Array.from(
    { length: 7 },
    (_, index) => `Process-0${index + 1}`
  );
  const [inputValues, setInputValues] = useState(Array(7).fill(""));

  const stdCTList = [10, 12, 8, 15, 9, 14, 11];
  const [currentCTList, setCurrentCTList] = useState([9, 13, 7, 16, 8, 13, 12]);
  const [timeList, setTimeList] = useState(Array(7).fill("00:00:00"));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-GB");
      setTimeList(Array(7).fill(formattedTime));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const handleChange = (index, value) => {
    const newValues = [...inputValues];
    newValues[index] = value;
    setInputValues(newValues);
  };

  const greenCount = currentCTList.filter(
    (ct, index) => ct <= stdCTList[index]
  ).length;
  const lineBalancePercentage = (greenCount / 7) * 100;

  return (
    <div className="flex flex-col items-center bg-[#465e86] text-white p-4 relative">
      <div className="flex justify-end w-full mb-4">
        <div className="text-3xl font-bold">
          Line Balance:{" "}
          <span
            className={`p-1 rounded-lg ${
              lineBalancePercentage > 85
                ? "bg-green-600"
                : lineBalancePercentage > 65
                ? "bg-yellow-500"
                : "bg-red-600"
            } text-white`}
          >
            {lineBalancePercentage.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto">
        {processList.map((process, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 p-4 rounded-lg min-w-[180px]"
          >
            <div
              className={`w-12 h-12 border-2 border-white rounded-full ${
                currentCTList[index] > stdCTList[index]
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
            ></div>

            <div className="text-lg whitespace-nowrap">{process}</div>
            <div className="relative w-full">
              <input
                type="text"
                value={inputValues[index] || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                className="p-2 pr-10 border border-gray-400 rounded text-black bg-white w-full 
             disabled:opacity-100 disabled:cursor-not-allowed"
                disabled
              />
            </div>

            <FaUserSecret className="w-12 h-12 text-white" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4 w-full">
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          <div className="flex gap-4 overflow-x-auto whitespace-nowrap">
            {stdCTList.map((item, index) => (
              <div key={index} className="text-center w-full">
                <div className="font-bold">STD CT 0{index + 1}</div>
                <div>{formatTime(item)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-pink-500 text-white p-4 rounded-lg">
          <div className="flex gap-4 overflow-x-auto whitespace-nowrap">
            {currentCTList.map((item, index) => (
              <div key={index} className="text-center w-full">
                <div className="font-bold">Current CT 0{index + 1}</div>
                <div>{formatTime(item)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessComponent;
