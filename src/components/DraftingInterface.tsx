import { useState, useEffect, useRef, JSX } from "react";
import { CharacterPool } from "./CharacterPool";
import { TeamArea } from "./TeamArea";
import { DraftControls } from "./DraftControls";
import { DraftProgress } from "./DraftProgress";
import { DraftTimer } from "./DraftTimer";
import { DEFAULT_PHASE_TIME, DEFAULT_RESERVE_TIME, DEFAULT_BAN_RESTRICTION, DEFAULT_MOC_SETTINGS, DEFAULT_APOC_SETTINGS } from "./DraftingSettings";
import { CurrentActiveSettings } from "./CurrentActiveSettings";
import { Id } from "../../convex/_generated/dataModel";
import "../css/DraftingInterface.css";
import { createPortal } from "react-dom";
import { Action, Character, CharacterRank, Lightcone, LightconeRank, Team, Turn } from "@/lib/utils";
import { toast } from "sonner";

export type RuleSet = "memoryofchaos" | "apocalypticshadow";
export type DraftMode = "4ban" | "6ban";
export type BanRestriction = "none" | "onePerRole" | "oneDPS" | "oneSupport" | "oneSustain";

export interface TeamState {
    name: string;
    drafted: DraftedCharacter[];
    banned: Id<"character">[];
    reserveTime: number; // in seconds
}

export interface DraftedCharacter {
	characterId: Id<"character">;
	rank: CharacterRank;
	lightconeId?: Id<"lightcones">;
	lightconeRank?: LightconeRank;
}

// Selected (picked / banned) by any team
export interface SelectedCharacter { 
    characterId: Id<"character">;
    action: Action;
};

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
	blueTeam: TeamState;
	redTeam: TeamState;
	currentStep: number;
	ruleSet: RuleSet;
	draftMode: DraftMode;
	history: DraftState[];
	phaseTimer: number; // in seconds
	isTimerActive: boolean;
	isDraftStarted: boolean;
	settings: DraftSettings;
}

const DRAFT_ORDERS: Record<DraftMode, Turn[]> = {
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

const checkBanRestriction = (
	character: Character,
	bannedCharacters: Character[],
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

interface DraftingInterfaceProps {
    characters: Character[];
    lightcones: Lightcone[];
    isVisible?: boolean
}

export function DraftingInterface({ characters, lightcones, isVisible }: DraftingInterfaceProps) {
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

	const toolbarRef = useRef<HTMLDivElement>(null);
    const [showToolbarOverlay, setShowToolbarOverlay] = useState<boolean>(false);
    const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop");

	const currentDraftOrder: Turn[] = DRAFT_ORDERS[draftState.draftMode];
	const currentPhase: Turn = currentDraftOrder[draftState.currentStep];
	const isDraftComplete: boolean = draftState.currentStep >= currentDraftOrder.length;

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
					const currentTeam = (currentPhase?.team === "blue") ? "blueTeam" : "redTeam";
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

		const currentTeam = (currentPhase.team === "blue") ? draftState.blueTeam : draftState.redTeam;

		if (currentTeam.reserveTime === 0 && draftState.phaseTimer <= 0) {
			const selectedCharacters = getAllSelectedCharacters();
			const availableCharacters = characters.filter(char => !selectedCharacters.some(selected => selected.characterId === char._id));

			if (availableCharacters.length > 0) {
				const randomCharacter =
					availableCharacters[
						Math.floor(Math.random() * availableCharacters.length)
					];
				handleCharacterSelect(randomCharacter, true);
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
		team: Team
	) => {
		if (draftState.settings.banRestriction === "none") {
			return true;
		}

		const character = characters.find((c) => c._id === characterId);
		if (!character) return false;

		const teamData = (team === "blue") ? draftState.blueTeam : draftState.redTeam;
		const bannedCharacters = teamData.banned
			.map((id) => characters.find((c) => c._id === id))
			.filter((character): character is Character => character !== undefined); // Filter out undefined values

		return checkBanRestriction(
			character,
			bannedCharacters,
			draftState.settings.banRestriction
		);
	};

	const preserveLightconeSelections = (prevTeam: TeamState, currentTeam: TeamState) => {
		return {
			...prevTeam,
			drafted: prevTeam.drafted.map((prevChar: DraftedCharacter, index: number) => {
				const currentChar: DraftedCharacter = currentTeam.drafted[index];
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
		character: Character,
		isAutoSelect = false
	) => {
		if (isDraftComplete || !currentPhase) return;
		if (!draftState.isDraftStarted && !isAutoSelect) return;

		// Check ban restrictions for ban actions
		if (currentPhase.action === "ban" && !isAutoSelect) {
			if (!canBanCharacter(character._id, currentPhase.team)) {
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
					banned: [...newState.blueTeam.banned, character._id],
				};
			} else {
				newState.redTeam = {
					...newState.redTeam,
					banned: [...newState.redTeam.banned, character._id],
				};
			}
		} else {
			const draftedChar: DraftedCharacter = {
				characterId: character._id,
				rank: getCharacterRank(character),
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

	const handleTeamNameChange = (team: Team, name: string) => {
		setDraftState((prev) => ({
			...prev,
			[(team === "blue") ? "blueTeam" : "redTeam"]: {
				...prev[(team === "blue") ? "blueTeam" : "redTeam"],
				name,
			},
		}));
	};

	const handleCharacterUpdate = (
		team: Team,
		index: number,
		updates: Partial<DraftedCharacter>
	) => {
		setDraftState((prev) => {
			const teamKey = (team === "blue") ? "blueTeam" : "redTeam";
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
        toast.success("Changes applied to configuration");
	};

    const getCharacterRank = (character: Character): CharacterRank => {
        if (character.rarity !== 5) return "E6"; // Default 4-star Characters to be E6
        if (character.display_name.startsWith("MC ")) return "E6"; // Default Trailblazer variations are E6
        return "E0";
    }

    // Keeps track of the size of the screen, and adjusts the Toolbar Overlay accordingly
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width <= 768) {
                setScreenSize("mobile");
            } else if (width <= 1070) {
                setScreenSize("tablet");
            } else {
                setScreenSize("desktop");
            }
        };

        const handleScroll = () => {
            if (toolbarRef.current) {
                const rect = toolbarRef.current.getBoundingClientRect();
                const shouldShowOverlay = rect.bottom <= -48;
                setShowToolbarOverlay(shouldShowOverlay);
            }
        };

        checkScreenSize();
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', checkScreenSize);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const getToolbarContent = (isOverlay: boolean): JSX.Element => {
        const content = (
            <>
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
                    onSettingsChange={handleSettingsChange}
                    onRuleSetChange={(ruleSet) => setDraftState((prev) => ({ ...prev, ruleSet }))}
                    onDraftModeChange={(draftMode) => setDraftState((prev) => ({ ...prev, draftMode }))}
                />
            </>
        );

        /**
         * Wrapping a new toolbar <div> with '.toolbar' inside an overlay '.toolbar-overlay'
         * in order to apply the usual toolbar CSS inside the new container
         * 
         * Overlay's appearance changes depending on device:
         *   Desktop - one row of gird items side-by-side
         *   Tablet - two rows of grid, one item spans both
         *   Mobile - only show DraftTimer
         */
        if (isOverlay) {
            return (
                <div className={`toolbar ${screenSize}`}>
                    {(screenSize !== "mobile") ? <>
                        { content }
                    </> : <>
                        <DraftTimer
                            draftState={draftState}
                            currentPhase={currentPhase}
                            isDraftComplete={isDraftComplete}
                        />
                    </>}
                </div>
            )
        }

        // Non-Overlay Toolbar always shows everything
        return content;
    };

	return (
		<div className="DraftingInterface" style={{ display: (!isVisible ? `none` : ``) }}>
            {/* Toolbar */}
            <div className={`toolbar ${screenSize}`} ref={toolbarRef}>
                {getToolbarContent(false)}
            </div>

            {/* Overlay Toolbar - appears when out of vision */}
            {(isVisible && showToolbarOverlay) && createPortal(
                <div className="toolbar-overlay">
                    {getToolbarContent(true)}
                </div>,
                document.body
            )}

            {/* Blue+Red Rosters */}
            <div className="rosters" id="draft">
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
                    currentPhase={currentPhase}
                    currentDraftOrder={currentDraftOrder}
                    draftState={draftState}
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
                    currentPhase={currentPhase}
                    currentDraftOrder={currentDraftOrder}
                    draftState={draftState}
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
		</div>
	);
}
