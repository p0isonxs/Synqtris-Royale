 
export const MobileControls = ({ onMove, onRotate, onMoveDown, onHardDrop, visible }) => {
  if (!visible) return null;

  return (
    <div className="grid grid-cols-3 gap-2 max-w-xs w-full mt-4">
      <button onTouchStart={() => onMove(-1)} className="bg-cyan-600 p-4 rounded-lg shadow active:scale-90">◀️</button>
      <button onTouchStart={onRotate} className="bg-cyan-600 p-4 rounded-lg shadow active:scale-90">⟳</button>
      <button onTouchStart={() => onMove(1)} className="bg-cyan-600 p-4 rounded-lg shadow active:scale-90">▶️</button>
      <button onTouchStart={onHardDrop} className="col-span-2 bg-purple-600 p-4 rounded-lg shadow active:scale-90 font-bold text-white">DROP</button>
      <button onTouchStart={onMoveDown} className="bg-cyan-600 p-4 rounded-lg shadow active:scale-90">⬇️</button>
    </div>
  );
};