import React, { useState, useRef, useEffect, useCallback } from "react";
import CatSprite from "./CatSprite";
import Beetle from "./Beetle";
import Baseball from "./Baseball";
const spriteComponents = { cat: CatSprite, baseball: Baseball, beetle: Beetle,};
export default function PreviewArea({
  activeSprites,
  onAddSprite,
  onSetActiveSprite,
  activeSpriteId,
  onPlayAll,
  onResetAll,
  onUpdateSpritePosition,
  isHeroModeEnabled, 
  setIsHeroModeEnabled,
  onCollisionDetected,
}){
  const stageRef=useRef(null);
  const spriteRefs=useRef(new Map()); 
  const [showDropdown,setShowDropdown]=useState(false);
  const [draggedSpriteId,setDraggedSpriteId]=useState(null);
  const [dragOffsetLocal,setDragOffsetLocal]=useState({ x: 0,y: 0});
  const currentCollidingPairsRef=useRef(new Set());
  const handleMouseDown=(e, spriteId) =>{
    e.preventDefault();
    onSetActiveSprite(spriteId);
    setDraggedSpriteId(spriteId);
    const spriteElement=spriteRefs.current.get(spriteId);
    if(spriteElement){
      const spriteRect=spriteElement.getBoundingClientRect();
      setDragOffsetLocal({
        x: e.clientX - spriteRect.left,
        y: e.clientY - spriteRect.top,
      });
    }
  };
  //Movement of sprite on canvas(This function is used to move the sprite on canvas)
  const handleMouseMove=useCallback((e) => {
    if(draggedSpriteId && stageRef.current){
      const stageRect=stageRef.current.getBoundingClientRect();
      const spriteElement=spriteRefs.current.get(draggedSpriteId);
      if(!spriteElement)return;
      const spriteRect=spriteElement.getBoundingClientRect();
      let newX=e.clientX-stageRect.left-dragOffsetLocal.x;
      let newY=e.clientY-stageRect.top-dragOffsetLocal.y;
      newX=Math.max(0,Math.min(newX,stageRect.width-spriteRect.width));
      newY=Math.max(0,Math.min(newY,stageRect.height-spriteRect.height));
      const newSpriteX=newX+spriteRect.width/2-(stageRect.width/2);
      const newSpriteY=(stageRect.height/2)-(newY+spriteRect.height/2);
      onUpdateSpritePosition(draggedSpriteId,newSpriteX,newSpriteY);
    }
  },[draggedSpriteId, dragOffsetLocal, onUpdateSpritePosition]); 
  const handleMouseUp = useCallback(() => {
    setDraggedSpriteId(null);
  }, []);
  useEffect(() => {
    if(draggedSpriteId){
      window.addEventListener("mousemove",handleMouseMove);
      window.addEventListener("mouseup",handleMouseUp);
    } 
    else{
      window.removeEventListener("mousemove",handleMouseMove);
      window.removeEventListener("mouseup",handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove",handleMouseMove);
      window.removeEventListener("mouseup",handleMouseUp);
    };
  },[draggedSpriteId,handleMouseMove,handleMouseUp]); 
  useEffect(() => {
    if(!isHeroModeEnabled){
      currentCollidingPairsRef.current.clear(); 
      return;
    }
    const newCollidingPairs=new Set();
    const spriteRects=new Map();
    activeSprites.forEach(sprite => {
      const el=spriteRefs.current.get(sprite.id);
      if(el){
        spriteRects.set(sprite.id,el.getBoundingClientRect());
      }
    });
    for(let i=0;i<activeSprites.length;i++){
      for(let j=i+1;j<activeSprites.length;j++){
        const sprite1=activeSprites[i];
        const sprite2=activeSprites[j];
        const rect1=spriteRects.get(sprite1.id);
        const rect2=spriteRects.get(sprite2.id);
        if(rect1 && rect2 && rect1.width>0 && rect1.height>0 && rect2.width>0 && rect2.height>0){
          const collided=!(
            rect1.right<rect2.left ||
            rect1.left>rect2.right ||
            rect1.bottom<rect2.top ||
            rect1.top>rect2.bottom
          );
          const pairKey=[sprite1.id, sprite2.id].sort().join('-');
          if(collided){
            newCollidingPairs.add(pairKey);
            if(!currentCollidingPairsRef.current.has(pairKey)){
              onCollisionDetected(sprite1.id,sprite2.id);
            }
          }
        }
      }
    }
    currentCollidingPairsRef.current=newCollidingPairs;
  }, [activeSprites,isHeroModeEnabled,onCollisionDetected]);
  const getSpriteStyle=(sprite) => {
    const spriteElement=spriteRefs.current.get(sprite.id);
    const spriteWidth=spriteElement?spriteElement.getBoundingClientRect().width:100;
    const spriteHeight=spriteElement?spriteElement.getBoundingClientRect().height:100;
    if(!stageRef.current){
      return{
            position:"absolute",
            left:`calc(50%-${spriteWidth/2}px)`,
            top:`calc(50%-${spriteHeight/2}px)`,
            transform:`rotate(${sprite.rotation-90}deg)`,
            cursor:"grab",
        };
    }
    const stageRect=stageRef.current.getBoundingClientRect();
    const cssLeft=sprite.x+(stageRect.width/2)-(spriteWidth/2);
    const cssTop=(stageRect.height/2)-sprite.y-(spriteHeight/2);
    return {
      position:"absolute",
      left:`${cssLeft}px`,
      top:`${cssTop}px`,
      transform:`rotate(${sprite.rotation-90}deg)`,
      cursor:draggedSpriteId === sprite.id?"grabbing":"grab",
      border:activeSpriteId === sprite.id?'0px solid':'none',
      zIndex:activeSpriteId === sprite.id?10:1,
      minWidth:'50px', 
      minHeight:'50px',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
    };
  };
  const SpriteComponent=({type, ...props}) =>{
    const Component=spriteComponents[type.toLowerCase()];
    return Component?<Component {...props} />:null;
  };
  return (
    <div className="flex flex-col h-full overflow-hidden p-2">
      <div ref={stageRef} className="relative flex-grow bg-white border border-gray-300 rounded overflow-hidden" style={{ height: "calc(100% - 120px)" }}>
        {activeSprites.map((sprite) => (
          <div key={sprite.id} ref={el => spriteRefs.current.set(sprite.id, el)} 
            onMouseDown={(e) => handleMouseDown(e, sprite.id)} style={getSpriteStyle(sprite)}>
            <SpriteComponent type={sprite?.type?.split('-')[0]}/>
            {sprite.message && (
              <div className={`absolute px-3 py-1 rounded text-sm whitespace-nowrap z-10 ${sprite.thinking?"bg-gray-100 border border-gray-400":"bg-white border border-gray-400"}`}
                style={{ bottom:"100%",left:"50%", transform:"translateX(-50%)",marginBottom:"8px",clipPath: sprite.thinking
                ? "polygon(0 0, 100% 0, 100% 70%, 75% 70%, 65% 100%, 55% 70%, 0 70%)"
                : "polygon(0 0, 100% 0, 100% 75%, 60% 75%, 50% 100%, 40% 75%, 0 75%)",
            }}>
              {sprite.message}
          </div>
          )}
      </div>
        ))}
      </div>
      <div className="bg-white border-t border-gray-300 p-3 mt-2 rounded">
        <div className="mb-3 text-lg">
          {activeSpriteId?`${activeSprites.find(s => s.id === activeSpriteId)?.type}:`:'No sprite selected:'} {" "}
          <span className="font-semibold">
            {activeSprites.find(s => s.id === activeSpriteId)?Math.round(activeSprites.find(s => s.id === activeSpriteId).x):'N/A'}
          </span>
          ,{" "}
          <span className="font-semibold">
            {activeSprites.find(s => s.id === activeSpriteId)?Math.round(activeSprites.find(s => s.id === activeSpriteId).y):'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
              onClick={onPlayAll}>Play All</button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1"
              onClick={onResetAll}> Reset All </button>
            <label className="flex items-center cursor-pointer text-base font-medium text-gray-800">
              <input type="checkbox" className="h-4 w-4 mr-1 mt-1" checked={isHeroModeEnabled} 
                onChange={(e) => setIsHeroModeEnabled(e.target.checked)}/>
              Hero Mode
            </label>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1">
              Add Sprite <span className="ml-1">&#9660;</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-20">
                <button
                  onClick={() => { onAddSprite('Cat'); setShowDropdown(false);}}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Cat
                </button>
                <button
                  onClick={() => { onAddSprite('Beetle'); setShowDropdown(false);}}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Beetle
                </button>
                <button
                  onClick={() => { onAddSprite('Baseball'); setShowDropdown(false);}}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Baseball
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}