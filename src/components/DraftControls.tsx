import ScreenshotButton from "./ScreenshotButton";

interface DraftControlsProps {
  draftState: any;
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
  return (
    <div className="DraftControls Box p-6 h-full">
      <div className="flex flex-col h-full justify-center">
        <div className="flex items-center flex-wrap justify-center lg:justify-end gap-3">
            <ScreenshotButton action="clipboard" targetElementId="draft" />
            <ScreenshotButton action="download" targetElementId="draft" />
          {!draftState.isDraftStarted && !isDraftComplete && (
            <button
              onClick={onStartDraft}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              Start Draft
            </button>
          )}
          
          {draftState.isDraftStarted && !isDraftComplete && (
            <button
              onClick={onPauseDraft}
              className={`px-4 py-2 text-white rounded transition-colors ${
                draftState.isTimerActive 
                  ? "bg-yellow-600 hover:bg-yellow-700" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {draftState.isTimerActive ? "Pause" : "Resume"}
            </button>
          )}

          <button
            onClick={onUndo}
            disabled={!canUndo || !draftState.isDraftStarted}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Undo
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}