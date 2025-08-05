import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CharacterPool } from "./CharacterPool";
import { TeamArea } from "./TeamArea";
import { DraftControls } from "./DraftControls";
import { CostTables } from "./CostTables";
import { DraftProgress } from "./DraftProgress";
import { TeamTest } from "./TeamTest";
import { Contact } from "./Contact";
import { DraftTimer } from "./DraftTimer";
import { DraftingSettings } from "./DraftingSettings";
import { CurrentActiveSettings } from "./CurrentActiveSettings";
import { Id } from "../../convex/_generated/dataModel";
import "../css/DraftingInterface.css";

export type RuleSet = "memoryofchaos" | "apocalypticshadow";
export type DraftMode = "4ban" | "6ban";
export type CharacterRank = "E0" | "E1" | "E2" | "E3" | "E4" | "E5" | "E6";
export type LightconeRank = "S1" | "S2" | "S3" | "S4" | "S5";

export interface DraftedCharacter {
	characterId: Id<"character">;
	rank: CharacterRank;
	lightconeId?: Id<"lightcones">;
	lightconeRank?: LightconeRank;
}

// Selected (picked / banned) by any team
export interface SelectedCharacter { 
    characterId: Id<"character">;
    action: "pick" | "ban";
};

export type BanRestriction =
	| "none"
	| "onePerRole"
	| "oneDPS"
	| "oneSupport"
	| "oneSustain";

export interface MoCSettings {
	rosterDifferenceAdvantagePerPoint: number; // final value multiplied by -1
	rosterThreshold: number;
	underThresholdAdvantagePerPoint: number; // final value multiplied by -1
	aboveThresholdPenaltyPerPoint: number;
	deathPenalty: number;
}

export interface ApocSettings {
	rosterDifferenceAdvantagePerPoint: number;
	rosterThreshold: number;
	underThresholdAdvantagePerPoint: number;
	aboveThresholdPenaltyPerPoint: number; // final value multiplied by -1
	deathPenalty: number; // final value multiplied by -1
}

export interface DraftSettings {
	phaseTime: number; // in seconds
	reserveTime: number; // in seconds
	banRestriction: BanRestriction;
	mocSettings: MoCSettings;
	apocSettings: ApocSettings;
}

export interface DraftState {
	blueTeam: {
		name: string;
		drafted: DraftedCharacter[];
		banned: Id<"character">[];
		reserveTime: number; // in seconds
	};
	redTeam: {
		name: string;
		drafted: DraftedCharacter[];
		banned: Id<"character">[];
		reserveTime: number; // in seconds
	};
	currentStep: number;
	ruleSet: RuleSet;
	draftMode: DraftMode;
	history: DraftState[];
	phaseTimer: number; // in seconds
	isTimerActive: boolean;
	isDraftStarted: boolean;
	settings: DraftSettings;
}

const DRAFT_ORDERS = {
	"4ban": [
		{ team: "blue", action: "ban" },
		{ team: "red", action: "ban" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "blue", action: "ban" },
		{ team: "red", action: "ban" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "pick" },
	],
	"6ban": [
		{ team: "blue", action: "ban" },
		{ team: "red", action: "ban" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "ban" },
		{ team: "blue", action: "ban" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "ban" },
		{ team: "red", action: "ban" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "blue", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "red", action: "pick" },
		{ team: "blue", action: "pick" },
	],
};

const DEFAULT_PHASE_TIME = 30; // 30 seconds per phase
const DEFAULT_RESERVE_TIME = 480; // 8 minutes (480 seconds) reserve time per team
const DEFAULT_BAN_RESTRICTION: BanRestriction = "none";

const DEFAULT_MOC_SETTINGS: MoCSettings = {
	rosterDifferenceAdvantagePerPoint: 0,
	rosterThreshold: 45.0,
	underThresholdAdvantagePerPoint: 0.25,
	aboveThresholdPenaltyPerPoint: 0.1667,
	deathPenalty: 0.25,
};

const DEFAULT_APOC_SETTINGS: ApocSettings = {
	rosterDifferenceAdvantagePerPoint: 40.0,
	rosterThreshold: 50.0,
	underThresholdAdvantagePerPoint: 0.0,
	aboveThresholdPenaltyPerPoint: 0.0,
	deathPenalty: 100.0,
};

const checkBanRestriction = (
	character: any,
	bannedCharacters: any[],
	restriction: BanRestriction
) => {
	switch (restriction) {
		case "onePerRole":
			return !bannedCharacters.some((banned) => banned.role === character.role);

		case "oneDPS":
			if (character.role === "dps") {
				return !bannedCharacters.some((banned) => banned.role === "dps");
			}
			return true;

		case "oneSupport":
			if (character.role === "support") {
				return !bannedCharacters.some((banned) => banned.role === "support");
			}
			return true;

		case "oneSustain":
			if (character.role === "sustain") {
				return !bannedCharacters.some((banned) => banned.role === "sustain");
			}
			return true;

		default:
			return true;
	}
};

export function DraftingInterface() {
	const characters = useQuery(api.characters.list) || [];
	const lightcones = useQuery(api.lightcones.list) || [];
    const [testTeam, setTestTeam] = useState<DraftedCharacter[]>([]);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

	const [draftState, setDraftState] = useState<DraftState>({
		blueTeam: {
			name: "Blue Team",
			drafted: [],
			banned: [],
			reserveTime: DEFAULT_RESERVE_TIME,
		},
		redTeam: {
			name: "Red Team",
			drafted: [],
			banned: [],
			reserveTime: DEFAULT_RESERVE_TIME,
		},
		currentStep: 0,
		ruleSet: "apocalypticshadow",
		draftMode: "4ban",
		history: [],
		phaseTimer: DEFAULT_PHASE_TIME,
		isTimerActive: false,
		isDraftStarted: false,
		settings: {
			phaseTime: DEFAULT_PHASE_TIME,
			reserveTime: DEFAULT_RESERVE_TIME,
			banRestriction: DEFAULT_BAN_RESTRICTION,
			mocSettings: DEFAULT_MOC_SETTINGS,
			apocSettings: DEFAULT_APOC_SETTINGS,
		},
	});

	const [activeTab, setActiveTab] = useState<
		"draft" | "costs" | "teamtest" | "contact"
	>("draft");

	const toolbarRef = useRef<HTMLDivElement>(null);

	const currentDraftOrder = DRAFT_ORDERS[draftState.draftMode];
	const currentPhase = currentDraftOrder[draftState.currentStep];
	const isDraftComplete = draftState.currentStep >= currentDraftOrder.length;

	// Timer effect
	useEffect(() => {
		if (!draftState.isTimerActive || isDraftComplete) return;

		const interval = setInterval(() => {
			setDraftState((prev) => {
				if (prev.phaseTimer > 0) {
					// Phase timer counting down
					return {
						...prev,
						phaseTimer: prev.phaseTimer - 1,
					};
				} else {
					// Phase timer expired, use reserve time
					const currentTeam =
						currentPhase?.team === "blue" ? "blueTeam" : "redTeam";
					const newReserveTime = prev[currentTeam].reserveTime - 1;

					if (newReserveTime <= 0) {
						return {
							...prev,
							[currentTeam]: {
								...prev[currentTeam],
								reserveTime: 0,
							},
						};
					}

					return {
						...prev,
						[currentTeam]: {
							...prev[currentTeam],
							reserveTime: newReserveTime,
						},
					};
				}
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [draftState.isTimerActive, isDraftComplete, currentPhase, characters]);

	// Auto-select when reserve time hits 0
	useEffect(() => {
		if (!draftState.isDraftStarted || isDraftComplete || !currentPhase) return;

		const currentTeam =
			currentPhase.team === "blue" ? draftState.blueTeam : draftState.redTeam;

		if (currentTeam.reserveTime === 0 && draftState.phaseTimer <= 0) {
			const selectedCharacters = getAllSelectedCharacters();
			const availableCharacters = characters.filter(char => !selectedCharacters.some(selected => selected.characterId === char._id));

			if (availableCharacters.length > 0) {
				const randomCharacter =
					availableCharacters[
						Math.floor(Math.random() * availableCharacters.length)
					];
				handleCharacterSelect(randomCharacter._id, true);
			}
		}
	}, [
		draftState.blueTeam.reserveTime,
		draftState.redTeam.reserveTime,
		draftState.phaseTimer,
	]);

	const getAllSelectedCharacters = (): SelectedCharacter[] => {
		return [
			...draftState.blueTeam.drafted.map(char => ({ characterId: char.characterId, action: "pick" } as SelectedCharacter)),
			...draftState.redTeam.drafted.map(char => ({ characterId: char.characterId, action: "pick" } as SelectedCharacter)),
			...draftState.blueTeam.banned.map(characterId => ({ characterId, action: "ban" } as SelectedCharacter)),
			...draftState.redTeam.banned.map(characterId => ({ characterId, action: "ban" } as SelectedCharacter)),
		];
	};

	const canBanCharacter = (
		characterId: Id<"character">,
		team: "blue" | "red"
	) => {
		if (draftState.settings.banRestriction === "none") {
			return true;
		}

		const character = characters.find((c) => c._id === characterId);
		if (!character) return false;

		const teamData = team === "blue" ? draftState.blueTeam : draftState.redTeam;
		const bannedCharacters = teamData.banned
			.map((id) => characters.find((c) => c._id === id))
			.filter(Boolean);

		return checkBanRestriction(
			character,
			bannedCharacters,
			draftState.settings.banRestriction
		);
	};

	const preserveLightconeSelections = (prevTeam: any, currentTeam: any) => {
		return {
			...prevTeam,
			drafted: prevTeam.drafted.map((prevChar: any, index: number) => {
				const currentChar = currentTeam.drafted[index];
				if (currentChar && currentChar.characterId === prevChar.characterId) {
					// Preserve the current lightcone selections and eidolon rank
					return {
						...prevChar,
						rank: currentChar.rank, // Preserve eidolon rank
						lightconeId: currentChar.lightconeId,
						lightconeRank: currentChar.lightconeRank,
					};
				}
				return prevChar;
			}),
		};
	};

	const handleCharacterSelect = (
		characterId: Id<"character">,
		isAutoSelect = false
	) => {
		if (isDraftComplete || !currentPhase) return;
		if (!draftState.isDraftStarted && !isAutoSelect) return;

		// Check ban restrictions for ban actions
		if (currentPhase.action === "ban" && !isAutoSelect) {
			if (!canBanCharacter(characterId, currentPhase.team as "blue" | "red")) {
				return; // Don't allow the ban if it violates restrictions
			}
		}

		// Create a deep copy of the current state for history
		const currentStateForHistory: DraftState = {
			blueTeam: {
				name: draftState.blueTeam.name,
				drafted: [...draftState.blueTeam.drafted.map((d) => ({ ...d }))],
				banned: [...draftState.blueTeam.banned],
				reserveTime: draftState.blueTeam.reserveTime,
			},
			redTeam: {
				name: draftState.redTeam.name,
				drafted: [...draftState.redTeam.drafted.map((d) => ({ ...d }))],
				banned: [...draftState.redTeam.banned],
				reserveTime: draftState.redTeam.reserveTime,
			},
			currentStep: draftState.currentStep,
			ruleSet: draftState.ruleSet,
			draftMode: draftState.draftMode,
			history: [...draftState.history],
			phaseTimer: draftState.phaseTimer,
			isTimerActive: draftState.isTimerActive,
			isDraftStarted: draftState.isDraftStarted,
			settings: { ...draftState.settings },
		};

		const newState = { ...draftState };
		newState.history = [...draftState.history, currentStateForHistory];

		if (currentPhase.action === "ban") {
			if (currentPhase.team === "blue") {
				newState.blueTeam = {
					...newState.blueTeam,
					banned: [...newState.blueTeam.banned, characterId],
				};
			} else {
				newState.redTeam = {
					...newState.redTeam,
					banned: [...newState.redTeam.banned, characterId],
				};
			}
		} else {
			const draftedChar: DraftedCharacter = {
				characterId,
				rank: "E0",
			};

			if (currentPhase.team === "blue") {
				newState.blueTeam = {
					...newState.blueTeam,
					drafted: [...newState.blueTeam.drafted, draftedChar],
				};
			} else {
				newState.redTeam = {
					...newState.redTeam,
					drafted: [...newState.redTeam.drafted, draftedChar],
				};
			}
		}

		newState.currentStep++;
		newState.phaseTimer = draftState.settings.phaseTime; // Reset phase timer using settings
		setDraftState(newState);
	};

	const handleUndo = () => {
		if (draftState.history.length > 0) {
			const previousState = draftState.history[draftState.history.length - 1];

			// Create new history without the last entry
			const newHistory = previousState.history;

			const newState = {
				...previousState,
				history: newHistory, // Use the history from the previous state
				blueTeam: {
					...preserveLightconeSelections(
						previousState.blueTeam,
						draftState.blueTeam
					),
					reserveTime: previousState.blueTeam.reserveTime,
				},
				redTeam: {
					...preserveLightconeSelections(
						previousState.redTeam,
						draftState.redTeam
					),
					reserveTime: previousState.redTeam.reserveTime,
				},
				phaseTimer: draftState.settings.phaseTime, // Reset phase timer using settings
				settings: { ...draftState.settings }, // Preserve current settings
			};

			setDraftState(newState);
		}
	};

	const [resetTrigger, setResetTrigger] = useState(0);

	const handleReset = () => {
		setDraftState({
			blueTeam: {
				name: "Blue Team",
				drafted: [],
				banned: [],
				reserveTime: draftState.settings.reserveTime,
			},
			redTeam: {
				name: "Red Team",
				drafted: [],
				banned: [],
				reserveTime: draftState.settings.reserveTime,
			},
			currentStep: 0,
			ruleSet: draftState.ruleSet,
			draftMode: draftState.draftMode,
			history: [],
			phaseTimer: draftState.settings.phaseTime,
			isTimerActive: false,
			isDraftStarted: false,
			settings: { ...draftState.settings }, // Preserve current settings
		});
		// Trigger reset for TeamArea components
		setResetTrigger((prev) => prev + 1);
	};

	const handleStartDraft = () => {
		setDraftState((prev) => ({
			...prev,
			isDraftStarted: true,
			isTimerActive: true,
			phaseTimer: prev.settings.phaseTime,
		}));
	};

	const handlePauseDraft = () => {
		setDraftState((prev) => ({
			...prev,
			isTimerActive: !prev.isTimerActive,
		}));
	};

	const handleTeamNameChange = (team: "blue" | "red", name: string) => {
		setDraftState((prev) => ({
			...prev,
			[team === "blue" ? "blueTeam" : "redTeam"]: {
				...prev[team === "blue" ? "blueTeam" : "redTeam"],
				name,
			},
		}));
	};

	const handleCharacterUpdate = (
		team: "blue" | "red",
		index: number,
		updates: Partial<DraftedCharacter>
	) => {
		setDraftState((prev) => {
			const teamKey = team === "blue" ? "blueTeam" : "redTeam";
			const newTeam = { ...prev[teamKey] };
			newTeam.drafted = [...newTeam.drafted];
			newTeam.drafted[index] = { ...newTeam.drafted[index], ...updates };

			return {
				...prev,
				[teamKey]: newTeam,
			};
		});
	};

	const handleSettingsChange = (newSettings: DraftSettings) => {
		setDraftState((prev) => ({
			...prev,
			settings: newSettings,
			// Update team reserve times if they haven't been modified from default
			blueTeam: {
				...prev.blueTeam,
				reserveTime:
					prev.blueTeam.reserveTime === prev.settings.reserveTime
						? newSettings.reserveTime
						: prev.blueTeam.reserveTime,
			},
			redTeam: {
				...prev.redTeam,
				reserveTime:
					prev.redTeam.reserveTime === prev.settings.reserveTime
						? newSettings.reserveTime
						: prev.redTeam.reserveTime,
			},
			// Update phase timer if draft hasn't started
			phaseTimer: !prev.isDraftStarted
				? newSettings.phaseTime
				: prev.phaseTimer,
		}));
	};

	useEffect(() => {
        // window.scrollTo({ top: 250, behavior: 'smooth' }); maybe?
	}, [draftState.currentStep]);

	// Handle sticky toolbar background
	useEffect(() => {
		const handleScroll = () => {
			if (toolbarRef.current) {
				const rect = toolbarRef.current.getBoundingClientRect();
				const isSticky = rect.top <= 0;
				
				if (isSticky) {
					toolbarRef.current.classList.add('sticky');
				} else {
					toolbarRef.current.classList.remove('sticky');
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div className="DraftingInterface">
			{/* Tab Navigation */}
			<div className="tabs Box">
				<button
					onClick={() => setActiveTab("draft")}
					className={`rounded-tl-lg`}
					style={
						activeTab === "draft"
							? { background: `rgb(8, 145, 178)`, color: `white` }
							: undefined
					}
				>
					{`Draft`}
				</button>
				<button
					onClick={() => setActiveTab("teamtest")}
					style={
						activeTab === "teamtest"
							? { background: `rgb(8, 145, 178)`, color: `white` }
							: undefined
					}
				>
					{`Team Test`}
				</button>
				<button
					onClick={() => setActiveTab("costs")}
					style={
						activeTab === "costs"
							? { background: `rgb(8, 145, 178)`, color: `white` }
							: undefined
					}
				>
					{`Costs Tables`}
				</button>
				<button
					onClick={() => setActiveTab("contact")}
					className={`rounded-tr-lg`}
					style={
						activeTab === "contact"
							? { background: `rgb(8, 145, 178)`, color: `white` }
							: undefined
					}
				>
					{`Contact`}
				</button>
			</div>

            {
                (activeTab === "draft") && <>
                    <div className="toolbar" ref={toolbarRef}>
                        <DraftProgress
                            currentDraftOrder={currentDraftOrder}
                            currentStep={draftState.currentStep}
                        />
                        
                        <DraftTimer
                            draftState={draftState}
                            currentPhase={currentPhase}
                            isDraftComplete={isDraftComplete}
                        />

                        <DraftControls
                            draftState={draftState}
                            onUndo={handleUndo}
                            onReset={handleReset}
                            onStartDraft={handleStartDraft}
                            onPauseDraft={handlePauseDraft}
                            currentPhase={currentPhase}
                            isDraftComplete={isDraftComplete}
                            canUndo={draftState.history.length > 0}
                            onOpenSettings={() => setIsSettingsModalOpen(true)}
                        />
                    </div>

					<div className="main" id="draft">
                        <TeamArea
							team="blue"
							teamData={draftState.blueTeam}
							characters={characters}
							lightcones={lightcones}
							ruleSet={draftState.ruleSet}
							onTeamNameChange={handleTeamNameChange}
							onCharacterUpdate={handleCharacterUpdate}
							isDraftComplete={isDraftComplete}
							settings={draftState.settings}
							opponentTeamData={draftState.redTeam}
							resetTrigger={resetTrigger}
                            draftMode={draftState.draftMode}
                            isDraftStarted={draftState.isDraftStarted}
                            isActiveTurn={currentPhase?.team === "blue"}
						/>

						<TeamArea
							team="red"
							teamData={draftState.redTeam}
							characters={characters}
							lightcones={lightcones}
							ruleSet={draftState.ruleSet}
							onTeamNameChange={handleTeamNameChange}
							onCharacterUpdate={handleCharacterUpdate}
							isDraftComplete={isDraftComplete}
							settings={draftState.settings}
							opponentTeamData={draftState.blueTeam}
							resetTrigger={resetTrigger}
                            draftMode={draftState.draftMode}
                            isDraftStarted={draftState.isDraftStarted}
                            isActiveTurn={currentPhase?.team === "red"}
						/>
					</div>

					<CharacterPool
						characters={characters}
						selectedCharacters={getAllSelectedCharacters()}
						onCharacterSelect={handleCharacterSelect}
						currentPhase={currentPhase}
						isDraftComplete={isDraftComplete}
						isDraftStarted={draftState.isDraftStarted}
						canBanCharacter={canBanCharacter}
					/>

					<CurrentActiveSettings
						settings={draftState.settings}
						ruleSet={draftState.ruleSet}
						draftMode={draftState.draftMode}
					/>
                </>
            }
            {
                (activeTab === "teamtest") && <TeamTest characters={characters} lightcones={lightcones} teamState={{ testTeam, setTestTeam }} />
            }
            {
                (activeTab === "costs") && <CostTables characters={characters} lightcones={lightcones} />
            }
            {
                (activeTab === "contact") && <Contact />
            }

			{/* Settings Modal */}
			<DraftingSettings
				settings={draftState.settings}
				onSettingsChange={handleSettingsChange}
				isDraftInProgress={draftState.isDraftStarted && !isDraftComplete}
				draftState={draftState}
				onRuleSetChange={(ruleSet) =>
					setDraftState((prev) => ({ ...prev, ruleSet }))
				}
				onDraftModeChange={(draftMode) =>
					setDraftState((prev) => ({ ...prev, draftMode }))
				}
				isOpen={isSettingsModalOpen}
				onClose={() => setIsSettingsModalOpen(false)}
			/>
		</div>
	);
}
