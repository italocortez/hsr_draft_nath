import "../css/DraftProgress.css";

interface DraftProgressProps {
  currentDraftOrder: { team: string; action: string }[];
  currentStep: number;
}

export function DraftProgress({ currentDraftOrder, currentStep }: DraftProgressProps) {
  // Calculate optimal box size and gap based on container width and number of boxes
  const getBoxDimensions = () => {
    const totalBoxes = currentDraftOrder.length;
    if (totalBoxes <= 11) {
      // For 11 or fewer boxes, use larger size (single row)
      return { size: 'w-7 h-7', gap: 'gap-2', fontSize: 'text-xs' };
    } else if (totalBoxes <= 22) {
      // For 12-22 boxes, use medium size (2 rows max, up to 11 per row)
      return { size: 'w-6 h-6', gap: 'gap-1.5', fontSize: 'text-xs' };
    } else {
      // For 23+ boxes, use smaller size
      return { size: 'w-5 h-5', gap: 'gap-1', fontSize: 'text-xs' };
    }
  };
  const { size, gap, fontSize } = getBoxDimensions();

  // Organize boxes into rows for better space utilization
  const getRowConfiguration = () => {
    const totalBoxes = currentDraftOrder.length;
    if (totalBoxes <= 11) {
      return { rows: 1, boxesPerRow: totalBoxes };
    } else if (totalBoxes <= 22) {
      // Use up to 11 boxes per row for better horizontal space usage
      const boxesPerRow = Math.min(11, Math.ceil(totalBoxes / 2));
      return { rows: Math.ceil(totalBoxes / boxesPerRow), boxesPerRow };
    } else {
      // For very large drafts, use up to 11 boxes per row
      const boxesPerRow = Math.min(11, Math.ceil(totalBoxes / 3));
      return { rows: Math.ceil(totalBoxes / boxesPerRow), boxesPerRow };
    }
  };

  const { rows, boxesPerRow } = getRowConfiguration();

  // Split boxes into rows
  const createRows = () => {
    const rowsArray = [];
    for (let i = 0; i < rows; i++) {
      const startIndex = i * boxesPerRow;
      const endIndex = Math.min(startIndex + boxesPerRow, currentDraftOrder.length);
      rowsArray.push(currentDraftOrder.slice(startIndex, endIndex));
    }
    return rowsArray;
  };

  const boxRows = createRows();

  return (
    <div className="DraftProgress Box">
      <div className="draft-progress-container">
          {boxRows.map((row, rowIndex) => (
            <div key={rowIndex} className={`draft-progress-row ${gap} mb-1`}>
              {row.map((phase, boxIndex) => {
                const actualIndex = rowIndex * boxesPerRow + boxIndex;
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
                    className={`${size} rounded ${bgColor} ${borderColor} border flex items-center justify-center cursor-help draft-progress-box animate-slide-in`}
                title={`${phase.team === "blue" ? "Blue" : "Red"} Team ${phase.action === "ban" ? "Ban" : "Pick"} - Step ${actualIndex + 1}`}
                    style={{
                      animationDelay: `${(rowIndex * boxesPerRow + boxIndex) * 30}ms`,
                      animationFillMode: 'both'
                    }}
              >
                    <span className={`text-white ${fontSize} font-bold`}>
                      {phase.action === "ban" ? "B" : "P"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
}
