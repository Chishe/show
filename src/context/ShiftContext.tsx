"use client";
import React, { createContext, useContext, useState } from "react";

type Shift = "All" | "☀️" | "🌙";

interface ShiftContextType {
  shiftState: Shift;
  toggleShift: () => void;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [shiftState, setShiftState] = useState<Shift>("☀️");

  const toggleShift = () => {
    setShiftState((prev) =>
      prev === "☀️" ? "🌙" : prev === "🌙" ? "All" : "☀️"
    );
  };

  return (
    <ShiftContext.Provider value={{ shiftState, toggleShift }}>
      {children}
    </ShiftContext.Provider>
  );
};

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (!context) throw new Error("useShift must be used within a ShiftProvider");
  return context;
};
