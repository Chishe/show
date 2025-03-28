"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FaCircleArrowRight } from "react-icons/fa6";
import { menuItems } from "./menuItems";

export default function Aside() {
  const [isOpen, setIsOpen] = useState(true);

  return (
<aside
  className={`bg-[rgb(59 130 246 / .5)] text-white flex flex-col transition-all duration-300 ${
    isOpen ? "w-62" : "w-20"
  } h-full min-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 scroll-smooth`}
>
      <ul
        className="mt-30 space-y-2 flex-grow overflow-y-auto 
               [&::-webkit-scrollbar]:w-1 
               [&::-webkit-scrollbar-track]:bg-gray-100 
               [&::-webkit-scrollbar-thumb]:bg-gray-300 
               dark:[&::-webkit-scrollbar-track]:bg-[#151c34] 
               dark:[&::-webkit-scrollbar-thumb]:bg-[#aeaeb7]"
      >
        {menuItems.map(({ icon, label, link }) => (
          <li
            key={label}
            className={`px-6 ${
              React.isValidElement(icon) && !icon.props.className
                ? "py-2"
                : "py-0"
            } hover:bg-gray-600 rounded`}
          >
            <Link href={link}>
              <div className="flex items-center gap-2">
                <span>{icon}</span>
                {isOpen && <span>{label}</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-[#002140] w-full h-12 flex justify-center items-center transition-transform duration-300"
      >
        <span className={`transform ${isOpen ? "rotate-180" : ""}`}>
          <FaCircleArrowRight size={18} />
        </span>
      </button>
    </aside>
  );
}
