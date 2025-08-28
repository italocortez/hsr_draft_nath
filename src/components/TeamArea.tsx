import { useState, useEffect } from "react";
import { DraftedCharacter, RuleSet, DraftSettings, DraftMode, TeamState, DraftState } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import "../css/TeamArea.css";
import LightconeSelector from "./LightconeSelector";
import { Character, CharacterRank, Eidolons, SuperImpositions, Lightcone, LightconeRank, Team, Turn, Action } from "@/lib/utils";

interface TeamAreaProps {
    team: Team;
    teamData: TeamState;
    characters: Character[];
    lightcones: Lightcone[];
    ruleSet: RuleSet;
    onTeamNameChange: (team: Team, name: string) => void;
    onCharacterUpdate: (team: Team, index: number, updates: Partial<DraftedCharacter>) => void;
    isDraftComplete?: boolean;
    settings?: DraftSettings;
    opponentTeamData?: TeamState;
    resetTrigger?: number;
    draftMode: DraftMode;
    isDraftStarted?: boolean;
    currentPhase?: Turn;
    currentDraftOrder?: Turn[];
    draftState: DraftState;
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
}
function Tooltip({ text, children, disabled }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

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
        <div className="absolute z-[900] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-600 max-w-sm w-max">
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
    currentPhase,
    currentDraftOrder,
    draftState
}: TeamAreaProps) {
    const [editingName, setEditingName] = useState<boolean>(false);
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

    const highlightRoster = (): boolean => ((currentPhase?.team === team) && isDraftStarted && !isDraftComplete) || false;

    const getDraftStepNumbers = (actionType: Action): number[] => {
        if (!currentDraftOrder || currentDraftOrder.length === 0) return [];
        return currentDraftOrder
            .map((turn, index) => ({ turn, step: index }))
            .filter(({ turn }) => turn.team === team && turn.action === actionType)
            .map(({ step }) => step + 1);
    };
    const pickStepNumbers: number[] = getDraftStepNumbers("pick" as Action);
    const banStepNumbers: number[] = getDraftStepNumbers("ban" as Action);

    const isNextInDraftOrder = (actionType: Action): boolean => {
        if (!currentDraftOrder || currentDraftOrder.length === 0 || isDraftComplete) {
            return false;
        }
        
        // Calculate current step index based on total actions taken
        const totalPicksAndBans = teamData.drafted.length + teamData.banned.length + (opponentTeamData?.drafted.length || 0) + (opponentTeamData?.banned.length || 0) + 1;
        
        const nextStepIndex = totalPicksAndBans;
        if (nextStepIndex >= currentDraftOrder.length) return false;
        
        const nextStep = currentDraftOrder[nextStepIndex];
        return nextStep.team === team && nextStep.action === actionType;
    };

    const renderRosterTab = () => (
		<div className="roster">
			{/* Picked characters */}
			<div className="picks">
				<div className="sub-header">
					<h2 className="title">{`Picks (${teamData.drafted?.length ?? 0}/8)`}</h2>

					<h2 className="total-cost">{`Σ ${calculateTotalCost().toFixed(1)}`}</h2>
				</div>

				<div className="characters-container">
					{Array.from({ length: 8 }).map((_, index) => {
						const drafted: DraftedCharacter = teamData.drafted[index];
                        const isCurrentSlot = highlightRoster() && (currentPhase?.action === "pick") && (index === teamData.drafted.length);

                        // For next-up: if it's the same team doing consecutive picks, highlight the slot after current
                        // If it's cross-team, highlight the first empty slot for this team
                        const isNextSlot = isDraftStarted && isNextInDraftOrder("pick" as Action) && (
                            
                            // Ugly fix for consecutive picks
                            (highlightRoster() && currentPhase?.action === "pick") 
                                ? (index === teamData.drafted.length + 1) // Same team consecutive: next slot
                                : (index === teamData.drafted.length)     // Cross team: first empty slot
                        );

						if (!drafted) {
							return (
								<div key={index} className={`slot empty ${isCurrentSlot ? `current` : isNextSlot ? `next-up` : ``}`}>
                                    {isDraftStarted ? (
                                        <h3>
                                            {pickStepNumbers[index] ? (
                                                <span 
                                                    className="order-step"
                                                    style={{ 
                                                        paddingRight: `${String(pickStepNumbers[index]).length * 0.188}rem` // letterSpacing pushes text to the left. This fixes the issue }}
                                                    }}
                                                >
                                                    {pickStepNumbers[index]}
                                                </span>
                                            ) : (
                                                `Empty`
                                            )}
                                        </h3>
                                    ) : (
                                        <h3>{`Empty`}</h3>
                                    )}
								</div>
							);
						}

						const character: Character | undefined = characters.find(c => c._id === drafted.characterId);
						if (!character) return null;

						const characterCost: number = character.cost[ruleSet][drafted.rank];
						const lightcone: Lightcone | undefined = (drafted.lightconeId) ? lightcones.find((l) => l._id === drafted.lightconeId) ?? undefined : undefined;
						const lightconeCost: number = (lightcone && drafted.lightconeRank) ? lightcone.cost[drafted.lightconeRank] : 0;

						return (
							<div
								key={index}
								className="slot"
                                data-rarity={character.rarity}
							>
                                {/* Character IMG */}
                                <img
                                    src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                    className="portrait"
                                    alt={character.display_name}
                                    title={`${character.display_name}`}
                                />
								
                                {/* Character info */}
								<div className="character">
									{/* Combined cost */}
									<h3
										className="total-cost"
										title={`Character: ${characterCost || `-`} cost — LC: ${lightconeCost || `-`} cost`}
									>
										{lightcone
											? `Σ ${characterCost + lightconeCost}`
											: characterCost}
									</h3>

									{/* Verticals (Eidolon/SuperImposition) */}
									<div className="verticals">
										{/* Eidolon */}
										<select
											value={drafted.rank as CharacterRank}
											onChange={e => onCharacterUpdate(team, index, { rank: e.target.value as CharacterRank })}
											className="eidolon focus:outline-none"
                                            name="eidolon"
											style={{
												paddingRight: `${lightcone ? `0` : ``}`,
												marginRight: `${lightcone ? `0` : ``}`,
											}}
										>
											{[...Eidolons].map((rank) => (
												<option key={rank} value={rank} style={{ color: "black" }}>
													{rank}
												</option>
											))}
										</select>

										{/* Imposition */}
										{drafted.lightconeId && (
											<>
												<select
													value={(drafted.lightconeRank || "S1") as LightconeRank}
													onChange={e => onCharacterUpdate(team, index, { lightconeId: drafted.lightconeId, lightconeRank: e.target.value as LightconeRank })}
													className="imposition focus:outline-none"
                                                    name="imposition"
												>
													{[...SuperImpositions].map((rank) => (
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
                                    equippingCharacter={character}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* Banned characters */}
			<div className="bans">
				<h2 className="sub-header">
                    {`Bans (${teamData.banned?.length ?? 0}/${(draftMode === "4ban") ? `2` : (draftMode === "6ban") ? `3` : `0`})`}
                </h2>

				<div className="characters-container">
                    {Array.from({ length: (draftMode === "4ban") ? 2 : (draftMode === "6ban") ? 3 : 0 }).map((_, index) => {
                        const bannedCharacterId: Id<"character"> = teamData.banned[index];
                        const isCurrentSlot = highlightRoster() && (currentPhase?.action === "ban") && (index === teamData.banned.length);

                        // For next-up: if it's the same team doing consecutive bans, highlight the slot after current
                        // If it's cross-team, highlight the first empty slot for this team
                        const isNextSlot = isDraftStarted && isNextInDraftOrder("ban" as Action) && (

                            // Ugly fix for consecutive picks
                            (highlightRoster() && currentPhase?.action === "ban")
                                ? (index === teamData.banned.length + 1) // Same team consecutive: next slot
                                : (index === teamData.banned.length)     // Cross team: first empty slot
                        );

                        if (!bannedCharacterId) {
                            return (
                                <div key={index} className={`slot empty ${isCurrentSlot ? `current` : isNextSlot ? `next-up` : ``}`}>
                                    {isDraftStarted ? (
                                        <h3>
                                            {banStepNumbers[index] ? (
                                                <span 
                                                    className="order-step"
                                                    style={{ 
                                                        paddingRight: `${String(banStepNumbers[index]).length * 0.188}rem` // letterSpacing pushes text to the left. This fixes the issue
                                                    }} 
                                                >
                                                    {banStepNumbers[index]}
                                                </span>
                                            ) : (
                                                `Empty`
                                            )}
                                        </h3>
                                    ) : (
                                        <h3>{`Empty`}</h3>
                                    )}
                                </div>
                            );
                        }

                        const character: Character | undefined = characters.find((c) => c._id === bannedCharacterId);
                        if (!character) return null;

                        return (
                            <div key={index} className="slot" data-rarity={character.rarity}>
                                <img
                                    className="character portrait"
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

    return (
        <div 
            className={`TeamArea Box ${team} ${highlightRoster() ? `active` : ``}`} 
            style={{ animationDuration: (highlightRoster() && draftState.isTimerActive && draftState.phaseTimer <= 0) ? `450ms` : `` }} // Background pulses faster when Reserve Timer is active
        >
            {/* Header - Team [Name/Editor] + Navigation [Draft/Results] */}
            <div className="header">
                {
                    !editingName ? <>
                        {/* Team Name */}
                        <h1 
                            className="title name" 
                            onClick={handleStartEditing}
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
                        className={`tab-button ${(activeTab === "roster") ? `active` : ``}`}
                        onClick={_ => setActiveTab("roster")}
                        style={{ borderTopRightRadius: `0.5rem` }}
                    >
                        {`Roster`}
                    </button>

                    {/* Results button */}
                    <Tooltip text="Draft must be completed first!" disabled={isDraftComplete}>
                        <button
                            className={`tab-button ${(activeTab === "result") ? `active` : ``}`}
                            onClick={_ => isDraftComplete && setActiveTab("result")}
                            disabled={!isDraftComplete}
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
}