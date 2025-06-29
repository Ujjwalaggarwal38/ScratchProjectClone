import React from "react";
export default function GoToXYBlock({x=0,y=0,onXChange,onYChange}){
  return(
  <div className="flex items-center bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-semibold gap-2 my-2">
    {"Go to x: "}
    <input
    type="number"
    value={x}    
    className="w-12 h-6 rounded text-black text-center bg-white border-none outline-none"
    onClick={(e) => e.stopPropagation()}
    onChange={onXChange}/>
      {" y: "}
    <input
    type="number"
    value={y}
    className="w-12 h-6 rounded text-black text-center bg-white border-none outline-none"
    onClick={(e) => e.stopPropagation()}
    onChange={onYChange}/>
  </div>
  );
}