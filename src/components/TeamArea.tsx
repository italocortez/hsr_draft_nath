import { useState, useEffect } from "react";
import { DraftedCharacter, RuleSet, CharacterRank, LightconeRank, DraftSettings } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import { LightconeSelector } from "./LightconeSelector";

interface TeamAreaProps {
  team: "blue" | "red";
  teamData: {
    name: string;
    drafted: DraftedCharacter[];
    banned: Id<"character">[];
    reserveTime: number;
  };
  characters: any[];
  lightcones: any[];
  ruleSet: RuleSet;
  onTeamNameChange: (team: "blue" | "red", name: string) => void;
  onCharacterUpdate: (team: "blue" | "red", index: number, updates: Partial<DraftedCharacter>) => void;
  isDraftComplete?: boolean;
  isDraftStarted?: boolean;
  settings?: DraftSettings;
  opponentTeamData?: {
    name: string;
    drafted: DraftedCharacter[];
    banned: Id<"character">[];
    reserveTime: number;
  };
  resetTrigger?: number;
  currentTurn?: "blue" | "red" | null;
}

interface MoCResultData {
  firstHalfCycles: number | string;
  secondHalfCycles: number | string;
  deadCharacters: number | string;
  additionalCycleModifier: number | string;
}

interface ApocResultData {
  firstHalfScore: number | string;
  secondHalfScore: number | string;
  deadCharacters: number | string;
  additionalScoreModifier: number | string;
}

interface ResultData {
  memoryofchaos: MoCResultData;
  apocalypticshadow: ApocResultData;
}

function WarningIcon() {
  return (
    <svg
      className="w-8 h-8 text-amber-500"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-8 h-8 text-gray-400 hover:text-cyan-400 transition-colors"
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
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-lg rounded-lg shadow-lg border border-gray-600 max-w-sm w-max">
          <div className="text-left break-words hyphens-auto leading-relaxed whitespace-pre-line">{text}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

export function TeamArea({
  team,
  teamData,
  characters,
  lightcones,
  ruleSet,
  onTeamNameChange,
  onCharacterUpdate,
  isDraftComplete = false,
  isDraftStarted = false,
  settings,
  opponentTeamData,
  resetTrigger,
  currentTurn,
}: TeamAreaProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(teamData.name);
  const [activeTab, setActiveTab] = useState<"roster" | "result">("roster");
  const [finalScore, setFinalScore] = useState<number>(0);
  const [resultData, setResultData] = useState<ResultData>({
    memoryofchaos: {
      firstHalfCycles: 0,
      secondHalfCycles: 0,
      deadCharacters: 0,
      additionalCycleModifier: 0,
    },
    apocalypticshadow: {
      firstHalfScore: 0,
      secondHalfScore: 0,
      deadCharacters: 0,
      additionalScoreModifier: 0,
    },
  });

  const teamColor = team === "blue" ? "text-blue-400" : "text-red-400";
  const borderColor = team === "blue" ? "border-blue-500" : "border-red-500";
  const tabActiveColor = team === "blue" ? "bg-blue-500" : "bg-red-500";
  
  // Default team names
  const defaultTeamName = team === "blue" ? "Blue Team" : "Red Team";
  
  // Use default name if current name is empty or just whitespace
  const displayName = teamData.name.trim() || defaultTeamName;

  // Determine if this team is currently active
  const isActiveTeam = currentTurn === team;

  // Get highlight classes for active team
  const getHighlightClasses = () => {
    if (!isActiveTeam || !isDraftStarted || isDraftComplete) return borderColor;
    
    if (team === "blue") {
      return "border-blue-400 bg-blue-500 bg-opacity-5";
    } else {
      return "border-red-400 bg-red-500 bg-opacity-5";
    }
  };

  // Reset result data when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      setResultData({
        memoryofchaos: {
          firstHalfCycles: 0,
          secondHalfCycles: 0,
          deadCharacters: 0,
          additionalCycleModifier: 0,
        },
        apocalypticshadow: {
          firstHalfScore: 0,
          secondHalfScore: 0,
          deadCharacters: 0,
          additionalScoreModifier: 0,
        },
      });
      setFinalScore(0);
      setActiveTab("roster");
    }
  }, [resetTrigger]);

  const calculateTotalCost = () => {
    return teamData.drafted.reduce((total, drafted) => {
      const character = characters.find(c => c._id === drafted.characterId);
      if (!character) return total;

      let cost = character.cost[ruleSet][drafted.rank];
      
      if (drafted.lightconeId && drafted.lightconeRank) {
        const lightcone = lightcones.find(l => l._id === drafted.lightconeId);
        if (lightcone) {
          cost += lightcone.cost[drafted.lightconeRank];
        }
      }
      
      return total + cost;
    }, 0);
  };

  const calculateOpponentTotalCost = () => {
    if (!opponentTeamData) return 0;
    return opponentTeamData.drafted.reduce((total, drafted) => {
      const character = characters.find(c => c._id === drafted.characterId);
      if (!character) return total;

      let cost = character.cost[ruleSet][drafted.rank];
      
      if (drafted.lightconeId && drafted.lightconeRank) {
        const lightcone = lightcones.find(l => l._id === drafted.lightconeId);
        if (lightcone) {
          cost += lightcone.cost[drafted.lightconeRank];
        }
      }
      
      return total + cost;
    }, 0);
  };

  const handleNameSubmit = () => {
    // If tempName is empty or just whitespace, use the default name
    const finalName = tempName.trim() || defaultTeamName;
    onTeamNameChange(team, finalName);
    setEditingName(false);
  };

  const handleStartEditing = () => {
    // When starting to edit, if the current name is the default, clear it for easier editing
    setTempName(teamData.name === defaultTeamName ? "" : teamData.name);
    setEditingName(true);
  };

  const getCharacterImageUrl = (characterId: Id<"character">) => {
    const character = characters.find(c => c._id === characterId);
    if (character?.imageUrl) {
      return character.imageUrl;
    }
    // Fallback to placeholder if no imageUrl
    return `https://via.placeholder.com/120x120/374151/ffffff?text=${encodeURIComponent(
      character?.display_name?.slice(0, 2) || "??"
    )}`;
  };

  const handleMoCResultDataChange = (field: keyof MoCResultData, value: string) => {
    if (value === '') {
      // Allow empty string
      setResultData(prev => ({
        ...prev,
        memoryofchaos: {
          ...prev.memoryofchaos,
          [field]: '',
        },
      }));
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && (field === 'additionalCycleModifier' || numValue >= 0)) {
      setResultData(prev => ({
        ...prev,
        memoryofchaos: {
          ...prev.memoryofchaos,
          [field]: numValue,
        },
      }));
    }
  };

  const handleApocResultDataChange = (field: keyof ApocResultData, value: string) => {
    if (value === '') {
      // Allow empty string
      setResultData(prev => ({
        ...prev,
        apocalypticshadow: {
          ...prev.apocalypticshadow,
          [field]: '',
        },
      }));
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && (field === 'additionalScoreModifier' || numValue >= 0)) {
      setResultData(prev => ({
        ...prev,
        apocalypticshadow: {
          ...prev.apocalypticshadow,
          [field]: numValue,
        },
      }));
    }
  };

  const getNumericValue = (value: number | string): number => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return value;
  };

  const hasEmptyFields = () => {
    if (ruleSet === "memoryofchaos") {
      const mocData = resultData.memoryofchaos;
      return Object.values(mocData).some(val => val === '');
    } else {
      const apocData = resultData.apocalypticshadow;
      return Object.values(apocData).some(val => val === '');
    }
  };

  const calculateResult = () => {
    if (!settings || !opponentTeamData || hasEmptyFields()) return;

    const blueTeamCost = team === "blue" ? calculateTotalCost() : calculateOpponentTotalCost();
    const redTeamCost = team === "red" ? calculateTotalCost() : calculateOpponentTotalCost();
    
    const teamCostDifference = blueTeamCost - redTeamCost;
    
    let blueOwnsTeamCostDifference = 0;
    let redOwnsTeamCostDifference = 0;
    
    if (teamCostDifference > 0) {
      blueOwnsTeamCostDifference = 0;
      redOwnsTeamCostDifference = 1;
    } else if (teamCostDifference < 0) {
      blueOwnsTeamCostDifference = 1;
      redOwnsTeamCostDifference = 0;
    }
    
    let adjustedTeamCostDifference = 0;
    if (ruleSet === "memoryofchaos") {
      adjustedTeamCostDifference = Math.abs(teamCostDifference) * (-settings.mocSettings.rosterDifferenceAdvantagePerPoint);
    } else {
      adjustedTeamCostDifference = Math.abs(teamCostDifference) * settings.apocSettings.rosterDifferenceAdvantagePerPoint;
    }
    
    let finalResult = 0;
    if (ruleSet === "memoryofchaos") {
      const mocData = resultData.memoryofchaos;
      finalResult = getNumericValue(mocData.firstHalfCycles) + getNumericValue(mocData.secondHalfCycles) + getNumericValue(mocData.additionalCycleModifier) + (getNumericValue(mocData.deadCharacters) * settings.mocSettings.deathPenalty);
    } else {
      const apocData = resultData.apocalypticshadow;
      finalResult = getNumericValue(apocData.firstHalfScore) + getNumericValue(apocData.secondHalfScore) + getNumericValue(apocData.additionalScoreModifier) + (getNumericValue(apocData.deadCharacters) * (-settings.apocSettings.deathPenalty));
    }
    
    if (team === "blue") {
      finalResult += adjustedTeamCostDifference * blueOwnsTeamCostDifference;
    } else {
      finalResult += adjustedTeamCostDifference * redOwnsTeamCostDifference;
    }
    
    const teamCost = calculateTotalCost();
    const rosterThreshold = ruleSet === "memoryofchaos" ? settings.mocSettings.rosterThreshold : settings.apocSettings.rosterThreshold;
    const teamCostThresholdDifference = teamCost - rosterThreshold;
    
    let thresholdAdjustment = 0;
    if (teamCostThresholdDifference > 0) {
      if (ruleSet === "memoryofchaos") {
        thresholdAdjustment = teamCostThresholdDifference * settings.mocSettings.aboveThresholdPenaltyPerPoint;
      } else {
        thresholdAdjustment = teamCostThresholdDifference * (-settings.apocSettings.aboveThresholdPenaltyPerPoint);
      }
    } else if (teamCostThresholdDifference < 0) {
      if (ruleSet === "memoryofchaos") {
        thresholdAdjustment = Math.abs(teamCostThresholdDifference) * (-settings.mocSettings.underThresholdAdvantagePerPoint);
      } else {
        thresholdAdjustment = Math.abs(teamCostThresholdDifference) * settings.apocSettings.underThresholdAdvantagePerPoint;
      }
    }
    
    finalResult += thresholdAdjustment;
    setFinalScore(Math.round(finalResult * 1000) / 1000);
  };

  const getFormulaTooltip = () => {
    if (ruleSet === "memoryofchaos") {
      return `Memory of Chaos Formula:

Base Score = 1st Half + 2nd Half + Additional Modifier + (Deaths × Death Penalty)

Roster Difference Adjustment:
• If your team costs less: -|cost difference| × Roster Diff Advantage
• Applied only to the lower-cost team

Threshold Adjustment:
• If team cost > threshold: +(cost - threshold) × Above Threshold Penalty
• If team cost < threshold: -(threshold - cost) × Under Threshold Advantage

Final Score = Base Score + Roster Adjustment + Threshold Adjustment

Lower scores are better in Memory of Chaos.`;
    } else {
      return `Apocalyptic Shadow Formula:

Base Score = 1st Half + 2nd Half + Additional Modifier - (Deaths × Death Penalty)

Roster Difference Adjustment:
• If your team costs less: +|cost difference| × Roster Diff Advantage
• Applied only to the lower-cost team

Threshold Adjustment:
• If team cost > threshold: -(cost - threshold) × Above Threshold Penalty
• If team cost < threshold: +(threshold - cost) × Under Threshold Advantage

Final Score = Base Score + Roster Adjustment + Threshold Adjustment

Higher scores are better in Apocalyptic Shadow.`;
    }
  };

  const renderInputField = (
    label: string,
    value: number | string,
    onChange: (value: string) => void,
    placeholder: string,
    step: string = "0.1",
    min?: string,
    allowNegative: boolean = false
  ) => {
    const isEmpty = value === '';
    const isInvalid = isEmpty || (typeof value === 'string' && isNaN(parseFloat(value)));
    
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-white text-lg font-medium">{label}</label>
          {isEmpty && (
            <div className="flex items-center gap-1" title="This field cannot be empty">
              <WarningIcon />
              <span className="text-lg text-amber-500">Required</span>
            </div>
          )}
        </div>
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-gray-700 text-white text-lg border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            isEmpty ? 'border-amber-500 bg-amber-50 bg-opacity-5' : 'border-gray-600'
          }`}
          placeholder={placeholder}
        />
        {!allowNegative && (
          <p className="text-lg text-gray-400 mt-1">
            {allowNegative ? "Can be negative, zero, or positive" : "Must be ≥ 0"}
          </p>
        )}
      </div>
    );
  };

  const renderRosterTab = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-xl font-medium">Picks ({teamData.drafted.length}/8)</h3>
          <div className="text-white text-xl font-medium">
            Total Cost: <span className="text-amber-400 text-2xl">{calculateTotalCost()}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => {
            const drafted = teamData.drafted[index];
            if (!drafted) {
              return (
                <div
                  key={index}
                  className="aspect-square bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"
                >
                  <span className="text-gray-500 text-lg">Empty</span>
                </div>
              );
            }

            const character = characters.find(c => c._id === drafted.characterId);
            if (!character) return null;

            const characterCost = character.cost[ruleSet][drafted.rank];
            const lightcone = drafted.lightconeId ? lightcones.find(l => l._id === drafted.lightconeId) : null;
            const lightconeCost = lightcone && drafted.lightconeRank ? lightcone.cost[drafted.lightconeRank] : 0;

            const rarityBorderColor = character.rarity === 5 ? "border-amber-400" : character.rarity === 4 ? "border-purple-500" : "border-gray-600";
            const rarityBgGradient = character.rarity === 5 
              ? "bg-gradient-to-b from-[#ad6002] to-[#faa237]" 
              : character.rarity === 4 
                ? "bg-gradient-to-b from-purple-800 to-purple-500" 
                : "bg-gradient-to-b from-gray-700 to-gray-500";

            return (
              <div key={index} className="space-y-2">
                <div className={`relative aspect-square ${rarityBgGradient} rounded-lg overflow-hidden ${rarityBorderColor} border`}>
                  <div className={`absolute inset-0 ${rarityBgGradient}`}></div>
                  <img
                    src={getCharacterImageUrl(drafted.characterId)}
                    alt={character.display_name}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/120x120/374151/ffffff?text=${encodeURIComponent(
                        character.display_name.slice(0, 2)
                      )}`;
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-lg px-2 py-1 rounded z-20 font-medium">
                    {characterCost + lightconeCost}
                  </div>
                  <div className="absolute bottom-1 left-1 z-20 flex">
                    <select
                      value={drafted.rank}
                      onChange={(e) => onCharacterUpdate(team, index, { rank: e.target.value as CharacterRank })}
                      className="bg-black bg-opacity-60 text-white text-lg px-2 py-1 rounded-l border-none outline-none appearance-none cursor-pointer font-medium"
                      style={{
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      {(["E0", "E1", "E2", "E3", "E4", "E5", "E6"] as CharacterRank[]).map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                    {drafted.lightconeId && drafted.lightconeRank && (
                      <select
                        value={drafted.lightconeRank}
                        onChange={(e) => onCharacterUpdate(team, index, { lightconeRank: e.target.value as LightconeRank })}
                        className="bg-black bg-opacity-60 text-white text-lg px-2 py-1 rounded-r border-none outline-none appearance-none cursor-pointer font-medium"
                        style={{
                          backgroundImage: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        {(["S1", "S2", "S3", "S4", "S5"] as LightconeRank[]).map(rank => (
                          <option key={rank} value={rank}>{rank}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <LightconeSelector
                  lightcones={lightcones}
                  selectedLightconeId={drafted.lightconeId}
                  selectedRank={drafted.lightconeRank}
                  onLightconeChange={(lightconeId, rank) => 
                    onCharacterUpdate(team, index, { lightconeId, lightconeRank: rank })
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-white text-xl font-medium mb-2">Bans ({teamData.banned.length})</h3>
        <div className="flex flex-wrap gap-2">
          {teamData.banned.map((characterId, index) => {
            const character = characters.find(c => c._id === characterId);
            if (!character) return null;

            const rarityBgGradient = character.rarity === 5 
              ? "bg-gradient-to-b from-[#ad6002] to-[#faa237]" 
              : character.rarity === 4 
                ? "bg-gradient-to-b from-purple-800 to-purple-500" 
                : "bg-gradient-to-b from-gray-700 to-gray-500";

            return (
              <div
                key={index}
                className={`w-16 h-16 ${rarityBgGradient} rounded border border-red-500 overflow-hidden relative opacity-50`}
              >
                <div className={`absolute inset-0 ${rarityBgGradient}`}></div>
                <img
                  src={getCharacterImageUrl(characterId)}
                  alt={character.display_name}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/120x120/374151/ffffff?text=${encodeURIComponent(
                      character.display_name.slice(0, 2)
                    )}`;
                  }}
                />
                <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center z-20">
                  <span className="text-red-200 font-bold text-lg">BAN</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderResultTab = () => {
    if (ruleSet === "memoryofchaos") {
      const mocData = resultData.memoryofchaos;
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-white text-xl font-medium">Memory of Chaos Results</h3>
            <Tooltip text={getFormulaTooltip()}>
              <InfoIcon />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInputField(
              "1st Half Cycles",
              mocData.firstHalfCycles,
              (value) => handleMoCResultDataChange('firstHalfCycles', value),
              "0.0",
              "0.1",
              "0"
            )}
            {renderInputField(
              "2nd Half Cycles",
              mocData.secondHalfCycles,
              (value) => handleMoCResultDataChange('secondHalfCycles', value),
              "0.0",
              "0.1",
              "0"
            )}
            {renderInputField(
              "Dead Characters",
              mocData.deadCharacters,
              (value) => handleMoCResultDataChange('deadCharacters', value),
              "0",
              "1",
              "0"
            )}
            {renderInputField(
              "Additional Cycle Modifier",
              mocData.additionalCycleModifier,
              (value) => handleMoCResultDataChange('additionalCycleModifier', value),
              "0.0",
              "0.1",
              undefined,
              true
            )}
          </div>
          
          <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={calculateResult}
              disabled={!settings || !opponentTeamData || hasEmptyFields()}
              className={`px-4 py-2 text-lg rounded font-medium transition-colors ${
                team === "blue" 
                  ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800" 
                  : "bg-red-600 hover:bg-red-700 disabled:bg-red-800"
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Calculate Result
            </button>
            
            {hasEmptyFields() && (
              <div className="flex items-center gap-2 text-amber-500 text-lg">
                <WarningIcon />
                <span>Fill all fields to calculate</span>
              </div>
            )}
            
            <div className="flex-1">
              <label className="block text-white text-lg font-medium mb-2">Final Score</label>
              <input
                type="number"
                step="0.01"
                value={finalScore}
                readOnly
                className="w-full bg-gray-600 text-white text-xl border border-gray-500 rounded px-3 py-2 cursor-not-allowed font-medium"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      );
    } else {
      const apocData = resultData.apocalypticshadow;
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-white text-xl font-medium">Apocalyptic Shadow Results</h3>
            <Tooltip text={getFormulaTooltip()}>
              <InfoIcon />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInputField(
              "1st Half Score",
              apocData.firstHalfScore,
              (value) => handleApocResultDataChange('firstHalfScore', value),
              "0.0",
              "0.1",
              "0"
            )}
            {renderInputField(
              "2nd Half Score",
              apocData.secondHalfScore,
              (value) => handleApocResultDataChange('secondHalfScore', value),
              "0.0",
              "0.1",
              "0"
            )}
            {renderInputField(
              "Dead Characters",
              apocData.deadCharacters,
              (value) => handleApocResultDataChange('deadCharacters', value),
              "0",
              "1",
              "0"
            )}
            {renderInputField(
              "Additional Score Modifier",
              apocData.additionalScoreModifier,
              (value) => handleApocResultDataChange('additionalScoreModifier', value),
              "0.0",
              "0.1",
              undefined,
              true
            )}
          </div>
          
          <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={calculateResult}
              disabled={!settings || !opponentTeamData || hasEmptyFields()}
              className={`px-4 py-2 text-lg rounded font-medium transition-colors ${
                team === "blue" 
                  ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800" 
                  : "bg-red-600 hover:bg-red-700 disabled:bg-red-800"
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Calculate Result
            </button>
            
            {hasEmptyFields() && (
              <div className="flex items-center gap-2 text-amber-500 text-lg">
                <WarningIcon />
                <span>Fill all fields to calculate</span>
              </div>
            )}
            
            <div className="flex-1">
              <label className="block text-white text-lg font-medium mb-2">Final Score</label>
              <input
                type="number"
                step="0.01"
                value={finalScore}
                readOnly
                className="w-full bg-gray-600 text-white text-xl border border-gray-500 rounded px-3 py-2 cursor-not-allowed font-medium"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border-2 transition-all duration-300 ${getHighlightClasses()}`}>
      {/* Header with team name and tabs */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                className="bg-gray-700 text-white text-xl px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder={defaultTeamName}
                autoFocus
              />
            </div>
          ) : (
            <h2
              className={`text-2xl font-bold ${teamColor} cursor-pointer hover:opacity-80 min-w-0`}
              onClick={handleStartEditing}
              title="Click to edit team name"
            >
              {displayName}
            </h2>
          )}
          {isActiveTeam && isDraftStarted && !isDraftComplete && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              team === "blue" 
                ? "bg-blue-600 text-white" 
                : "bg-red-600 text-white"
            }`}>
              Active
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-3 py-2 text-lg font-medium rounded transition-colors ${
              activeTab === "roster"
                ? `${tabActiveColor} text-white`
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
            }`}
          >
            Roster
          </button>
          {isDraftComplete ? (
            <button
              onClick={() => setActiveTab("result")}
              className={`px-3 py-2 text-lg font-medium rounded transition-colors ${
                activeTab === "result"
                  ? `${tabActiveColor} text-white`
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
              }`}
            >
              Result
            </button>
          ) : (
            <Tooltip text="Draft must be complete">
              <button
                disabled
                className="px-3 py-2 text-lg font-medium rounded text-gray-600 cursor-not-allowed"
              >
                Result
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "roster" ? renderRosterTab() : renderResultTab()}
      </div>
    </div>
  );
}
