import ScreenshotButton from "./ScreenshotButton";
import "../css/DraftControls.css";
import { DraftState } from "./DraftingInterface";
import { useState } from "react";

interface DraftControlsProps {
    draftState: DraftState;
    onUndo: () => void;
    onReset: () => void;
    onStartDraft: () => void;
    onPauseDraft: () => void;
    currentPhase?: { team: string; action: string };
    isDraftComplete: boolean;
    canUndo: boolean;
    onOpenSettings: () => void;
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
    onOpenSettings,
}: DraftControlsProps) {
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
    const SettingsIcon: React.FC = () => (
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
                {!draftState.isDraftStarted ? (
                    // Start Draft
                    <button
                        className="button start"
                        onClick={onStartDraft}
                    >
                        {`Start Draft`}
                    </button>
                ) : (
                    draftState.isTimerActive ? (
                        // Pause Draft
                        <button
                            onClick={onPauseDraft}
                            className="button pause"
                            disabled={isDraftComplete}
                        >
                            <PauseIcon />
                            {`Pause`}
                        </button>
                    ) : (
                        // Resume Draft
                        <button
                            onClick={onPauseDraft}
                            className="button resume"
                            disabled={isDraftComplete}
                        >
                            <ResumeIcon />
                            {`Resume`}
                        </button>
                    )
                )}

                {/* Undo step */}
                <button
                    onClick={onUndo}
                    disabled={!canUndo || !draftState.isDraftStarted}
                    className="button undo"
                >
                    <UndoIcon />
                    {`Undo`}
                </button>

                {/* Reset Draft */}
                <button
                    onClick={onReset}
                    className="button reset"
                    disabled={!draftState.isDraftStarted}
                >
                    <ResetIcon />
                    {`Reset`}
                </button>
            </div>
            
            <div style={{ borderRight: `1px solid rgb(55, 65, 81)` }} /> {/* gap between l/r */}

            <div className="right">
                {/* Copy Draft to Clipboard */}
                <ScreenshotButton action="clipboard" targetElementId="draft" />
                
                {/* Download Draft */}
                <ScreenshotButton action="download" targetElementId="draft" />

                {/* Draft Settings */}
                <button
                    className="button settings"
                    onClick={onOpenSettings}
                >
                    <SettingsIcon />
                    {`Settings`}
                </button>
            </div>
        </div>
    );
}
