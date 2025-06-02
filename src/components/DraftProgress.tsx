interface DraftProgressProps {
  currentDraftOrder: { team: string; action: string }[];
  currentStep: number;
}

export function DraftProgress({ currentDraftOrder, currentStep }: DraftProgressProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-white font-medium mb-4 text-center">Draft Progress</h3>
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {currentDraftOrder.map((phase, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
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
              key={index}
              className={`w-8 h-8 rounded ${bgColor} ${borderColor} border flex items-center justify-center transition-all duration-200`}
              title={`${phase.team === "blue" ? "Blue" : "Red"} Team ${phase.action === "ban" ? "Ban" : "Pick"} ${index + 1}`}
            >
              <span className="text-white text-xs font-bold">
                {phase.action === "ban" ? "B" : "P"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-6 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded border border-blue-600"></div>
          <span className="text-gray-300">Blue Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded border border-red-600"></div>
          <span className="text-gray-300">Red Team</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-xs">B = Ban, P = Pick</span>
        </div>
      </div>
    </div>
  );
}
