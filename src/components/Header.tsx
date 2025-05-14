"use client";

import { useState } from "react";
import { usePathname } from "next/navigation"; // ✅ นำเข้า usePathname
import Image from "next/image";

export default function Header() {
  const [shiftState, setShiftState] = useState<"All" | "☀️" | "🌙">("☀️");
  const pathname = usePathname(); // ✅ ใช้ usePathname ได้แล้ว

  const getPageTitle = () => {
    switch (pathname) {
      case "/brs":
        return "BRS";
      case "/hvac":
        return "H-VAC";
      case "/operation":
        return "Operation";
        case "/loss":
          return "Dekidaka & Loss Monitoring";
      default:
        return "Home";
    }
  };

  const toggleShift = () => {
    setShiftState((prevState) => {
      if (prevState === "☀️") return "🌙";
      if (prevState === "🌙") return "All";
      return "☀️";
    });
  };

  return (
    <header className="bg-white text-black p-7 px-12.5 fixed top-0 left-0 w-full z-50">
      <div className="flex flex-row items-center justify-between w-full md:p-0">
        <div className="flex items-center gap-8">
          <div className="h-12 w-36 lg:w-48 lg:h-10">
            <Image
              src="/logo-iw9kW_RC.png"
              alt="Company Logo"
              layout="responsive"
              width={192}
              height={40}
              className="w-full h-full"
            />
          </div>
          <h1 className="hidden text-base font-extrabold lg:text-2xl md:block text-[#343C6A]">
            Command Desk - {getPageTitle()}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {/* Toggle button */}
            <button
              type="button"
              onClick={toggleShift}
              className="px-4 py-2 border-2 border-gray-100 bg-gray-100 rounded-lg text-sm font-semibold flex items-center justify-between gap-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>Shift:</span>
              <span>{shiftState}</span>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 border-2 border-gray-100 bg-gray-100 rounded-full text-sm font-semibold flex items-center justify-between gap-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              👇
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 border-2 border-gray-100 bg-gray-100 rounded-full text-sm font-semibold flex items-center justify-between gap-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              😈
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
