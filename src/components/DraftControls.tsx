import ScreenshotButton from "./ScreenshotButton";
import "../css/DraftControls.css";
import { DraftMode, DraftSettings, DraftState, RuleSet } from "./DraftingInterface";
import { useState } from "react";
import { DraftingSettings } from "./DraftingSettings";
import { Turn } from "@/lib/utils";
import { ConfirmationModal } from "./TeamTest";

const PauseIcon: React.FC = () => (
    <svg 
        width="1.5rem" 
        height="1.5rem"
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <rect x="6" y="4" width="4" height="16" rx="1"/>
        <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>
);
const ResumeIcon: React.FC = () => (
    <svg 
        width="1.5rem" 
        height="1.5rem"
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M8 5v14l11-7L8 5z"/>
    </svg>
);
const UndoIcon: React.FC = () => (
    <svg
        width="1.125rem"
        height="1.375rem"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
    </svg>
);
const ResetIcon: React.FC = () => (
    <svg
        width="1.125rem"
        height="1.375rem"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
    </svg>
);

interface DraftControlsProps {
    draftState: DraftState;
    onUndo: () => void;
    onReset: () => void;
    onStartDraft: () => void;
    onPauseDraft: () => void;
    isDraftComplete: boolean;
    canUndo: boolean;

    // DraftingSettings methods
    onSettingsChange: (settings: DraftSettings) => void;
    onRuleSetChange: (ruleSet: RuleSet) => void;
    onDraftModeChange: (draftMode: DraftMode) => void;
}

export function DraftControls({
    draftState,
    onUndo,
    onReset,
    onStartDraft,
    onPauseDraft,
    isDraftComplete,
    canUndo,
    onSettingsChange: handleSettingsChange,
    onRuleSetChange: handleRuleSetChange,
    onDraftModeChange: handleDraftModeChange,
}: DraftControlsProps) {
    const [showResetConfirmation, setShowResetConfirmation] = useState<boolean>(false); // Show overlay to confirm resetting Draft proccess

    const handleResetDraftRequest = () => setShowResetConfirmation(true);
    const handleCancelResetDraftRequest = () => setShowResetConfirmation(false);
    const handleConfirmResetDraft = () => {
        onReset();
        setShowResetConfirmation(false);
    };

    return (
        <div className="DraftControls Box">
            <div className="left">
                {!draftState.isDraftStarted ? <>
                    {/* Start Button */}
                    <button
                        className="button start"
                        onClick={onStartDraft}
                    >
                        {`Start Draft`}
                    </button>
                </> : isDraftComplete ? <>
                    {/* Decoration - Draft is complete */}
                    <button
                        className="button"
                        disabled
                        style={{ flex: `1 100%`, backgroundColor: `rgb(75, 85, 99)`, cursor: `default` }}
                    >
                        {`Complete!`}
                    </button>
                </> : draftState.isTimerActive ? <>
                    {/* Pause Button */}
                    <button
                        onClick={onPauseDraft}
                        className="button pause"
                        disabled={isDraftComplete}
                    >
                        <PauseIcon />
                        {`Pause`}
                    </button>
                </> : <>
                    {/* Resume Button */}
                    <button
                        onClick={onPauseDraft}
                        className="button resume"
                        disabled={isDraftComplete}
                    >
                        <ResumeIcon />
                        {`Resume`}
                    </button>
                </>}

                {/* Undo step */}
                <button
                    onClick={onUndo}
                    disabled={!canUndo || !draftState.isDraftStarted}
                    className="button undo"
                >
                    <UndoIcon />
                    {`Undo`}
                </button>

                {/* Reset Draft Button + Confirmation Modal */}
                <button
                    onClick={handleResetDraftRequest}
                    className="button reset"
                    disabled={!draftState.isDraftStarted}
                >
                    <ResetIcon />
                    {`Reset`}
                </button>
                <ConfirmationModal
                    isOpen={showResetConfirmation}
                    onConfirm={handleConfirmResetDraft}
                    onCancel={handleCancelResetDraftRequest}
                    title="Reset Draft"
                    message="This action cannot be undone and will fully reset the current Draft"
                    confirmText="Reset"
                    cancelText="Cancel"
                    isDangerous
                />
            </div>
            
            <div style={{ borderRight: `1px solid rgb(55, 65, 81)` }} /> {/* gap between l/r */}

            <div className="right">
                {/* Copy Draft to Clipboard */}
                <ScreenshotButton action="clipboard" targetElementId="draft" />
                
                {/* Download Draft */}
                <ScreenshotButton action="download" targetElementId="draft" />

                {/* Draft Settings */}
                <DraftingSettings 
                    draftState={draftState}
                    settings={draftState.settings}
                    isDraftInProgress={draftState.isDraftStarted && !isDraftComplete}
                    onSettingsChange={handleSettingsChange}
                    onRuleSetChange={handleRuleSetChange}
                    onDraftModeChange={handleDraftModeChange}
                />
            </div>
        </div>
    );
}
