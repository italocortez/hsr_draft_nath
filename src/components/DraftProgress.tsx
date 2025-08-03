import { useEffect, useState } from "react";
import "../css/DraftProgress.css";

interface DraftProgressProps {
  currentDraftOrder: { team: string; action: string }[];
  currentStep: number;
}

export function DraftProgress({ currentDraftOrder, currentStep }: DraftProgressProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 7 });
  
  const VISIBLE_BOXES = 7; // Always show exactly 7 boxes
  
  useEffect(() => {
    const updateVisibleRange = () => {
      if (currentDraftOrder.length <= VISIBLE_BOXES) {
        // If total steps are 7 or fewer, show all
        setVisibleRange({ start: 0, end: currentDraftOrder.length });
      } else {
        // Always show 7 boxes, centered around current step
        const halfVisible = Math.floor(VISIBLE_BOXES / 2);
        let start = Math.max(0, currentStep - halfVisible);
        let end = Math.min(currentDraftOrder.length, start + VISIBLE_BOXES);
        
        // Adjust if we're near the end
        if (end === currentDraftOrder.length) {
          start = Math.max(0, end - VISIBLE_BOXES);
        }
        
        setVisibleRange({ start, end });
      }
    };

    updateVisibleRange();
  }, [currentStep, currentDraftOrder.length]);

  const showStartEllipsis = visibleRange.start > 0;
  const showEndEllipsis = visibleRange.end < currentDraftOrder.length;
  const visibleBoxes = currentDraftOrder.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="DraftProgress Box p-6 h-full">
      <div className="flex flex-col h-full justify-center">
        <div className="draft-progress-container flex justify-center items-center overflow-hidden">
          <div className="flex items-center gap-2 transition-all duration-500 ease-in-out">
          {/* Start ellipsis */}
          {showStartEllipsis && (
            <div className="flex items-center gap-1 ellipsis-indicator animate-fade-in">
              <span>...</span>
            </div>
          )}
          
          {/* Visible boxes */}
          {visibleBoxes.map((phase, index) => {
            const actualIndex = visibleRange.start + index;
            const isCompleted = actualIndex < currentStep;
            const isCurrent = actualIndex === currentStep;
            
            let bgColor = "";
            let borderColor = "";
            
            if (phase.team === "blue") {
              if (isCompleted) {
                bgColor = "bg-blue-600";
                borderColor = "border-blue-600";
              } else if (isCurrent) {
                bgColor = "bg-blue-500";
                borderColor = "border-cyan-400 border-2 shadow-lg shadow-cyan-400/50";
              } else {
                bgColor = "bg-blue-300";
                borderColor = "border-blue-300";
              }
            } else {
              if (isCompleted) {
                bgColor = "bg-red-600";
                borderColor = "border-red-600";
              } else if (isCurrent) {
                bgColor = "bg-red-500";
                borderColor = "border-cyan-400 border-2 shadow-lg shadow-cyan-400/50";
              } else {
                bgColor = "bg-red-300";
                borderColor = "border-red-300";
              }
            }
            
            return (
              <div
                key={actualIndex}
                className={`w-8 h-8 rounded ${bgColor} ${borderColor} border flex items-center justify-center cursor-help draft-progress-box animate-slide-in`}
                title={`${phase.team === "blue" ? "Blue" : "Red"} Team ${phase.action === "ban" ? "Ban" : "Pick"} - Step ${actualIndex + 1}`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <span className="text-white text-xs font-bold">
                  {phase.action === "ban" ? "B" : "P"}
                </span>
              </div>
            );
          })}
          
          {/* End ellipsis */}
          {showEndEllipsis && (
            <div className="flex items-center gap-1 ellipsis-indicator animate-fade-in">
              <span>...</span>
            </div>
          )}
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-3 text-center text-sm text-gray-400">
          Step {currentStep + 1} of {currentDraftOrder.length}
          {(showStartEllipsis || showEndEllipsis) && (
            <span className="ml-2 text-xs">
              (Showing {visibleRange.start + 1}-{visibleRange.end})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
