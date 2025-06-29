import React, { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import {useSprite,initializeSpriteState} from "./hooks/useMultiSprite";
import {v4 as uuidv4} from 'uuid';
export default function App() {
  const [activeSprites,setActiveSprites]=useState([]);
  const [activeSpriteId,setActiveSpriteId]=useState(null);
  const [isHeroModeEnabled,setIsHeroModeEnabled]=useState(false);
  const {executeBlocks}=useSprite();
  useEffect(() => {
    if(activeSprites.length === 0){
      const initialSprite={
        id:uuidv4(),
        type:'Cat',
        ...initializeSpriteState(),
        blocks:[],
      };
      setActiveSprites([initialSprite]);
      setActiveSpriteId(initialSprite.id);
    }
  },[]);
  const handleAddSprite=useCallback((spriteType) =>{
    let count=activeSprites.filter((sprite) => sprite.type.split('-')[0] === spriteType).length;
    const newSprite={
      id:uuidv4(),
      type:!count?spriteType:spriteType+`-${count}`,
      x:activeSprites.length * 50, 
      y:0,
      rotation:90,
      message:null,
      thinking:false,
      blocks:[],
    };
    setActiveSprites((prevSprites) => [...prevSprites, newSprite]);
    setActiveSpriteId(newSprite.id);
  },[activeSprites.length]);
  const getActiveSprite=useCallback(() => {
    return activeSprites.find(sprite => sprite.id === activeSpriteId);
  },[activeSprites,activeSpriteId]);
  const updateSprite=useCallback((spriteId,updatedFieldsOrFn) => {
    setActiveSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              ...(typeof updatedFieldsOrFn === 'function'
                ?updatedFieldsOrFn(sprite)
                :updatedFieldsOrFn),
            }
          :sprite
      )
    );
  },[]);
  const handlePlayAll=useCallback(async () => {
    const executionPromises=activeSprites.map(sprite =>
      executeBlocks(sprite,sprite.blocks,updateSprite)
    );
    await Promise.all(executionPromises);
  },[activeSprites,executeBlocks,updateSprite]);
  const handleResetAll=useCallback(() => {
    setActiveSprites((prevSprites) =>
      prevSprites.map((sprite) => ({
        ...sprite,
        ...initializeSpriteState(),
        message:null, 
        thinking:false,
        blocks:[],
      }))
    );
  }, []);
  const handleUpdateSpritePosition=useCallback((spriteId,newX,newY) => {
    updateSprite(spriteId,{x:newX,y:newY});
  },[updateSprite]);
  const getDroppedBlocksForActiveSprite=useCallback(() => {
      const active=getActiveSprite();
      return active?active.blocks:[];
  }, [getActiveSprite]);
  const handleSetDroppedBlocksForActiveSprite=useCallback((newBlocksOrFn) => {
    setActiveSprites((prevSprites) => {
      const updatedSprites=prevSprites.map((sprite) =>
        sprite.id === activeSpriteId
          ? {
              ...sprite,
              blocks: typeof newBlocksOrFn === 'function'?newBlocksOrFn(sprite.blocks):newBlocksOrFn,
            }
          : sprite
      );
      return updatedSprites;
    });
  }, [activeSpriteId]);
  const handleRemoveBlockFromSprite=useCallback((spriteId,blockIdToRemove) => {
    setActiveSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              blocks: sprite.blocks.filter((block) => block.id !== blockIdToRemove),
            }
          : sprite
      )
    );
  }, []);
  const handleCollisionDetected=useCallback(async(spriteId1,spriteId2) => {
    const spritesToReExecute=new Map();
    let s1OriginalMessage=null;
    let s1OriginalThinking=false;
    let s2OriginalMessage=null;
    let s2OriginalThinking=false;

    setActiveSprites(prevSprites => {
      const sprite1=prevSprites.find(s => s.id === spriteId1);
      const sprite2=prevSprites.find(s => s.id === spriteId2);
      if(!sprite1 || !sprite2)return prevSprites;
      s1OriginalMessage=sprite1.message;
      s1OriginalThinking=sprite1.thinking;
      s2OriginalMessage=sprite2.message;
      s2OriginalThinking=sprite2.thinking;
      const newSprites=prevSprites.map(s => {
        if (s.id === spriteId1 || s.id === spriteId2) {
          const isSprite1= s.id === spriteId1;
          const otherSpriteMessage=(isSprite1?s2OriginalMessage:s1OriginalMessage) || "";
          const otherSpriteThinking=isSprite1?s2OriginalThinking:s1OriginalThinking;
          const updatedBlocks=s.blocks.map(block => {
            switch(block.type){
              case "move-steps":
                return{ ...block,props:{ ...block.props,value:-block.props.value}};
              case "turn-right":
                return{ ...block,props:{ ...block.props,value:-block.props.value}};
              case "goto-xy":
                return { ...block,props:{ ...block.props,x:-block.props.x,y:-block.props.y}};
              case "say":
                return {
                  ...block,
                  type:"think", 
                  props:{
                    ...block.props,
                    message:otherSpriteMessage,
                    duration:(block.props.duration || 2)
                  }
                };
              case "think":
                return {
                  ...block,
                  type:"say", 
                  props:{
                    ...block.props,
                    message:otherSpriteMessage,
                    duration:(block.props.duration || 2) 
                  }
                };
              default:
                return block;
            }
          });

          const updatedSprite={
            ...s,
            blocks:updatedBlocks,
            message:otherSpriteMessage, 
            thinking:otherSpriteThinking,
          };
          spritesToReExecute.set(updatedSprite.id,updatedSprite);
          return updatedSprite;
        }
        return s;
      });
      return newSprites;
    });
    await new Promise(resolve => setTimeout(resolve,50));
    for (const sprite of spritesToReExecute.values()){
      executeBlocks(sprite, sprite.blocks, updateSprite);
    }
  },[executeBlocks, updateSprite]);

  return (
    <>
      <div className="flex flex-col-reverse sm:flex-col-reverse md:flex-row h-screen overflow-hidden">
        <div className="flex-1 h-screen overflow-hidden flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl">
          <Sidebar
            setDroppedBlocks={handleSetDroppedBlocksForActiveSprite}
            onRemoveBlock={handleRemoveBlockFromSprite}
            activeSpriteId={activeSpriteId}/>
            <MidArea
            droppedBlocks={getDroppedBlocksForActiveSprite()}
            setDroppedBlocks={handleSetDroppedBlocksForActiveSprite}
            activeSprite={getActiveSprite()}
            updateSprite={updateSprite}/>
        </div>
        <div className="flex-1 h-screen overflow-hidden flex flex-col bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
          <PreviewArea
            activeSprites={activeSprites}
            onAddSprite={handleAddSprite}
            onSetActiveSprite={setActiveSpriteId}
            activeSpriteId={activeSpriteId}
            onPlayAll={handlePlayAll}
            onResetAll={handleResetAll}
            onUpdateSpritePosition={handleUpdateSpritePosition}
            isHeroModeEnabled={isHeroModeEnabled}
            setIsHeroModeEnabled={setIsHeroModeEnabled}
            onCollisionDetected={handleCollisionDetected}/>
        </div>
      </div>
    </>
  );
}