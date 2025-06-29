import React, { useEffect } from "react";
import MoveStepsBlock from "./Blocks/MoveStepsBlock";
import TurnRightBlock from "./Blocks/TurnRightBlock";
import GoToXYBlock from "./Blocks/GoToXYBlock";
import RepeatBlock from "./Blocks/RepeatBlock";
import SayBlock from "./Blocks/SayBlock";
import ThinkBlock from "./Blocks/ThinkBlock";
import { v4 as uuidv4 } from 'uuid'; 
const blockComponents = {
  "move-steps":MoveStepsBlock,
  "turn-right":TurnRightBlock,
  "goto-xy":GoToXYBlock,
  "repeat":RepeatBlock,
  "say":SayBlock,
  "think":ThinkBlock,
};
export default function MidArea({droppedBlocks,setDroppedBlocks,activeSprite,}){
  const onDragOver= (event) => {
    event.preventDefault(); 
  };
  const onDrop= (event) => {
    event.preventDefault();
    const blockDataString=event.dataTransfer.getData("blockData");
    const blockIdFromMidArea=event.dataTransfer.getData("blockId");
    if(blockIdFromMidArea) {
      const currentDroppedBlocks=Array.isArray(droppedBlocks)?[...droppedBlocks]:[];
      const draggedBlockIndex=currentDroppedBlocks.findIndex(b => b.id === blockIdFromMidArea);
    if(draggedBlockIndex === -1) return;
      const [draggedBlock]=currentDroppedBlocks.splice(draggedBlockIndex,1);
      currentDroppedBlocks.push(draggedBlock);
      setDroppedBlocks(currentDroppedBlocks);
    }
    else if(blockDataString){
      try{
        const blockData=JSON.parse(blockDataString);
        const newBlock={
          id:uuidv4(),
          type:blockData.type,
          props:blockData.props || {}, 
        };
        const currentDroppedBlocks=Array.isArray(droppedBlocks)?droppedBlocks:[];
        setDroppedBlocks([...currentDroppedBlocks,newBlock]);
      }
      catch(error){
        console.error("Error parsing block data:",error);
      }
    }
  };
const onBlockDragStart = (e,blockId) => {
  e.dataTransfer.setData("blockId",blockId); 
};
const handleBlockPropChange = (blockId,propName,newValue) =>{
  setDroppedBlocks((prevBlocks) =>{
    const currentBlocks=Array.isArray(prevBlocks)?prevBlocks:[];
    const updatedBlocks=currentBlocks.map((block) =>
      block.id === blockId? { ...block,props:{ ...block.props,[propName]:newValue}}:block);
         return updatedBlocks;
        });
    };
    return(
    <div className="flex-1 h-full overflow-hidden">
      <div className="bg-gray-100 h-full overflow-y-auto p-4 shadow-inner" onDragOver={onDragOver} onDrop={onDrop}>
        <h2 className="inline-block px-4 py-1 border-2 border-green-400 rounded-full text-lg font-bold text-gray-800 bg-white shadow-sm hover:bg-green-50 transition-colors"> 
          {activeSprite?activeSprite.type:'No Sprite Selected'}</h2>
          {activeSprite && (Array.isArray(droppedBlocks)?droppedBlocks:[]).length === 0 && (
          <div className="text-gray-500 text-center py-8">Drag blocks here!</div>)}
          {activeSprite && (
          <div className="flex flex-col w-60">
            {(Array.isArray(droppedBlocks)?droppedBlocks:[]).map((block) => {
              const BlockComponent=blockComponents[block.type];
              if(!BlockComponent){
                return <div key={block.id}>Unknown Block Type: {block.type}</div>;
              }
              return (
                <div key={block.id} className="cursor-grab" draggable="true" onDragStart={(e) => onBlockDragStart(e, block.id)}>
                  <BlockComponent {...block.props}
                    onValueChange={(e) =>
                      handleBlockPropChange(block.id,"value",parseFloat(e.target.value))
                    }
                    onMessageChange={(e) =>
                      handleBlockPropChange(block.id,"message",e.target.value)
                    }
                    onDurationChange={(e) =>
                      handleBlockPropChange(block.id,"duration",parseFloat(e.target.value))
                    }
                    onXChange={(e) =>
                      handleBlockPropChange(block.id,"x",parseFloat(e.target.value))
                    }
                    onYChange={(e) =>
                      handleBlockPropChange(block.id,"y",parseFloat(e.target.value))
                    }/>
                </div>
                );
            })}
          </div>
        )}
        {!activeSprite && (
          <div className="text-gray-500 text-center py-8">Select or Add a Sprite to view its code.</div>
        )}
      </div>
    </div>
  );
}
