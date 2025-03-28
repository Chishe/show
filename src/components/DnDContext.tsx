"use client";
import React, { createContext, useState, useContext } from "react";

interface DnDContextProps {
  type: string | null;
  setType: (type: string | null) => void;
}

const DnDContext = createContext<DnDContextProps | undefined>(undefined);

export const DnDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [type, setType] = useState<string | null>(null);

  return <DnDContext.Provider value={{ type, setType }}>{children}</DnDContext.Provider>;
};

export const useDnD = (): DnDContextProps => {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error("useDnD must be used within a DnDProvider");
  }
  return context;
};
