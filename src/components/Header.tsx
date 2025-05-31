"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { useShift } from "@/context/ShiftContext";
import { FaBell } from 'react-icons/fa';
export default function Header() {
  const pathname = usePathname();
  const { shiftState, toggleShift } = useShift();

  const getPageTitle = () => {
    switch (pathname) {
      case "/hvac":
        return "H-VAC";
      case "/operation":
        return "Operation";
      case "/loss_core_1":
        return "Dekidaka & Loss Monitoring Core#1";
      case "/loss_core_2":
        return "Dekidaka & Loss Monitoring Core#2";
      case "/loss_core_3":
        return "Dekidaka & Loss Monitoring Core#3";
      case "/loss_core_4":
        return "Dekidaka & Loss Monitoring Core#4";
      case "/loss_core_5":
        return "Dekidaka & Loss Monitoring Core#5";
      case "/loss_core_6":
        return "Dekidaka & Loss Monitoring Core#6";
      default:
        return "BRS";
    }
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
              <FaBell className="w-5 h-5 text-amber-500" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 border-2 border-gray-100 bg-gray-100 rounded-full text-sm font-semibold flex items-center justify-between gap-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Image
                src="/142379.jpg"
                alt="icon"
                width={20}
                height={20}
                className="w-5 h-5 rounded-full"
              />

            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
