import { useState, useEffect } from "react";
import { DraftedCharacter, RuleSet, CharacterRank, LightconeRank, DraftSettings, DraftMode } from "./DraftingInterface";
import { DraftedCharacter, RuleSet, CharacterRank, LightconeRank, DraftSettings, DraftMode } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import "../css/TeamArea.css";
import LightconeSelector from "./LightconeSelector";
import "../css/TeamArea.css";
import LightconeSelector from "./LightconeSelector";

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
  settings?: DraftSettings;
  opponentTeamData?: {
    name: string;
    drafted: DraftedCharacter[];
    banned: Id<"character">[];
    reserveTime: number;
  };
  resetTrigger?: number;
  draftMode: DraftMode;
  isDraftStarted?: boolean;
  isActiveTurn?: boolean;
  draftMode: DraftMode;
  isDraftStarted?: boolean;
  isActiveTurn?: boolean;
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
      className="w-4 h-4 text-amber-500"
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

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  disabled?: boolean;
  disabled?: boolean;
}

function Tooltip({ text, children, disabled }: TooltipProps) {
function Tooltip({ text, children, disabled }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled) {
    return children;
  }
  if (disabled) {
    return children;
  }
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
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-600 max-w-sm w-max">
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
  settings,
  opponentTeamData,
  resetTrigger,
  draftMode,
  isDraftStarted = false,
  isActiveTurn,
  draftMode,
  isDraftStarted = false,
  isActiveTurn,
}: TeamAreaProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState<string>(teamData.name);
  const [tempName, setTempName] = useState<string>(teamData.name);
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


  // Default team names
  const defaultTeamName = (team === "blue") ? "Blue Team" : "Red Team";
  const defaultTeamName = (team === "blue") ? "Blue Team" : "Red Team";
  
  // Use default name if current name is empty or just whitespace
  const displayName = teamData.name.trim() || defaultTeamName;

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
    const getFormulaTooltip = () => {
        if (ruleSet === "memoryofchaos") {
        return `Memory of Chaos Formula:

    Base Score = 1st Half + 2nd Half + Additional Modifier + (Deaths × Death Penalty)
    Base Score = 1st Half + 2nd Half + Additional Modifier + (Deaths × Death Penalty)

    Roster Difference Adjustment:
    • If your team costs less: -|cost difference| × Roster Diff Advantage
    • Applied only to the lower-cost team
    Roster Difference Adjustment:
    • If your team costs less: -|cost difference| × Roster Diff Advantage
    • Applied only to the lower-cost team

    Threshold Adjustment:
    • If team cost > threshold: +(cost - threshold) × Above Threshold Penalty
    • If team cost < threshold: -(threshold - cost) × Under Threshold Advantage
    Threshold Adjustment:
    • If team cost > threshold: +(cost - threshold) × Above Threshold Penalty
    • If team cost < threshold: -(threshold - cost) × Under Threshold Advantage

    Final Score = Base Score + Roster Adjustment + Threshold Adjustment
    Final Score = Base Score + Roster Adjustment + Threshold Adjustment

    Lower scores are better in Memory of Chaos.`;
        } else {
        return `Apocalyptic Shadow Formula:
    Lower scores are better in Memory of Chaos.`;
        } else {
        return `Apocalyptic Shadow Formula:

    Base Score = 1st Half + 2nd Half + Additional Modifier - (Deaths × Death Penalty)
    Base Score = 1st Half + 2nd Half + Additional Modifier - (Deaths × Death Penalty)

    Roster Difference Adjustment:
    • If your team costs less: +|cost difference| × Roster Diff Advantage
    • Applied only to the lower-cost team
    Roster Difference Adjustment:
    • If your team costs less: +|cost difference| × Roster Diff Advantage
    • Applied only to the lower-cost team

    Threshold Adjustment:
    • If team cost > threshold: -(cost - threshold) × Above Threshold Penalty
    • If team cost < threshold: +(threshold - cost) × Under Threshold Advantage
    Threshold Adjustment:
    • If team cost > threshold: -(cost - threshold) × Above Threshold Penalty
    • If team cost < threshold: +(threshold - cost) × Under Threshold Advantage

    Final Score = Base Score + Roster Adjustment + Threshold Adjustment
    Final Score = Base Score + Roster Adjustment + Threshold Adjustment

    Higher scores are better in Apocalyptic Shadow.`;
        }
    };
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
            <label className="block text-white text-sm font-medium">{label}</label>
            {isEmpty && (
                <div className="flex items-center gap-1" title="This field cannot be empty">
                <WarningIcon />
                <span className="text-xs text-amber-500">Required</span>
                </div>
            )}
            </div>
            <input
            type="number"
            min={min}
            step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-gray-700 text-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                isEmpty ? 'border-amber-500 bg-amber-50 bg-opacity-5' : 'border-gray-600'
            }`}
            placeholder={placeholder}
            />
            {!allowNegative && (
            <p className="text-xs text-gray-400 mt-1">
                {allowNegative ? "Can be negative, zero, or positive" : "Must be ≥ 0"}
            </p>
            )}
        </div>
        );
    };

    const highlightRoster = (): boolean => (isActiveTurn && isDraftStarted && !isDraftComplete) || false;
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
            <label className="block text-white text-sm font-medium">{label}</label>
            {isEmpty && (
                <div className="flex items-center gap-1" title="This field cannot be empty">
                <WarningIcon />
                <span className="text-xs text-amber-500">Required</span>
                </div>
            )}
            </div>
            <input
            type="number"
            min={min}
            step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-gray-700 text-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                isEmpty ? 'border-amber-500 bg-amber-50 bg-opacity-5' : 'border-gray-600'
            }`}
            placeholder={placeholder}
            />
            {!allowNegative && (
            <p className="text-xs text-gray-400 mt-1">
                {allowNegative ? "Can be negative, zero, or positive" : "Must be ≥ 0"}
            </p>
            )}
        </div>
        );
    };

    const highlightRoster = (): boolean => (isActiveTurn && isDraftStarted && !isDraftComplete) || false;

    const renderRosterTab = () => (
		<div className="roster">
			{/* Picked characters */}
			<div className="picks">
				<div className="sub-header">
					<h2 className="title">{`Picks (${teamData.drafted?.length ?? 0}/8)`}</h2>

                    {/* Active Tag */}
                    {highlightRoster() && (
                        <h3 className="active-tag" style={{ backgroundColor: (team === "blue") ? `rgb(49, 120, 226)` : `rgb(220, 38, 38)` }}>Active</h3>
                    )}

					<h2 className="total-cost">{`Σ ${calculateTotalCost().toFixed(1)}`}</h2>
				</div>

				<div className="characters-container">
					{Array.from({ length: 8 }).map((_, index) => {
						const drafted = teamData.drafted[index];
						if (!drafted) {
							return (
								<div key={index} className="slot empty">
									<h3>{`Empty`}</h3>
								</div>
							);
						}
    const renderRosterTab = () => (
		<div className="roster">
			{/* Picked characters */}
			<div className="picks">
				<div className="sub-header">
					<h2 className="title">{`Picks (${teamData.drafted?.length ?? 0}/8)`}</h2>

                    {/* Active Tag */}
                    {highlightRoster() && (
                        <h3 className="active-tag" style={{ backgroundColor: (team === "blue") ? `rgb(49, 120, 226)` : `rgb(220, 38, 38)` }}>Active</h3>
                    )}

					<h2 className="total-cost">{`Σ ${calculateTotalCost().toFixed(1)}`}</h2>
				</div>

				<div className="characters-container">
					{Array.from({ length: 8 }).map((_, index) => {
						const drafted = teamData.drafted[index];
						if (!drafted) {
							return (
								<div key={index} className="slot empty">
									<h3>{`Empty`}</h3>
								</div>
							);
						}

						const character = characters.find(c => c._id === drafted.characterId);
						if (!character) return null;
						const character = characters.find(c => c._id === drafted.characterId);
						if (!character) return null;

						const characterCost = character.cost[ruleSet][drafted.rank];
						const lightcone = (drafted.lightconeId) ? lightcones.find((l) => l._id === drafted.lightconeId) : null;
						const lightconeCost = (lightcone && drafted.lightconeRank) ? lightcone.cost[drafted.lightconeRank] : 0;
						const characterCost = character.cost[ruleSet][drafted.rank];
						const lightcone = (drafted.lightconeId) ? lightcones.find((l) => l._id === drafted.lightconeId) : null;
						const lightconeCost = (lightcone && drafted.lightconeRank) ? lightcone.cost[drafted.lightconeRank] : 0;

						return (
							<div
								key={index}
								className="slot"
                                data-rarity={character.rarity}
							>
								{/* Character info */}
								<div className="character">

									{/* Character IMG */}
                                    <img
                                        src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                        alt={character.display_name}
                                        title={`${character.display_name}`}
                                    />

									{/* Combined cost */}
									<h3
										className="total-cost"
										title={`Character: ${characterCost || `-`} cost. LC: ${lightconeCost || `-`} cost`}
									>
										{lightcone
											? `Σ ${characterCost + lightconeCost}`
											: characterCost}
									</h3>

									{/* Verticals (Eidolon/SuperImposition) */}
									<div className="verticals">
										{/* Eidolon */}
										<select
											value={drafted.rank}
											onChange={e => onCharacterUpdate(team, index, { rank: e.target.value as CharacterRank })}
											className="eidolon focus:outline-none"
											style={{
												paddingRight: `${lightcone ? `0` : ``}`,
												marginRight: `${lightcone ? `0` : ``}`,
											}}
										>
											{([ "E0", "E1", "E2", "E3", "E4", "E5", "E6" ] as CharacterRank[]).map((rank) => (
												<option key={rank} value={rank} style={{ color: "black" }}>
													{rank}
												</option>
											))}
										</select>
						return (
							<div
								key={index}
								className="slot"
                                data-rarity={character.rarity}
							>
								{/* Character info */}
								<div className="character">

									{/* Character IMG */}
                                    <img
                                        src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                        alt={character.display_name}
                                        title={`${character.display_name}`}
                                    />

									{/* Combined cost */}
									<h3
										className="total-cost"
										title={`Character: ${characterCost || `-`} cost. LC: ${lightconeCost || `-`} cost`}
									>
										{lightcone
											? `Σ ${characterCost + lightconeCost}`
											: characterCost}
									</h3>

									{/* Verticals (Eidolon/SuperImposition) */}
									<div className="verticals">
										{/* Eidolon */}
										<select
											value={drafted.rank}
											onChange={e => onCharacterUpdate(team, index, { rank: e.target.value as CharacterRank })}
											className="eidolon focus:outline-none"
											style={{
												paddingRight: `${lightcone ? `0` : ``}`,
												marginRight: `${lightcone ? `0` : ``}`,
											}}
										>
											{([ "E0", "E1", "E2", "E3", "E4", "E5", "E6" ] as CharacterRank[]).map((rank) => (
												<option key={rank} value={rank} style={{ color: "black" }}>
													{rank}
												</option>
											))}
										</select>

										{/* Imposition */}
										{drafted.lightconeId && (
											<>
												<select
													value={drafted.lightconeRank || "S1"}
													onChange={e => onCharacterUpdate(team, index, { lightconeId: drafted.lightconeId, lightconeRank: e.target.value as LightconeRank })}
													className="imposition focus:outline-none"
												>
													{(["S1", "S2", "S3", "S4", "S5"] as LightconeRank[]).map((rank) => (
														<option key={rank} value={rank} style={{ color: "black" }}>
															{rank}
														</option>
													))}
												</select>
											</>
										)}
									</div>
								</div>
                                
                                {/* Lightcone */}
								<LightconeSelector
									lightcones={lightcones}
									selectedLightconeId={drafted.lightconeId}
									selectedRank={drafted.lightconeRank}
									onLightconeChange={(lightconeId, rank) => onCharacterUpdate(team, index, { lightconeId, lightconeRank: rank })}
								/>
							</div>
						);
					})}
				</div>
			</div>
										{/* Imposition */}
										{drafted.lightconeId && (
											<>
												<select
													value={drafted.lightconeRank || "S1"}
													onChange={e => onCharacterUpdate(team, index, { lightconeId: drafted.lightconeId, lightconeRank: e.target.value as LightconeRank })}
													className="imposition focus:outline-none"
												>
													{(["S1", "S2", "S3", "S4", "S5"] as LightconeRank[]).map((rank) => (
														<option key={rank} value={rank} style={{ color: "black" }}>
															{rank}
														</option>
													))}
												</select>
											</>
										)}
									</div>
								</div>
                                
                                {/* Lightcone */}
								<LightconeSelector
									lightcones={lightcones}
									selectedLightconeId={drafted.lightconeId}
									selectedRank={drafted.lightconeRank}
									onLightconeChange={(lightconeId, rank) => onCharacterUpdate(team, index, { lightconeId, lightconeRank: rank })}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* Banned characters */}
			<div className="bans">
				<h2 className="sub-header">
                    {`Bans (${teamData.banned?.length ?? 0}/${draftMode === "4ban" ? `2` : draftMode === "6ban" ? `3` : `0`})`}
                </h2>

				<div className="characters-container">
                    {Array.from({ length: (draftMode === "4ban") ? 2 : (draftMode === "6ban") ? 3 : 0 }).map((_, index) => {
                        const bannedCharacterId = teamData.banned[index];
                        
                        if (!bannedCharacterId) {
                            return (
                                <div key={index} className="slot empty">
                                    <h3>{`Empty`}</h3>
                                </div>
                            );
                        }

                        const character = characters.find((c) => c._id === bannedCharacterId);
                        if (!character) return null;
			{/* Banned characters */}
			<div className="bans">
				<h2 className="sub-header">
                    {`Bans (${teamData.banned?.length ?? 0}/${draftMode === "4ban" ? `2` : draftMode === "6ban" ? `3` : `0`})`}
                </h2>

				<div className="characters-container">
                    {Array.from({ length: (draftMode === "4ban") ? 2 : (draftMode === "6ban") ? 3 : 0 }).map((_, index) => {
                        const bannedCharacterId = teamData.banned[index];
                        
                        if (!bannedCharacterId) {
                            return (
                                <div key={index} className="slot empty">
                                    <h3>{`Empty`}</h3>
                                </div>
                            );
                        }

                        const character = characters.find((c) => c._id === bannedCharacterId);
                        if (!character) return null;

                        return (
                            <div key={index} className="slot" data-rarity={character.rarity}>
                                <img
                                    className="character"
                                    src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                    alt={`${character.display_name} (Banned)`}
                                    title={`${character.display_name} (Banned)`}
                                />
                            </div>
                        );
                    })}
				</div>
			</div>
		</div>
	);
                        return (
                            <div key={index} className="slot" data-rarity={character.rarity}>
                                <img
                                    className="character"
                                    src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                    alt={`${character.display_name} (Banned)`}
                                    title={`${character.display_name} (Banned)`}
                                />
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
            <div className="results space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-white font-medium">Memory of Chaos Results</h3>
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
                        className={`px-4 py-2 rounded font-medium transition-colors ${
                            team === "blue" 
                            ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800" 
                            : "bg-red-600 hover:bg-red-700 disabled:bg-red-800"
                        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={{ alignSelf: "flex-end" }}
                    >
                        Calculate Result
                    </button>
                    
                    {hasEmptyFields() && (
                        <div className="flex items-center gap-2 text-amber-500 text-sm">
                            <WarningIcon />
                            <span>Fill all fields to calculate</span>
                        </div>
                    )}
                    
                    <div className="flex-1">
                    <label className="block text-white text-sm font-medium mb-2">Final Score</label>
                    <input
                        type="number"
                        step="0.01"
                        value={finalScore}
                        readOnly
                        className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 cursor-not-allowed"
                        placeholder="0.00"
                    />
                    </div>
                </div>
            </div>
        );
        } else {
        const apocData = resultData.apocalypticshadow;
        return (
            <div className="results space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-white font-medium">Apocalyptic Shadow Results</h3>
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
                        className={`px-4 py-2 rounded font-medium transition-colors ${
                            team === "blue" 
                            ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800" 
                            : "bg-red-600 hover:bg-red-700 disabled:bg-red-800"
                        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={{ alignSelf: "flex-end" }}
                    >
                        Calculate Result
                    </button>
                    
                    {hasEmptyFields() && (
                        <div className="flex items-center gap-2 text-amber-500 text-sm">
                            <WarningIcon />
                            <span>Fill all fields to calculate</span>
                        </div>
                    )}
                    
                    <div className="flex-1">
                    <label className="block text-white text-sm font-medium mb-2">Final Score</label>
                    <input
                        type="number"
                        step="0.01"
                        value={finalScore}
                        readOnly
                        className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 cursor-not-allowed"
                        placeholder="0.00"
                    />
                    </div>
                </div>
            </div>
        );
        }
    };

    const getBorderColor = (): string => {
        if (team === "blue") return `2px solid rgb(59, 130, 246)`;
        if (team === "red") return `2px solid rgb(239, 68, 68)`;
        return ``;
    }

    const getBackgroundColor = (): string => {
        if (!highlightRoster()) return ``;
        // if (team === "blue") return `rgb(31, 44, 71)`;
        // if (team === "red") return `rgb(55, 37, 41)`;
        return (team === "blue") ? `rgba(31, 41, 55, 0.05)` : `rgba(239, 68, 68, 0.05)`;
    }

    const getBoxShadow = (): string => {
        if (!highlightRoster()) return ``;
        return `1px 1px 6px 5px ${(team === "blue" ? `rgba(59, 130, 246, 0.33)` : `rgba(239, 68, 68, 0.33)`)}`;
    }

    const getPulsingAnimation = (): string => {
        if (!highlightRoster()) return ``;
        return `pulsating-shadow-${team} 1400ms cubic-bezier(0.4, 0, 0.6, 1) infinite alternate`;
    }

    return (
        <div className="TeamArea Box" 
            style={{ 
                border: getBorderColor(), 
                backgroundColor:  getBackgroundColor(), 
                // boxShadow: getBoxShadow(),
                animation: getPulsingAnimation(),
            }}
        >
            {/* Header - Team [Name/Editor] + Navigation [Draft/Results] */}
            <div className="header">
                {
                    !editingName ? <>
                        {/* Team Name */}
                        <h1 
                            className="title name" 
                            onClick={handleStartEditing}

                            style={{ color: `${(team === "blue") ? `rgb(96, 165, 250)` : `rgb(248, 113, 113)`}` }}
                        >
                            {displayName}
                        </h1>
                    </> : <>
                        {/* Name Editor */}
                        <input
                            className="title editor focus:outline-none"
                            
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value as string)}
                            onBlur={handleNameSubmit}
                            onKeyDown={(e) => (e.key === "Enter") && handleNameSubmit()}
                            
                            placeholder={defaultTeamName}
                            autoFocus
                            maxLength={30}
                        />
                    </>
                }

                {/* Navigation */}
                <div className="navigation">
                    {/* Roster button */}
                    <button
                        className="tab-button"
                        onClick={_ => setActiveTab("roster")}

                        style={{ 
                            backgroundColor: `${ (activeTab === "roster") ? (team === "blue") ? `rgb(59, 130, 246)` : `rgb(239, 68, 68)` : `transparent` }`,
                            borderBottom: `${ (activeTab === "roster") ? `2px solid white` : `none` }`, // Active tab has border

                            borderTopRightRadius: `0.5rem`,
                        }}
                    >
                        {`Roster`}
                    </button>

                    {/* Results button */}
                    <Tooltip text="Draft must be completed first!" disabled={isDraftComplete}>
                        <button
                            className="tab-button"
                            onClick={_ => isDraftComplete && setActiveTab("result")}
                            disabled={!isDraftComplete}

                            style={{ 
                                backgroundColor: `${ (activeTab === "result") ? (team === "blue") ? `rgb(59, 130, 246)` : `rgb(239, 68, 68)` : `transparent` }`,
                                borderBottom: `${ (activeTab === "result") ? `2px solid white` : `none` }`, // Active tab has border
                                cursor: `${ !isDraftComplete ? `not-allowed` : `pointer` }`,
                                color: `${ !isDraftComplete ? `rgb(129, 133, 139)` : `white` }`,
                            }}
                        >
                            {`Result`}
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Tab Content */}
            { (activeTab === "roster") && renderRosterTab() }
            { (activeTab === "result") && renderResultTab() }
        </div>
    );
            {/* Tab Content */}
            { (activeTab === "roster") && renderRosterTab() }
            { (activeTab === "result") && renderResultTab() }
        </div>
    );
}
