import { RuleSet, DraftMode } from "./DraftingInterface";

interface DraftControlsProps {
  draftState: any;
  onRuleSetChange: (ruleSet: RuleSet) => void;
  onDraftModeChange: (mode: DraftMode) => void;
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
  onRuleSetChange,
  onDraftModeChange,
  onUndo,
  onReset,
  onStartDraft,
  onPauseDraft,
  currentPhase,
  isDraftComplete,
  canUndo,
}: DraftControlsProps) {
  return (
    <div className="DraftControls Box p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-white font-medium">Rule Set:</label>
            <select
              value={draftState.ruleSet}
              onChange={(e) => onRuleSetChange(e.target.value as RuleSet)}
              disabled={draftState.isDraftStarted}
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
            >
              <option value="apocalypticshadow">Apocalyptic Shadow</option>
              <option value="memoryofchaos">Memory of Chaos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white font-medium">Draft Mode:</label>
            <select
              value={draftState.draftMode}
              onChange={(e) => onDraftModeChange(e.target.value as DraftMode)}
              disabled={draftState.currentStep > 0 || draftState.isDraftStarted}
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
            >
              <option value="4ban">4 Ban Mode</option>
              <option value="6ban">6 Ban Mode</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
