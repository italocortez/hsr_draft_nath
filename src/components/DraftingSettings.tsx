import { useState } from "react";
import { DraftSettings, BanRestriction, MoCSettings, ApocSettings } from "./DraftingInterface";

interface DraftingSettingsProps {
  settings: DraftSettings;
  onSettingsChange: (settings: DraftSettings) => void;
  isDraftInProgress: boolean;
}

// Local interface for temporary settings that allows string values during input
interface TempDraftSettings {
  phaseTime: number | string;
  reserveTime: number | string;
  banRestriction: BanRestriction;
  mocSettings: {
    rosterDifferenceAdvantagePerPoint: number | string;
    rosterThreshold: number | string;
    underThresholdAdvantagePerPoint: number | string;
    aboveThresholdPenaltyPerPoint: number | string;
    deathPenalty: number | string;
  };
  apocSettings: {
    rosterDifferenceAdvantagePerPoint: number | string;
    rosterThreshold: number | string;
    underThresholdAdvantagePerPoint: number | string;
    aboveThresholdPenaltyPerPoint: number | string;
    deathPenalty: number | string;
  };
}

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-600 max-w-xs w-max">
          <div className="text-center break-words hyphens-auto leading-relaxed">{text}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-gray-400 hover:text-cyan-400 transition-colors"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function DraftingSettings({ settings, onSettingsChange, isDraftInProgress }: DraftingSettingsProps) {
  const [tempSettings, setTempSettings] = useState<TempDraftSettings>(settings);

  const handlePhaseTimeChange = (value: string) => {
    if (value === '') {
      setTempSettings(prev => ({ ...prev, phaseTime: '' }));
      return;
    }
    const phaseTime = parseInt(value);
    if (!isNaN(phaseTime)) {
      setTempSettings(prev => ({ ...prev, phaseTime }));
    }
  };

  const handleReserveTimeChange = (value: string) => {
    if (value === '') {
      setTempSettings(prev => ({ ...prev, reserveTime: '' }));
      return;
    }
    const reserveTime = parseInt(value);
    if (!isNaN(reserveTime)) {
      setTempSettings(prev => ({ ...prev, reserveTime }));
    }
  };

  const handleMoCSettingChange = (field: keyof MoCSettings, value: string) => {
    if (value === '') {
      setTempSettings(prev => ({
        ...prev,
        mocSettings: { ...prev.mocSettings, [field]: '' }
      }));
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setTempSettings(prev => ({
        ...prev,
        mocSettings: { ...prev.mocSettings, [field]: numValue }
      }));
    }
  };

  const handleApocSettingChange = (field: keyof ApocSettings, value: string) => {
    if (value === '') {
      setTempSettings(prev => ({
        ...prev,
        apocSettings: { ...prev.apocSettings, [field]: '' }
      }));
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setTempSettings(prev => ({
        ...prev,
        apocSettings: { ...prev.apocSettings, [field]: numValue }
      }));
    }
  };

  const validateNumericSettings = () => {
    const phaseTime = typeof tempSettings.phaseTime === 'string' ? parseInt(tempSettings.phaseTime) : tempSettings.phaseTime;
    const reserveTime = typeof tempSettings.reserveTime === 'string' ? parseInt(tempSettings.reserveTime) : tempSettings.reserveTime;

    // Validate MoC settings
    const mocValid = Object.values(tempSettings.mocSettings).every(val => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num >= 0;
    });

    // Validate Apoc settings
    const apocValid = Object.values(tempSettings.apocSettings).every(val => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num >= 0;
    });

    return {
      phaseTimeValid: !isNaN(phaseTime) && phaseTime >= 8,
      reserveTimeValid: !isNaN(reserveTime) && reserveTime >= 8,
      mocValid,
      apocValid
    };
  };

  const handleApplySettings = () => {
    const validation = validateNumericSettings();
    
    if (!validation.phaseTimeValid || !validation.reserveTimeValid || !validation.mocValid || !validation.apocValid) {
      return; // Don't apply if validation fails
    }

    const phaseTime = typeof tempSettings.phaseTime === 'string' ? parseInt(tempSettings.phaseTime) : tempSettings.phaseTime;
    const reserveTime = typeof tempSettings.reserveTime === 'string' ? parseInt(tempSettings.reserveTime) : tempSettings.reserveTime;

    // Convert MoC settings
    const mocSettings: MoCSettings = {
      rosterDifferenceAdvantagePerPoint: typeof tempSettings.mocSettings.rosterDifferenceAdvantagePerPoint === 'string' 
        ? parseFloat(tempSettings.mocSettings.rosterDifferenceAdvantagePerPoint) 
        : tempSettings.mocSettings.rosterDifferenceAdvantagePerPoint,
      rosterThreshold: typeof tempSettings.mocSettings.rosterThreshold === 'string' 
        ? parseFloat(tempSettings.mocSettings.rosterThreshold) 
        : tempSettings.mocSettings.rosterThreshold,
      underThresholdAdvantagePerPoint: typeof tempSettings.mocSettings.underThresholdAdvantagePerPoint === 'string' 
        ? parseFloat(tempSettings.mocSettings.underThresholdAdvantagePerPoint) 
        : tempSettings.mocSettings.underThresholdAdvantagePerPoint,
      aboveThresholdPenaltyPerPoint: typeof tempSettings.mocSettings.aboveThresholdPenaltyPerPoint === 'string' 
        ? parseFloat(tempSettings.mocSettings.aboveThresholdPenaltyPerPoint) 
        : tempSettings.mocSettings.aboveThresholdPenaltyPerPoint,
      deathPenalty: typeof tempSettings.mocSettings.deathPenalty === 'string' 
        ? parseFloat(tempSettings.mocSettings.deathPenalty) 
        : tempSettings.mocSettings.deathPenalty,
    };

    // Convert Apoc settings
    const apocSettings: ApocSettings = {
      rosterDifferenceAdvantagePerPoint: typeof tempSettings.apocSettings.rosterDifferenceAdvantagePerPoint === 'string' 
        ? parseFloat(tempSettings.apocSettings.rosterDifferenceAdvantagePerPoint) 
        : tempSettings.apocSettings.rosterDifferenceAdvantagePerPoint,
      rosterThreshold: typeof tempSettings.apocSettings.rosterThreshold === 'string' 
        ? parseFloat(tempSettings.apocSettings.rosterThreshold) 
        : tempSettings.apocSettings.rosterThreshold,
      underThresholdAdvantagePerPoint: typeof tempSettings.apocSettings.underThresholdAdvantagePerPoint === 'string' 
        ? parseFloat(tempSettings.apocSettings.underThresholdAdvantagePerPoint) 
        : tempSettings.apocSettings.underThresholdAdvantagePerPoint,
      aboveThresholdPenaltyPerPoint: typeof tempSettings.apocSettings.aboveThresholdPenaltyPerPoint === 'string' 
        ? parseFloat(tempSettings.apocSettings.aboveThresholdPenaltyPerPoint) 
        : tempSettings.apocSettings.aboveThresholdPenaltyPerPoint,
      deathPenalty: typeof tempSettings.apocSettings.deathPenalty === 'string' 
        ? parseFloat(tempSettings.apocSettings.deathPenalty) 
        : tempSettings.apocSettings.deathPenalty,
    };
    
    const validatedSettings: DraftSettings = {
      phaseTime: Math.max(8, phaseTime),
      reserveTime: Math.max(8, reserveTime),
      banRestriction: tempSettings.banRestriction,
      mocSettings,
      apocSettings,
    };
    
    setTempSettings(validatedSettings);
    onSettingsChange(validatedSettings);
  };

  const handleResetToDefaults = () => {
    const defaultSettings: DraftSettings = { 
      phaseTime: 30, 
      reserveTime: 480, 
      banRestriction: "none" as BanRestriction,
      mocSettings: {
        rosterDifferenceAdvantagePerPoint: 0,
        rosterThreshold: 45.0,
        underThresholdAdvantagePerPoint: 0.25,
        aboveThresholdPenaltyPerPoint: 0.1667,
        deathPenalty: 0.25,
      },
      apocSettings: {
        rosterDifferenceAdvantagePerPoint: 25.0,
        rosterThreshold: 50.0,
        underThresholdAdvantagePerPoint: 0.0,
        aboveThresholdPenaltyPerPoint: 0.0,
        deathPenalty: 100.0,
      }
    };
    setTempSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  const hasChanges = () => {
    return tempSettings.phaseTime !== settings.phaseTime || 
           tempSettings.reserveTime !== settings.reserveTime || 
           tempSettings.banRestriction !== settings.banRestriction ||
           JSON.stringify(tempSettings.mocSettings) !== JSON.stringify(settings.mocSettings) ||
           JSON.stringify(tempSettings.apocSettings) !== JSON.stringify(settings.apocSettings);
  };
  
  const validation = validateNumericSettings();
  const isValid = validation.phaseTimeValid && validation.reserveTimeValid && validation.mocValid && validation.apocValid;
  
  // Check for empty fields
  const hasEmptyFields = tempSettings.phaseTime === '' || tempSettings.reserveTime === '' ||
    Object.values(tempSettings.mocSettings).some(val => val === '') ||
    Object.values(tempSettings.apocSettings).some(val => val === '');
  
  const getErrorMessage = () => {
    if (hasEmptyFields) {
      return "All fields must be filled";
    }
    if (!validation.phaseTimeValid) {
      return "Phase time must be at least 8 seconds";
    }
    if (!validation.reserveTimeValid) {
      return "Reserve time must be at least 8 seconds";
    }
    if (!validation.mocValid) {
      return "All Memory of Chaos settings must be ≥ 0";
    }
    if (!validation.apocValid) {
      return "All Apocalyptic Shadow settings must be ≥ 0";
    }
    return "";
  };

  const formatTime = (seconds: number | string) => {
    const numSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    if (isNaN(numSeconds)) return "0:00";
    const mins = Math.floor(numSeconds / 60);
    const secs = numSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBanRestrictionLabel = (restriction: BanRestriction) => {
    switch (restriction) {
      case "none": return "No Restrictions";
      case "onePerRole": return "Only 1 ban per Role";
      case "oneDPS": return "Only 1 DPS ban";
      case "oneSupport": return "Only 1 Support ban";
      case "oneSustain": return "Only 1 Sustain ban";
      default: return "No Restrictions";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Drafting Settings</h2>
      
      {/* Main Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Phase Time Setting */}
        <div className="space-y-3">
          <label className="block text-white font-medium">Phase Time</label>
          <div className="space-y-2">
            <input
              type="number"
              min="8"
              value={tempSettings.phaseTime}
              onChange={(e) => handlePhaseTimeChange(e.target.value)}
              disabled={isDraftInProgress}
              className={`w-full bg-gray-700 text-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                !validation.phaseTimeValid ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Seconds (min: 8)"
            />
            <div className="text-sm text-gray-400">
              Time per phase: <span className="text-cyan-400">{formatTime(tempSettings.phaseTime)}</span>
              <br />
              <span className="text-xs text-gray-500">Minimum: 8 seconds</span>
            </div>
          </div>
        </div>

        {/* Reserve Time Setting */}
        <div className="space-y-3">
          <label className="block text-white font-medium">Reserve Time</label>
          <div className="space-y-2">
            <input
              type="number"
              min="8"
              value={tempSettings.reserveTime}
              onChange={(e) => handleReserveTimeChange(e.target.value)}
              disabled={isDraftInProgress}
              className={`w-full bg-gray-700 text-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                !validation.reserveTimeValid ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Seconds (min: 8)"
            />
            <div className="text-sm text-gray-400">
              Reserve time per team: <span className="text-cyan-400">{formatTime(tempSettings.reserveTime)}</span>
              <br />
              <span className="text-xs text-gray-500">Minimum: 8 seconds</span>
            </div>
          </div>
        </div>

        {/* Ban Restriction Setting */}
        <div className="space-y-3">
          <label className="block text-white font-medium">Ban Restrictions per Team</label>
          <div className="space-y-2">
            <select
              value={tempSettings.banRestriction}
              onChange={(e) => setTempSettings(prev => ({ ...prev, banRestriction: e.target.value as BanRestriction }))}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="none">No Restrictions</option>
              <option value="onePerRole">Only 1 ban per Role</option>
              <option value="oneDPS">Only 1 DPS ban</option>
              <option value="oneSupport">Only 1 Support ban</option>
              <option value="oneSustain">Only 1 Sustain ban</option>
            </select>
            <div className="text-sm text-gray-400">
              Current: <span className="text-cyan-400">{getBanRestrictionLabel(tempSettings.banRestriction)}</span>
              <br />
              <span className="text-xs text-gray-500">Applies during ban phases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Memory of Chaos Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Memory of Chaos Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">MoC Roster Difference Advantage per Point</label>
              <Tooltip text="Reduces cycles for the lower-cost team per point cost difference">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tempSettings.mocSettings.rosterDifferenceAdvantagePerPoint}
              onChange={(e) => handleMoCSettingChange('rosterDifferenceAdvantagePerPoint', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
            <div className="text-xs text-gray-500">Final value multiplied by -1</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">MoC Roster Threshold</label>
              <Tooltip text="Maximum team points before threshold rules apply">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={tempSettings.mocSettings.rosterThreshold}
              onChange={(e) => handleMoCSettingChange('rosterThreshold', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">MoC Under Threshold Advantage per Point</label>
              <Tooltip text="Reduces cycles per point under the threshold">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tempSettings.mocSettings.underThresholdAdvantagePerPoint}
              onChange={(e) => handleMoCSettingChange('underThresholdAdvantagePerPoint', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
            <div className="text-xs text-gray-500">Final value multiplied by -1</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">MoC Above Threshold Penalty per Point</label>
              <Tooltip text="Adds cycles per point exceeding the threshold">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tempSettings.mocSettings.aboveThresholdPenaltyPerPoint}
              onChange={(e) => handleMoCSettingChange('aboveThresholdPenaltyPerPoint', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">MoC Death Penalty</label>
              <Tooltip text="Adds cycles per reported character death">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tempSettings.mocSettings.deathPenalty}
              onChange={(e) => handleMoCSettingChange('deathPenalty', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
          </div>
        </div>
      </div>

      {/* Apocalyptic Shadow Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Apocalyptic Shadow Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">Apoc Roster Difference Advantage per Point</label>
              <Tooltip text="Adds score advantage for lower-cost team per point difference">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={tempSettings.apocSettings.rosterDifferenceAdvantagePerPoint}
              onChange={(e) => handleApocSettingChange('rosterDifferenceAdvantagePerPoint', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">Apoc Roster Threshold</label>
              <Tooltip text="Maximum team points before threshold rules apply">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={tempSettings.apocSettings.rosterThreshold}
              onChange={(e) => handleApocSettingChange('rosterThreshold', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">Apoc Under Threshold Advantage per Point</label>
              <Tooltip text="Adds score per point under the threshold">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tempSettings.apocSettings.underThresholdAdvantagePerPoint}
              onChange={(e) => handleApocSettingChange('underThresholdAdvantagePerPoint', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">Apoc Above Threshold Penalty per Point</label>
              <Tooltip text="Reduces score per point exceeding the threshold">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tempSettings.apocSettings.aboveThresholdPenaltyPerPoint}
              onChange={(e) => handleApocSettingChange('aboveThresholdPenaltyPerPoint', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
            <div className="text-xs text-gray-500">Final value multiplied by -1</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-white text-sm font-medium">Apoc Death Penalty</label>
              <Tooltip text="Reduces score per reported character death">
                <InfoIcon />
              </Tooltip>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={tempSettings.apocSettings.deathPenalty}
              onChange={(e) => handleApocSettingChange('deathPenalty', e.target.value)}
              disabled={isDraftInProgress}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              placeholder="≥ 0"
            />
            <div className="text-xs text-gray-500">Final value multiplied by -1</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleApplySettings}
            disabled={!hasChanges() || isDraftInProgress || !isValid}
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
            {getErrorMessage()}
          </div>
        )}
      </div>

      {/* Current Settings Display */}
      <div className="mt-4 p-4 bg-gray-700 rounded border border-gray-600">
        <h3 className="text-white font-medium mb-4">Current Active Settings</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
          {/* Column 1: General Settings */}
          <div>
            <h4 className="text-white font-medium mb-3">General Settings</h4>
            <div className="space-y-2 text-gray-400">
              <div>
                <span className="text-gray-400">Phase Time:</span>
                <span className="text-cyan-400 ml-2">{formatTime(settings.phaseTime)}</span>
              </div>
              <div>
                <span className="text-gray-400">Reserve Time:</span>
                <span className="text-cyan-400 ml-2">{formatTime(settings.reserveTime)}</span>
              </div>
              <div>
                <span className="text-gray-400">Ban Restrictions:</span>
                <span className="text-cyan-400 ml-2">{getBanRestrictionLabel(settings.banRestriction)}</span>
              </div>
            </div>
          </div>
          
          {/* Column 2: Memory of Chaos */}
          <div>
            <h4 className="text-white font-medium mb-3">Memory of Chaos</h4>
            <div className="space-y-2 text-gray-400">
              <div>
                <span className="text-gray-400">Roster Diff Adv/Point:</span>
                <span className="text-cyan-400 ml-2">{-settings.mocSettings.rosterDifferenceAdvantagePerPoint}</span>
              </div>
              <div>
                <span className="text-gray-400">Roster Threshold:</span>
                <span className="text-cyan-400 ml-2">{settings.mocSettings.rosterThreshold}</span>
              </div>
              <div>
                <span className="text-gray-400">Under Threshold Adv/Point:</span>
                <span className="text-cyan-400 ml-2">{-settings.mocSettings.underThresholdAdvantagePerPoint}</span>
              </div>
              <div>
                <span className="text-gray-400">Above Threshold Penalty/Point:</span>
                <span className="text-cyan-400 ml-2">{settings.mocSettings.aboveThresholdPenaltyPerPoint}</span>
              </div>
              <div>
                <span className="text-gray-400">Death Penalty:</span>
                <span className="text-cyan-400 ml-2">{settings.mocSettings.deathPenalty}</span>
              </div>
            </div>
          </div>
          
          {/* Column 3: Apocalyptic Shadow */}
          <div>
            <h4 className="text-white font-medium mb-3">Apocalyptic Shadow</h4>
            <div className="space-y-2 text-gray-400">
              <div>
                <span className="text-gray-400">Roster Diff Adv/Point:</span>
                <span className="text-cyan-400 ml-2">{settings.apocSettings.rosterDifferenceAdvantagePerPoint}</span>
              </div>
              <div>
                <span className="text-gray-400">Roster Threshold:</span>
                <span className="text-cyan-400 ml-2">{settings.apocSettings.rosterThreshold}</span>
              </div>
              <div>
                <span className="text-gray-400">Under Threshold Adv/Point:</span>
                <span className="text-cyan-400 ml-2">{settings.apocSettings.underThresholdAdvantagePerPoint}</span>
              </div>
              <div>
                <span className="text-gray-400">Above Threshold Penalty/Point:</span>
                <span className="text-cyan-400 ml-2">{-settings.apocSettings.aboveThresholdPenaltyPerPoint}</span>
              </div>
              <div>
                <span className="text-gray-400">Death Penalty:</span>
                <span className="text-cyan-400 ml-2">{-settings.apocSettings.deathPenalty}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
