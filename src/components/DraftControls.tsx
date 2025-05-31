import { RuleSet, DraftMode } from "./DraftingInterface";

interface DraftControlsProps {
  draftState: any;
  onRuleSetChange: (ruleSet: RuleSet) => void;
  onDraftModeChange: (mode: DraftMode) => void;
  onUndo: () => void;
  onReset: () => void;
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
  currentPhase,
  isDraftComplete,
  canUndo,
}: DraftControlsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-white font-medium">Rule Set:</label>
            <select
              value={draftState.ruleSet}
              onChange={(e) => onRuleSetChange(e.target.value as RuleSet)}
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="memoryofchaos">Memory of Chaos</option>
              <option value="apocalypticshadow">Apocalyptic Shadow</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white font-medium">Draft Mode:</label>
            <select
              value={draftState.draftMode}
              onChange={(e) => onDraftModeChange(e.target.value as DraftMode)}
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              disabled={draftState.currentStep > 0}
            >
              <option value="4ban">4 Ban Mode</option>
              <option value="6ban">6 Ban Mode</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onUndo}
            disabled={!canUndo}
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

      <div className="mt-4 text-center">
        {isDraftComplete ? (
          <div className="text-green-400 font-bold text-lg">Draft Complete!</div>
        ) : currentPhase ? (
          <div className="text-white">
            <span className="font-medium">Current Phase:</span>{" "}
            <span className={`font-bold ${currentPhase.team === "blue" ? "text-blue-400" : "text-red-400"}`}>
              {currentPhase.team === "blue" ? "Blue Team" : "Red Team"}
            </span>{" "}
            <span className="capitalize">{currentPhase.action}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
