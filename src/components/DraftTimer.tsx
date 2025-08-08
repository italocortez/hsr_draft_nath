import { DraftState } from "./DraftingInterface";
import "../css/DraftTimer.css";

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

    const getPhaseBarColor = (): string => {
        if (draftState.phaseTimer <= 5) return `rgb(220, 68, 68)`;
        if (draftState.phaseTimer <= 10) return `rgb(250, 134, 21)`;
        return `rgb(38, 175, 208)`; // Default color 
    }
    const getPhaseBarBoxShadow = (): string => {
        if (draftState.phaseTimer <= 5) return `0px 0px 3px 1px rgb(220, 68, 68)`;
        if (draftState.phaseTimer <= 10) return `0px 0px 3px 1px rgb(250, 134, 21)`;
        return `0px 0px 3px 1px rgb(38, 175, 208)`; // Default color 
    }
    const getPhaseTimerColor = (): string => {
        if (!draftState.isTimerActive) return `rgba(255, 255, 255, 0.5)`; // Grayed out when Draft is Paused
        if (draftState.phaseTimer <= 5) return `rgb(220, 68, 68)`;
        if (draftState.phaseTimer <= 10) return `rgb(250, 164, 21)`;
        return `rgb(74, 222, 128)`; // Default color
    };
    const getReserveTimeColor = (reserveTime: number): string => {
        if (!draftState.isDraftStarted || !draftState.isTimerActive || isDraftComplete) return `rgba(255, 255, 255, 0.5)`; // Grayed out before Draft is started or when Draft is Paused/Complete
        if (reserveTime <= 60) return `rgb(248, 113, 113)`;
        if (reserveTime <= 120) return `rgb(250, 204, 21)`;
        return `rgb(74, 222, 128)`; // Default color
    };

    const LeftArrowIcon: React.FC = () => (
        <svg 
            height="1.5rem"
            width="1.5rem"
            viewBox="0 0 32 32"
            fill="rgb(96, 165, 250)"
            xmlns="http://www.w3.org/2000/svg" 
            style={{ opacity: (currentPhase?.team === "blue" && draftState.phaseTimer <= 0) ? `1` : `0` }}
        >
            <path d="M32 15H3.41l8.29-8.29-1.41-1.42-10 10a1 1 0 0 0 0 1.41l10 10 1.41-1.41L3.41 17H32z" data-name="4-Arrow Left"/>
        </svg>
    );
    const RightArrowIcon: React.FC = () => (
        <svg 
            height="1.5rem"
            width="1.5rem"
            viewBox="0 0 32 32"
            fill="rgb(248, 113, 113)"
            xmlns="http://www.w3.org/2000/svg" 
            style={{ opacity: (currentPhase?.team === "red" && draftState.phaseTimer <= 0) ? `1` : `0` }}
        >
            <path d="m31.71 15.29-10-10-1.42 1.42 8.3 8.29H0v2h28.59l-8.29 8.29 1.41 1.41 10-10a1 1 0 0 0 0-1.41z" data-name="3-Arrow Right"/>
        </svg>
    );

    return (
        <div className="DraftTimer Box">
            <div className="content">
                {(draftState.isDraftStarted && !isDraftComplete) ? <>
                    {/* Draft is still on-going */}

                    {/* Blue Reserve */}
                    <div className="team blue">
                        <h3 className="title">Blue Reserve</h3>
                        
                        <h3 
                            className="reserve"
                            style={{ color: getReserveTimeColor(draftState.blueTeam.reserveTime) }}
                        >
                            {formatTime(draftState.blueTeam.reserveTime)}
                        </h3>
                    </div>

                    {/* Center Status */}
                    <div className="draft-status">
                        {/* Timer */}
                        <div
                            className="timer"
                            style={{ color: getPhaseTimerColor() }}   
                        >
                                <LeftArrowIcon />
                                
                                <h3>{String(draftState.phaseTimer > 0 ? draftState.phaseTimer : "0").padStart(2, "0")}</h3>
                                
                                <RightArrowIcon />
                        </div>

                        {/* Current Turn */}
                        {draftState.isTimerActive ? (
                            <h3 className="current-move">
                                <span style={{ color: (currentPhase?.team === "blue") ? `rgb(59, 130, 246)` : `rgb(239, 68, 68)` }}>
                                    {currentPhase?.team === "blue" ? "Blue" : (currentPhase?.team === "red") ? "Red" : ""}
                                </span>
                                {` `}
                                {currentPhase?.action}
                            </h3>
                        ) : (
                            <h3 className="paused">PAUSED</h3>
                        )}
                    </div>

                    {/* Red Reserve */}
                    <div className="team red">
                        <h3 className="title">Red Reserve</h3>
                        
                        <h3 
                            className="reserve"
                            style={{ color: getReserveTimeColor(draftState.redTeam.reserveTime) }}
                        >
                            {formatTime(draftState.redTeam.reserveTime)}
                        </h3>
                    </div>

                </> : <>
                    {/* Draft hasn't started or is complete */}

                    {/* Blue Reserve */}
                    <div className="team blue">
                        <h3 className="title">Blue Reserve</h3>
                        
                        <h3 className="reserve" style={{ color: getReserveTimeColor(draftState.blueTeam.reserveTime) }}>
                            {formatTime(draftState.blueTeam.reserveTime)}
                        </h3>
                    </div>

                    {/* Center Status */}
                    <div className="draft-status">
                        {isDraftComplete ? <h3 className="draft-complete">Completed!</h3> : <h3 className="begin-draft">Ready to Begin</h3>}
                    </div>

                    {/* Red Reserve */}
                    <div className="team red">
                        <h3 className="title">Red Reserve</h3>
                        
                        <h3 className="reserve" style={{ color: getReserveTimeColor(draftState.blueTeam.reserveTime) }}>
                            {formatTime(draftState.redTeam.reserveTime)}
                        </h3>
                    </div>
                </>}
            </div>
            
            {/* Phase Timer Bar */}
            <div className="phase-bar">
                <div 
                    className="moving-bar"
                    style={{
                        width: `${((draftState.settings.phaseTime - draftState.phaseTimer) / draftState.settings.phaseTime) * 100}%`,
                        backgroundColor: getPhaseBarColor(),
                        opacity: ((!draftState.isDraftStarted || isDraftComplete) ? `0` : `1`), // Hide when Draft hasn't started
                        boxShadow: getPhaseBarBoxShadow(),
                    }}
                />
            </div>
        </div>
    );
}
