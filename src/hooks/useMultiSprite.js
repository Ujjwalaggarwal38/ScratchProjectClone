import { useCallback } from "react";
export const initializeSpriteState = () => ({
x: 0,y: 0,rotation: 90,message: null,thinking: false,});
export const useSprite = () => {
  const executeBlocks=useCallback(async (sprite, blocks, updateSprite) => {
  if(!sprite || !blocks || !updateSprite){
  console.warn("Missing sprite, blocks, or updateSprite function for execution.");
  return;}
  await new Promise((resolve) => setTimeout(resolve, 50));
  //Remove this console.log
  console.warn("Missing sprite, blocks, or updateSprite function for execution.");
  for(const block of blocks){
    const applyUpdate=(updatedFieldsOrFn) => updateSprite(sprite.id, updatedFieldsOrFn);
    switch(block.type){
      case "move-steps":
        applyUpdate((prevSprite) => {
          const angleInDegrees=90-prevSprite.rotation;
          const angleInRadians=angleInDegrees*Math.PI/180;
          const newX=prevSprite.x+block.props.value*Math.cos(angleInRadians);
          const newY=prevSprite.y+block.props.value*Math.sin(angleInRadians);
          return{x: newX, y: newY};});
          break;
      case "turn-right":
        applyUpdate((prevSprite) => ({rotation: prevSprite.rotation+block.props.value,}));
          break;
      case "goto-xy":
        applyUpdate({ x:block.props.x, y:block.props.y});
        break;
      case "say":
        applyUpdate({message:block.props.message,thinking:false});
        await new Promise((resolve) => setTimeout(resolve, block.props.duration*1000));
        applyUpdate({message:null});
        break;
      case "think":
        applyUpdate({message:block.props.message,thinking:true});
        await new Promise((resolve) => setTimeout(resolve,block.props.duration*1000));
        applyUpdate({message:null,thinking:false});
        break;
      case "repeat":
        const times=block.props.value;
        const nestedBlocks=blocks.filter(b => b !== block) || [];
        for(let i=0;i<times;i++){
          await executeBlocks(sprite,nestedBlocks,updateSprite);}
        break;
      default:
        console.warn("Unknown block type: ${block.type}");
      }
    }
    //Debugging for block execution is taking place from top to end
    console.log("Block execution finished.");
  }, []);
return{executeBlocks,initializeSpriteState,};
};