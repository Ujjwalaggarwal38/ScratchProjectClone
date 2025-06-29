import React from "react";
export default function SayBlock({message="Hello!",duration=2,onMessageChange,onDurationChange}){
  return(
  <div className="flex items-center bg-purple-500 text-white px-3 py-1.5 rounded text-sm font-semibold gap-1 my-2">
    {"Say "}
    <input
    type="text"
    value={message}
    className="w-14 h-6 rounded text-black text-center bg-white border-none outline-none"
    onClick={(e) => e.stopPropagation()}
    onChange={onMessageChange}/>
    {" for "}
    <input
    type="number"
    value={duration}
    className="w-12 h-6 rounded text-black text-center bg-white border-none outline-none"
    onClick={(e) => e.stopPropagation()}
    onChange={onDurationChange}/>
    {" sec"}
  </div>
  );
}