import ScreenshotButton from "./ScreenshotButton";
import "../css/DraftControls.css";
import { DraftState } from "./DraftingInterface";

interface DraftControlsProps {
    draftState: DraftState;
    onUndo: () => void;
    onReset: () => void;
    onStartDraft: () => void;
    onPauseDraft: () => void;
    currentPhase?: { team: string; action: string };
    isDraftComplete: boolean;
    canUndo: boolean;
}

export function DraftControls({
    draftState,
    onUndo,
    onReset,
    onStartDraft,
    onPauseDraft,
    currentPhase,
    isDraftComplete,
    canUndo,
}: DraftControlsProps) {

    const GearIcon: React.FC = () => (
        <svg
            width="1.375rem"
            height="1.375rem"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <div className="DraftControls Box">
            <div className="left">
                {/* Start Draft */}
                {(!draftState.isDraftStarted && !isDraftComplete) && (
                    <button
                        className="button start"
                        onClick={onStartDraft}
                    >
                        {`Start Draft`}
                    </button>
                )}

                {/* Pause/Resume Draft */}
                {draftState.isDraftStarted && !isDraftComplete && (
                    <button
                        onClick={onPauseDraft}
                        className={`button ${draftState.isTimerActive ? `pause` : `resume`}`}
                    >
                        {draftState.isTimerActive ? "Pause" : "Resume"}
                    </button>
                )}

                {/* Undo step */}
                <button
                    onClick={onUndo}
                    disabled={!canUndo || !draftState.isDraftStarted}
                    className="button undo"
                >
                    Undo
                </button>

                {/* Reset Draft */}
                <button
                    onClick={onReset}
                    className="button reset"
                    disabled={!draftState.isDraftStarted}
                >
                    Reset
                </button>
            </div>
            
            <div style={{ borderRight: `1px solid rgb(55, 65, 81)` }} /> {/* gap between l/r */}

            <div className="right">
                {/* Copy Draft to Clipboard */}
                <ScreenshotButton action="clipboard" targetElementId="draft" />
                
                {/* Download Draft */}
                <ScreenshotButton action="download" targetElementId="draft" />

                {/* Draft Settings TBD */}
                <button
                    className="button settings"
                    style={{ color: "rgb(31, 31, 31)", backgroundColor: "rgba(255, 255, 255, 0.9)", display: "flex", gap: "0.375rem", alignItems: "center", justifyContent: "center" }}
                >
                    <GearIcon />
                    {`Settings`}
                </button>
            </div>
        </div>
    );
}