import React, { useState } from "react";
import MoveStepsBlock from "./Blocks/MoveStepsBlock";
import TurnRightBlock from "./Blocks/TurnRightBlock";
import GoToXYBlock from "./Blocks/GoToXYBlock";
import RepeatBlock from "./Blocks/RepeatBlock";
import SayBlock from "./Blocks/SayBlock";
import ThinkBlock from "./Blocks/ThinkBlock";
export default function Sidebar({setDroppedBlocks,onRemoveBlock,activeSpriteId }) {
const [sidebarBlockValues, setSidebarBlockValues]=useState({
    "move-steps":{value: 10},
    "turn-left":{value: 15},
    "turn-right":{value: 15},
    "goto-xy":{x: 0, y: 0},
    "repeat":{value: 10},
    "say":{message:"Hello!", duration: 2},
    "think":{message:"Hmm...", duration: 2},
  });
  const handleSidebarBlockPropChange=(blockType,propName,newValue) => {
    setSidebarBlockValues((prevValues) => {
      const newBlockValues={ ...prevValues };
      if(typeof newBlockValues[blockType] === 'object' && newBlockValues[blockType] !== null){
        newBlockValues[blockType]={ ...newBlockValues[blockType],[propName]:newValue,};
      }else{
        newBlockValues[blockType]=newValue; 
      }
      return newBlockValues;
    });
  };
  const onDragStart=(event,blockType) => {
    const blockData={
      type:blockType,
      props:sidebarBlockValues[blockType], 
    };
    event.dataTransfer.setData("blockData",JSON.stringify(blockData));
  };
  const onDragOverSidebar = (event) => {
    event.preventDefault(); 
  };
  const onDropOnSidebar = (event) => {
    event.preventDefault();
    const blockIdFromMidArea=event.dataTransfer.getData("blockId");
    if(blockIdFromMidArea && activeSpriteId && onRemoveBlock){
       onRemoveBlock(activeSpriteId, blockIdFromMidArea);
    }
  };
  return(
    <div className="w-1/3 h-full flex-none overflow-y-auto p-2 border-r border-gray-200" onDragOver={onDragOverSidebar} onDrop={onDropOnSidebar} >
      <div className="font-bold mt-4">{"Motion"}</div>
      <div draggable="true" onDragStart={(e) => onDragStart(e,"move-steps")}>
        <MoveStepsBlock value={sidebarBlockValues["move-steps"].value} onValueChange={(e) => handleSidebarBlockPropChange("move-steps","value",parseFloat(e.target.value)) } />
      </div>
      <div draggable="true" onDragStart={(e) => onDragStart(e,"turn-right")}>
        <TurnRightBlock value={sidebarBlockValues["turn-right"].value} onValueChange={(e) =>
          handleSidebarBlockPropChange("turn-right","value",parseFloat(e.target.value)) }/>
      </div>
      <div draggable="true" onDragStart={(e) => onDragStart(e,"goto-xy")}>
        <GoToXYBlock x={sidebarBlockValues["goto-xy"].x} y={sidebarBlockValues["goto-xy"].y}
          onXChange={(e) => handleSidebarBlockPropChange("goto-xy","x",parseFloat(e.target.value))}
          onYChange={(e) => handleSidebarBlockPropChange("goto-xy","y",parseFloat(e.target.value))} />
      </div>
       <div draggable="true" onDragStart={(e) => onDragStart(e,"repeat")}>
        <RepeatBlock value={sidebarBlockValues["repeat"].value} onValueChange={(e) =>
            handleSidebarBlockPropChange("repeat","value",parseFloat(e.target.value))}/>
      </div>
  <div className="font-bold mt-4"> {"Looks"} </div>
      <div draggable="true" onDragStart={(e) => onDragStart(e,"say")}>
        <SayBlock message={sidebarBlockValues["say"].message} duration={sidebarBlockValues["say"].duration}
        onMessageChange={(e) => handleSidebarBlockPropChange("say","message",e.target.value)}
          onDurationChange={(e) => handleSidebarBlockPropChange("say","duration",parseFloat(e.target.value))}/>
      </div>
      <div draggable="true" onDragStart={(e) => onDragStart(e,"think")}>
        <ThinkBlock message={sidebarBlockValues["think"].message} duration={sidebarBlockValues["think"].duration}
          onMessageChange={(e) => handleSidebarBlockPropChange("think","message",e.target.value)}
          onDurationChange={(e) => handleSidebarBlockPropChange("think","duration",parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}