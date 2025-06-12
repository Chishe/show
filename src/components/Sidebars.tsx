import React from "react";
import { useDnD } from "./DnDContext";

const Sidebars = () => {
  const { setType } = useDnD();

  const onDragStart = (event: React.DragEvent, type: string) => {
    setType(type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="sidebar w-full">
      <div
        className="node cursor-pointer p-2 mb-2 bg-[#41d4a8] rounded-md hover:bg-[#36b093] mt-45"
        draggable
        onDragStart={(event) => onDragStart(event, "input")}
      >
        Input Node
      </div>

      <div
        className="node cursor-pointer p-2 mb-2 bg-[#41d4a8] rounded-md hover:bg-[#36b093]"
        draggable
        onDragStart={(event) => onDragStart(event, "output")}
      >
        Output Node
      </div>

      <div
        className="node cursor-pointer p-2 mb-2 bg-[#41d4a8] rounded-md hover:bg-[#36b093]"
        draggable
        onDragStart={(event) => onDragStart(event, "default")}
      >
        Default Node
      </div>
    </div>
  );
};

export default Sidebars;
