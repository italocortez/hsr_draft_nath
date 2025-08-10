import { DraftState } from "./DraftingInterface";
import "../css/DraftTimer.css";
import { Turn } from "@/lib/utils";

interface DraftTimerProps {
  draftState: DraftState;
  currentPhase?: Turn;
  isDraftComplete: boolean;
}

const LeftArrowIcon: React.FC = () => (
    <svg 
        height="2rem"
        width="2rem"
        viewBox="0 0 32 32"
        stroke="rgb(59, 130, 246)"
        strokeWidth="2.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg" 
        style={{ 
            animation: 'bob-left 1200ms ease-in-out infinite alternate, fade-in 300ms',
            transformOrigin: 'center'
        }}
    >
        <path d="M12 8l-8 8 8 8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 8l-8 8 8 8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const RightArrowIcon: React.FC = () => (
    <svg 
        height="2rem"
        width="2rem"
        viewBox="0 0 32 32"
        stroke="rgb(239, 68, 68)"
        strokeWidth="2.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg" 
        style={{ 
            animation: 'bob-right 1200ms ease-in-out infinite alternate, fade-in 300ms',
            transformOrigin: 'center'
        }}
    >
        <path d="M12 8l8 8-8 8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 8l8 8-8 8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export function DraftTimer({ draftState, currentPhase, isDraftComplete }: DraftTimerProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPhaseBarColor = (): string => {
        if (draftState.phaseTimer <= 5) return `rgb(220, 68, 68)`;
        if (draftState.phaseTimer <= 10) return `rgb(217, 119, 6)`;
        return `rgb(38, 175, 208)`;
    }
    const getPhaseBarBoxShadow = (): string => {
        if (draftState.phaseTimer <= 5) return `0px 0px 6px 2px rgb(220, 68, 68)`;
        if (draftState.phaseTimer <= 10) return `0px 0px 6px 2px rgb(217, 119, 6)`;
        return `0px 0px 6px 2px rgb(38, 175, 208)`;
    }
    const getPhaseTimerColor = (): string => {
        if (!draftState.isTimerActive) return `rgb(107, 114, 128)`;
        if (draftState.phaseTimer <= 5) return `rgb(220, 68, 68)`;
        if (draftState.phaseTimer <= 10) return `rgb(217, 119, 6)`;
        return `rgb(140, 190, 245)`;
    };
    const getReserveTimeColor = (reserveTime: number): string => {
        if (!draftState.isDraftStarted || !draftState.isTimerActive || isDraftComplete) return `rgb(107, 114, 128)`;
        if (reserveTime <= 60) return `rgb(248, 113, 113)`;
        if (reserveTime <= 120) return `rgb(217, 119, 6)`;
        return `rgb(140, 190, 245)`;
    };

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

                        {/* Timer */}
                        <div
                            className="timer"
                            style={{ color: getPhaseTimerColor() }}   
                        >
                                {(currentPhase?.team === "blue" && draftState.phaseTimer <= 0) ? <LeftArrowIcon /> : <div className="arrow-placeholder" />} 
                                
                                <h3>{String(draftState.phaseTimer > 0 ? draftState.phaseTimer : "0").padStart(2, "0")}</h3>
                                
                                 {(currentPhase?.team === "red" && draftState.phaseTimer <= 0) ? <RightArrowIcon /> : <div className="arrow-placeholder" />}
                        </div>
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
                        {isDraftComplete ? <h3 className="draft-complete">Complete!</h3> : <h3 className="begin-draft">Ready to Begin</h3>}
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
