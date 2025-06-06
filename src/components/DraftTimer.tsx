import { DraftState } from "./DraftingInterface";

interface DraftTimerProps {
  draftState: DraftState;
  currentPhase?: { team: string; action: string };
  isDraftComplete: boolean;
}

export function DraftTimer({ draftState, currentPhase, isDraftComplete }: DraftTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseTimerColor = () => {
    if (draftState.phaseTimer > 10) return "text-green-400";
    if (draftState.phaseTimer > 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getReserveTimeColor = (reserveTime: number) => {
    if (reserveTime > 120) return "text-green-400";
    if (reserveTime > 60) return "text-yellow-400";
    return "text-red-400";
  };

  if (isDraftComplete) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        {/* Title Row */}
        <div className="text-center mb-3">
          <h3 className="text-white font-medium">Draft Timer</h3>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Blue Reserve */}
          <div className="text-center">
            <div className="text-xs text-blue-400 font-medium mb-1">Blue Reserve</div>
            <div className="text-blue-400 text-lg font-bold">
              {formatTime(draftState.blueTeam.reserveTime)}
            </div>
          </div>
          
          {/* Center Status */}
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">Complete!</div>
          </div>
          
          {/* Red Reserve */}
          <div className="text-center">
            <div className="text-xs text-red-400 font-medium mb-1">Red Reserve</div>
            <div className="text-red-400 text-lg font-bold">
              {formatTime(draftState.redTeam.reserveTime)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!draftState.isDraftStarted) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        {/* Title Row */}
        <div className="text-center mb-3">
          <h3 className="text-white font-medium">Draft Timer</h3>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Blue Reserve */}
          <div className="text-center">
            <div className="text-xs text-blue-400 font-medium mb-1">Blue Reserve</div>
            <div className="text-blue-400 text-lg font-bold">
              {formatTime(draftState.blueTeam.reserveTime)}
            </div>
          </div>
          
          {/* Center Status */}
          <div className="text-center">
            <div className="text-lg font-bold text-white">Ready to Begin</div>
          </div>
          
          {/* Red Reserve */}
          <div className="text-center">
            <div className="text-xs text-red-400 font-medium mb-1">Red Reserve</div>
            <div className="text-red-400 text-lg font-bold">
              {formatTime(draftState.redTeam.reserveTime)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Title Row */}
      <div className="text-center mb-3">
        <h3 className="text-white font-medium">Draft Timer</h3>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Blue Reserve */}
        <div className="text-center">
          <div className="text-xs text-blue-400 font-medium mb-1">Blue Reserve</div>
          <div className={`text-lg font-bold ${getReserveTimeColor(draftState.blueTeam.reserveTime)}`}>
            {formatTime(draftState.blueTeam.reserveTime)}
          </div>
          {currentPhase?.team === "blue" && draftState.phaseTimer <= 0 && (
            <div className="text-xs text-blue-300 mt-1">Active</div>
          )}
        </div>
        
        {/* Center Phase Timer */}
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">
            {currentPhase ? (
              <>
                <span className={currentPhase.team === "blue" ? "text-blue-400" : "text-red-400"}>
                  {currentPhase.team === "blue" ? "Blue" : "Red"}
                </span>
                {" "}
                <span className="capitalize">{currentPhase.action}</span>
              </>
            ) : (
              "Phase Timer"
            )}
          </div>
          <div className={`text-3xl font-bold ${getPhaseTimerColor()}`}>
            {draftState.phaseTimer > 0 ? draftState.phaseTimer : "0"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {draftState.phaseTimer > 0 ? "Phase Time" : "Reserve Active"}
          </div>
          {!draftState.isTimerActive && (
            <div className="text-xs text-yellow-400 mt-1">PAUSED</div>
          )}
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-1000 ${
                  draftState.phaseTimer > 10 ? "bg-green-500" :
                  draftState.phaseTimer > 5 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${((draftState.settings.phaseTime - draftState.phaseTimer) / draftState.settings.phaseTime) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Red Reserve */}
        <div className="text-center">
          <div className="text-xs text-red-400 font-medium mb-1">Red Reserve</div>
          <div className={`text-lg font-bold ${getReserveTimeColor(draftState.redTeam.reserveTime)}`}>
            {formatTime(draftState.redTeam.reserveTime)}
          </div>
          {currentPhase?.team === "red" && draftState.phaseTimer <= 0 && (
            <div className="text-xs text-red-300 mt-1">Active</div>
          )}
        </div>
      </div>
    </div>
  );
}
