import { useState } from "react";
import { DraftSettings } from "./DraftingInterface";

interface DraftingSettingsProps {
  settings: DraftSettings;
  onSettingsChange: (settings: DraftSettings) => void;
  isDraftInProgress: boolean;
}

export function DraftingSettings({ settings, onSettingsChange, isDraftInProgress }: DraftingSettingsProps) {
  const [tempSettings, setTempSettings] = useState(settings);

  const handlePhaseTimeChange = (value: string) => {
    const phaseTime = parseInt(value) || 10;
    if (phaseTime >= 10) {
      setTempSettings(prev => ({ ...prev, phaseTime }));
    }
  };

  const handleReserveTimeChange = (value: string) => {
    const reserveTime = parseInt(value) || 10;
    if (reserveTime >= 10) {
      setTempSettings(prev => ({ ...prev, reserveTime }));
    }
  };

  const handleApplySettings = () => {
    // Ensure minimum values are met
    const validatedSettings = {
      phaseTime: Math.max(10, tempSettings.phaseTime),
      reserveTime: Math.max(10, tempSettings.reserveTime),
    };
    setTempSettings(validatedSettings);
    onSettingsChange(validatedSettings);
  };

  const handleResetToDefaults = () => {
    const defaultSettings = { phaseTime: 30, reserveTime: 480 };
    setTempSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  const hasChanges = tempSettings.phaseTime !== settings.phaseTime || tempSettings.reserveTime !== settings.reserveTime;
  const isValid = tempSettings.phaseTime >= 10 && tempSettings.reserveTime >= 10;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Drafting Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phase Time Setting */}
        <div className="space-y-3">
          <label className="block text-white font-medium">Phase Time</label>
          <div className="space-y-2">
            <input
              type="number"
              min="10"
              value={tempSettings.phaseTime}
              onChange={(e) => handlePhaseTimeChange(e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Seconds (min: 10)"
            />
            <div className="text-sm text-gray-400">
              Time per phase: <span className="text-cyan-400">{formatTime(tempSettings.phaseTime)}</span>
              <br />
              <span className="text-xs text-gray-500">Minimum: 10 seconds</span>
            </div>
          </div>
        </div>

        {/* Reserve Time Setting */}
        <div className="space-y-3">
          <label className="block text-white font-medium">Reserve Time</label>
          <div className="space-y-2">
            <input
              type="number"
              min="10"
              value={tempSettings.reserveTime}
              onChange={(e) => handleReserveTimeChange(e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Seconds (min: 10)"
            />
            <div className="text-sm text-gray-400">
              Reserve time per team: <span className="text-cyan-400">{formatTime(tempSettings.reserveTime)}</span>
              <br />
              <span className="text-xs text-gray-500">Minimum: 10 seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleApplySettings}
            disabled={!hasChanges || isDraftInProgress || !isValid}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Settings
          </button>
          <button
            onClick={handleResetToDefaults}
            disabled={isDraftInProgress}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
        
        {isDraftInProgress && (
          <div className="text-sm text-yellow-400 font-medium">
            Settings cannot be changed during draft
          </div>
        )}
        
        {!isValid && !isDraftInProgress && (
          <div className="text-sm text-red-400 font-medium">
            Phase time and reserve time must be at least 10 seconds
          </div>
        )}
      </div>

      {/* Current Settings Display */}
      <div className="mt-4 p-4 bg-gray-700 rounded border border-gray-600">
        <h3 className="text-white font-medium mb-2">Current Active Settings</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Phase Time:</span>
            <span className="text-cyan-400 ml-2">{formatTime(settings.phaseTime)}</span>
          </div>
          <div>
            <span className="text-gray-400">Reserve Time:</span>
            <span className="text-cyan-400 ml-2">{formatTime(settings.reserveTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
