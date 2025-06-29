import React from "react";
export default function MoveStepsBlock({value=10,onValueChange}){
  return(
  <div className="flex items-center bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-semibold gap-2 my-2">
    {"Move "}
    <input
    type="number"
    value={value}
    className="w-12 h-6 rounded text-black text-center bg-white border-none outline-none"
    onClick={(e) => e.stopPropagation()}
    onChange={onValueChange}/>
    {" steps"}
  </div>
  );
}