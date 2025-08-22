import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { RuleSet, DraftedCharacter, SelectedCharacter } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import { CharacterPool } from "./CharacterPool";
import "../css/TeamTest.css";
import LightconeSelector from "./LightconeSelector";
import { Character, CharacterRank, Eidolons, Element, Lightcone, LightconeRank, Path, SuperImpositions, UniqueElements, UniquePaths } from "@/lib/utils";
import LoadoutManager, { Loadout, LoadoutCharacter, teamSize } from "@/lib/LoadoutManager";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import ScreenshotButton from "./ScreenshotButton";
import { createPortal } from "react-dom";

ChartJS.register(CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,ChartDataLabels);

const ClearIcon: React.FC = () => (
    <svg 
        width="1.375rem" 
        height="1.375rem" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const EditIcon: React.FC = () => (
    <svg 
        width="1rem" 
        height="1rem"    
        viewBox="0 0 528.899 528.899" 
        fill="white" 
        xmlns="http://www.w3.org/2000/svg" 
        style={{ cursor: `text` }}
    >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier"> 
            <g>
                <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path> 
            </g>
        </g>
    </svg>
);
const DropdownIcon = ({ isOpen = false }) => (
  <svg 
    width="1.5rem" 
    height="1.5rem" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <path 
      d="M4 6L8 10L12 6" 
      stroke="rgb(229, 203, 148)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

interface RightDropdownProps {
    children: ReactNode;
}
const RightDropdown: React.FC<RightDropdownProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const closeDropdown = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown when any button inside is clicked
    useEffect(() => {
        const handleButtonClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if the clicked element is inside a button within the dropdown
            if (dropdownRef.current && dropdownRef.current.contains(target)) {
                const closestButton = target.closest('button');
                if (closestButton && dropdownRef.current.contains(closestButton)) {
                    closeDropdown();
                }
            }
        };

        if (isOpen) {
            document.addEventListener("click", handleButtonClick);
        }

        return () => {
            document.removeEventListener("click", handleButtonClick);
        };
    }, [isOpen]);

    return (
        <div className="rosters">
            <button
                ref={triggerRef}
                onClick={_ => setIsOpen(!isOpen)}
                className="select-button"
                title="Select Team"
            >
                <DropdownIcon isOpen={isOpen} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="rosters-list" ref={dropdownRef}>
                    {children}
                </div>
            )}
        </div>
    );
};

interface PresetTeam {
    name: string;
    characters: DraftedCharacter[];
}

interface PresetTeamTemplate {
    name: string;
    characters: Partial<LoadoutCharacter>[];
}

const presetTeamTemplates: PresetTeamTemplate[] = [
    {
        name: "Phainon",
        characters: [
            { characterName: "Phainon", rank: "E0", lightconeName: "Thus Burns the Dawn", lightconeRank: "S1" },
            { characterName: "Cerydra", rank: "E0", lightconeName: "Epoch Etched in Golden Blood", lightconeRank: "S1" },
            { characterName: "Sunday", rank: "E0", lightconeName: "A Grounded Ascent", lightconeRank: "S1" },
            { characterName: "Bronya", rank: "E0", lightconeName: "But the Battle Isn't Over", lightconeRank: "S1" },
        ]
    },
    {
        name: "Castorice",
        characters: [
            { characterName: "Castorice", rank: "E0", lightconeName: "Make Farewells More Beautiful", lightconeRank: "S1" },
            { characterName: "Tribbie", rank: "E0", lightconeName: "If Time Were a Flower", lightconeRank: "S1" },
            { characterName: "Hyacine", rank: "E0", lightconeName: "Long May Rainbows Adorn the Sky", lightconeRank: "S1" },
            { characterName: "MC Remembrance", rank: "E6", lightconeName: "Sailing Towards A Second Life", lightconeRank: "S5" },
        ]
    },
    {
        name: "Saber",
        characters: [
            { characterName: "Saber", rank: "E0", lightconeName: "A Thankless Coronation", lightconeRank: "S1" },
            { characterName: "Sunday", rank: "E0", lightconeName: "A Grounded Ascent", lightconeRank: "S1" },
            { characterName: "Robin", rank: "E0", lightconeName: "Flowing Nightglow", lightconeRank: "S1" },
            { characterName: "Huohuo", rank: "E0", lightconeName: "Night of Fright", lightconeRank: "S1" },
        ]
    },
    {
        name: "Archer",
        characters: [
            { characterName: "Archer", rank: "E0", lightconeName: "The Hell Where Ideals Burn", lightconeRank: "S1" },
            { characterName: "Sparkle", rank: "E0", lightconeName: "Earthly Escapade", lightconeRank: "S1" },
            { characterName: "Silver Wolf", rank: "E0", lightconeName: "Incessant Rain", lightconeRank: "S1" },
            { characterName: "Gallagher", rank: "E6", lightconeName: "Quid Pro Quo", lightconeRank: "S5" },
        ]
    },
    {
        name: "Acheron",
        characters: [
            { characterName: "Acheron", rank: "E0", lightconeName: "Along the Passing Shore", lightconeRank: "S1" },
            { characterName: "Cipher", rank: "E0", lightconeName: "Lies Dance on the Breeze", lightconeRank: "S1" },
            { characterName: "Jiaoqiu", rank: "E0", lightconeName: "Those Many Springs", lightconeRank: "S1" },
            { characterName: "Aventurine", rank: "E0", lightconeName: "Inherently Unjust Destiny", lightconeRank: "S1" },
        ]
    },
    {
        name: "Feixiao",
        characters: [
            { characterName: "Feixiao", rank: "E0", lightconeName: "I Venture Forth to Hunt", lightconeRank: "S1" },
            { characterName: "Topaz", rank: "E0", lightconeName: "Worrisome, Blissful", lightconeRank: "S1" },
            { characterName: "Robin", rank: "E0", lightconeName: "Flowing Nightglow", lightconeRank: "S1" },
            { characterName: "Aventurine", rank: "E0", lightconeName: "Inherently Unjust Destiny", lightconeRank: "S1" },
        ]
    },
    {
        name: "Firefly",
        characters: [
            { characterName: "Firefly", rank: "E0", lightconeName: "Whereabouts Should Dreams Rest", lightconeRank: "S1" },
            { characterName: "Fugue", rank: "E0", lightconeName: "Long Road Leads Home", lightconeRank: "S1" },
            { characterName: "Lingsha", rank: "E0", lightconeName: "Scent Alone Stays True", lightconeRank: "S1" },
            { characterName: "Ruan Mei", rank: "E0", lightconeName: "Past Self in Mirror", lightconeRank: "S1" },
        ]
    },
    {
        name: "DoT Kafka",
        characters: [
            { characterName: "Kafka", rank: "E0", lightconeName: "Patience Is All You Need", lightconeRank: "S1" },
            { characterName: "Hysilens", rank: "E0", lightconeName: "Why Does the Ocean Sing", lightconeRank: "S1" },
            { characterName: "Black Swan", rank: "E0", lightconeName: "Reforged Remembrance", lightconeRank: "S1" },
            { characterName: "Huohuo", rank: "E0", lightconeName: "Night of Fright", lightconeRank: "S1" },
        ]
    },
    {
        name: "The Herta",
        characters: [
            { characterName: "The Herta", rank: "E0", lightconeName: "Into the Unreachable Veil", lightconeRank: "S1" },
            { characterName: "Anaxa", rank: "E0", lightconeName: "Life Should Be Cast to Flames", lightconeRank: "S1" },
            { characterName: "Tribbie", rank: "E0", lightconeName: "If Time Were a Flower", lightconeRank: "S1" },
            { characterName: "Lingsha", rank: "E0", lightconeName: "Scent Alone Stays True", lightconeRank: "S1" },
        ]
    }
];

// Helper function to convert template to actual preset team
const convertTemplateToLoadoutTeam = (template: PresetTeamTemplate, characters: Character[], lightcones: Lightcone[]): LoadoutCharacter[] => {
    const convertedCharacters: LoadoutCharacter[] = template.characters.map(templateChar => {
        const character = characters.find(c => c.display_name === templateChar.characterName);
        if (!character) {
            console.warn(`Character not found: ${templateChar.characterName}`);
            return null;
        }

        let lightconeId: Id<"lightcones"> | undefined;
        if (templateChar.lightconeName) {
            const lightcone = lightcones.find(l => l.display_name === templateChar.lightconeName);
            if (lightcone) {
                lightconeId = lightcone._id;
            } else {
                console.warn(`Lightcone not found: ${templateChar.lightconeName}`);
            }
        }

        return {
            characterId: character._id,
            characterName: character.name,
            rank: templateChar.rank,
            lightconeId: lightconeId,
            lightconeName: templateChar.lightconeName,
            lightconeRank: templateChar.lightconeRank
        };
    }).filter(Boolean) as LoadoutCharacter[];

    return convertedCharacters;
};

interface PresetTeamsDropdownProps {
    onSelectTeam: (newTeam: LoadoutCharacter[]) => void;
    characters: Character[];
    lightcones: Lightcone[];
}
const PresetTeamsDropdown: React.FC<PresetTeamsDropdownProps> = ({ onSelectTeam, characters, lightcones }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const closeDropdown = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown when team is selected
    const handleTeamSelect = (template: PresetTeamTemplate) => {
        const presetTeam: LoadoutCharacter[] = convertTemplateToLoadoutTeam(template, characters, lightcones);
        onSelectTeam(presetTeam);
        closeDropdown();
    };

    return (
        <div className="preset-teams">
            <button
                ref={triggerRef}
                onClick={_ => setIsOpen(!isOpen)}
                className="preset-button button"
            >
                {`Load Preset Rosters`}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="preset-list"
                >
                    {presetTeamTemplates.map((template: PresetTeamTemplate, index: number) => (
                        <button
                            key={index}
                            onClick={_ => handleTeamSelect(template)}
                            className="preset-option"
                        >
                            <h3 className="title">{template.name}</h3>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false
}) => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Create or get the portal container
            let container = document.getElementById('confirmation-modal-portal');
            if (!container) {
                container = document.createElement('div');
                container.id = 'confirmation-modal-portal';
                document.body.appendChild(container);
            }
            setPortalContainer(container);
        }

        // Cleanup: remove container when component unmounts
        return () => {
            if (!isOpen) {
                const existingContainer = document.getElementById('confirmation-modal-portal');
                if (existingContainer && existingContainer.children.length === 0) {
                    document.body.removeChild(existingContainer);
                }
            }
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onCancel]);

    // Fix for preventing accidental modal closure when dragging text selection outside modal
    const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only track mousedown if it's directly on the overlay (not on modal content)
        if (e.target === e.currentTarget) {
            (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay = 'true';
        }
    };
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only close if both mousedown and click happened on the overlay
        if (e.target === e.currentTarget && 
            (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay === 'true') {
            onCancel();
        }
        // Clear the flag
        delete (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay;
    };

    if (!isOpen || !portalContainer) {
        return (<></>);
    }
    return createPortal(
        <div 
            className="confirmation-overlay"
            onMouseDown={handleOverlayMouseDown}
            onClick={handleOverlayClick} 
        >
            <div className="confirmation-modal Box">
                <h2 className="confirmation-title">
                    {title}
                </h2>
                
                <p className="confirmation-message">
                    {message}
                </p>
                
                <div className="confirmation-actions">
                    <button
                        onClick={onCancel}
                        className="button confirmation-cancel"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`button confirmation-confirm ${isDangerous ? 'dangerous' : ''}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        portalContainer
    );
};

interface TeamTestProps {
    characters: Character[];
    lightcones: Lightcone[];
}

export function TeamTest({ characters, lightcones }: TeamTestProps) {
    const icons = useQuery(api.icons.list) || [];
    const [loadouts, setLoadouts] = useState<Loadout[]>(LoadoutManager.loadLoadouts());
    const [loadoutIndex, setLoadoutIndex] = useState<number>(LoadoutManager.loadCurrentLoadoutIndex());
    const [ruleSet, setRuleSet] = useState<RuleSet>(LoadoutManager.getLatestRulesetView());
    
    const defaultTeamName: string = `Team ${(loadoutIndex ?? 0) + 1}`;
    const [editingName, setEditingName] = useState<boolean>(false); // Is User currently editing a Loadout's name
    const [tempName, setTempName] = useState<string>(loadouts[loadoutIndex]?.name); // Temporary field for editing a Loadout's name
    const [showCharacters, setShowCharacters] = useState<boolean>(true); // Show character names on the cost breakdown chart
    const [showResetConfirmation, setShowResetConfirmation] = useState<boolean>(false); // Show overlay to confirm resetting Loadouts

    const currentTeam: LoadoutCharacter[] = loadouts[loadoutIndex]?.team || [];
    const currentName: string = loadouts[loadoutIndex]?.name || defaultTeamName;

    // Initialize Loadouts and active loadout
    useEffect(() => {
        if (characters && lightcones) {
            LoadoutManager.refreshLoadoutIds(characters, lightcones); // Check all IDs are up to date with Database

            const storedLoadouts: Loadout[] = LoadoutManager.loadLoadouts();
            const storedIndex: number = LoadoutManager.loadCurrentLoadoutIndex();
            const lastRuleSet: RuleSet = LoadoutManager.getLatestRulesetView();
            
            setLoadouts(storedLoadouts);
            setLoadoutIndex(storedIndex);
            setRuleSet(lastRuleSet);
        }
    }, [characters, lightcones]);

    // Save the index of last Loadout slot worked on 
    useEffect(() => {
        LoadoutManager.saveCurrentLoadoutIndex(loadoutIndex);
    }, [loadoutIndex]);

    // Save the Last Rule Set viewed
    useEffect(() => {
        LoadoutManager.setLatestRulesetView(ruleSet);
    }, [ruleSet]);

    // Upon updating a team, sync changes with data stored in localStorage
    useEffect(() => {
        if (loadouts.length > 0) {
            LoadoutManager.saveLoadouts(loadouts);
        }
    }, [loadouts]);

    // Create Path Icon mappings
    const pathIconMap = useMemo(() => {
        const map = {} as Record<Path, string>;
        [...UniquePaths].forEach(path => {
            const icon = icons.find(icon => icon.name === path);
            if (icon) map[path] = icon.imageUrl;
        });
        return map;
    }, [icons]);

    // Create Element Icon mappings
    const elementIconMap = useMemo(() => {
        const map = {} as Record<Element, string>;
        [...UniqueElements].forEach(element => {
            const icon = icons.find(icon => icon.name === element);
            if (icon) map[element] = icon.imageUrl;
        });
        return map;
    }, [icons]);

    // Create Gamemode Icon mappings
    const modeIconMap = useMemo(() => {
        const map = {} as Record<RuleSet, string>;
        (["memoryofchaos", "apocalypticshadow"] as RuleSet[]).forEach(mode => {
            const icon = icons.find(icon => icon.name === mode);
            if (icon) map[mode] = icon.imageUrl;
        });
        return map;
    }, [icons]);

    const updateCurrentLoadout = (newTeam: LoadoutCharacter[]) => {
        setLoadouts(prev => {
            const newLoadouts = [...prev];
            newLoadouts[loadoutIndex] = {
                ...newLoadouts[loadoutIndex],
                team: newTeam
            };
            return newLoadouts;
        });
    };

    const handleCharacterSelect = (character: Character) => {
        if (currentTeam.some(selected => selected.characterId === character._id) || currentTeam.length >= teamSize) return;

        const newCharacter: LoadoutCharacter = {
            characterId: character._id,
            characterName: character.name,
            rank: getCharacterRank(character),
        };

        updateCurrentLoadout([...currentTeam, newCharacter]);
    };

    const handleCharacterUpdate = (index: number, updates: Partial<DraftedCharacter>) => {
        const newTeam = [...currentTeam];
        newTeam[index] = { ...newTeam[index], ...updates };
        updateCurrentLoadout(newTeam);
    };

    const handleRemoveCharacter = (index: number) => {
        const newTeam = currentTeam.filter((_, i) => i !== index);
        updateCurrentLoadout(newTeam);
    };

    const handleLoadoutChange = (newIndex: number) => {
        setLoadoutIndex(newIndex);
    };

    const handleClearCurrentLoadout = () => {
        updateCurrentLoadout([]);
    };
    
    const handleClearAllLoadouts = () => setShowResetConfirmation(true);
    const handleCancelReset = () => setShowResetConfirmation(false);
    const handleConfirmResetAll = () => {
        const clearedLoadouts = LoadoutManager.getDefaultLoadouts();
        setLoadouts(clearedLoadouts);
        setLoadoutIndex(0);
        setShowResetConfirmation(false);
    };

    const getTotalCostForMode = (ruleSet: RuleSet): number => {
        return currentTeam.reduce((total, drafted) => {
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

    const getCharacterRank = (character: Character): CharacterRank => {
        if (character.rarity !== 5) return "E6"; // Default 4-star Characters to be E6
        if (character.display_name.startsWith("MC ")) return "E6"; // Default Trailblazer variations are E6
        return "E0";
    }
    
    const getChartCharacterColor = (): string => {
        if (ruleSet === "memoryofchaos") return `#3b82f6`;
        if (ruleSet === "apocalypticshadow") return `#8b5cf6`;
        return ``;
    }
    const getChartLightconeColor = (): string => {
        if (ruleSet === "memoryofchaos") return `#60a5fa`;
        if (ruleSet === "apocalypticshadow") return `#a78bfa`;
        return ``;
    }

    const handleStartEditing = () => {
        // When starting to edit, if the current name is the default, clear it for easier editing
        setTempName((currentName === defaultTeamName) ? "" : currentName);
        setEditingName(true);
    };
    const handleNameSubmit = () => {
        // If tempName is empty or just whitespace, use the default name
        const finalName = tempName.trim() || defaultTeamName;

        setLoadouts(prev => {
            const newLoadouts = [...prev];
            newLoadouts[loadoutIndex] = {
                ...newLoadouts[loadoutIndex],
                name: finalName
            };
            return newLoadouts;
        });
        setEditingName(false);
    };

    return (
        <div className="TeamTest">
            <div className="main" id="loadout">
                {/* Team view */}
                <div className="roster Box">
                    <h2 className="sub-header">{`Team (${currentTeam.length}/4)`}</h2>

                    <div className="characters-container">
                        {Array.from({ length: 4 }).map((_, index) => {
                            const drafted: DraftedCharacter = currentTeam[index];
                            if (!drafted) {
                                return (
                                    <div key={index} className="slot empty">
                                        <h3>{`Empty`}</h3>
                                    </div>
                                );
                            }

                            const character: Character | undefined = characters.find(c => c._id === drafted.characterId);
                            if (!character) return null;
                            
                            const elementIconUrl: string = elementIconMap[character.element];
                            const pathIconUrl: string = pathIconMap[character.path];
                            const lightcone: Lightcone | undefined = (drafted.lightconeId) ? lightcones.find((l) => l._id === drafted.lightconeId) ?? undefined : undefined;

                            return (
                                <div
                                    key={index}
                                    className="slot"
                                    data-rarity={character.rarity}
                                    style={{ background: `var(--gradient-${character.rarity}star)` }} // Must be here for Path to appear behind portrait
                                >
                                    {/* Path */}
                                    <img
                                        src={pathIconUrl}
                                        className="path"
                                        alt={character.path}
                                    />

                                    {/* Portrait */}
                                    <img
                                        src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                        className="portrait"
                                        alt={character.display_name}
                                    />

                                    {/* Character info */}
                                    <div className="character">
                                        {/* Clear button */}
                                        <button
                                            onClick={_ => handleRemoveCharacter(index)}
                                            className="clear-button"
                                            title={`Remove ${character.display_name}`}
                                        >
                                            <ClearIcon />
                                        </button>

                                        {/* Element */}
                                        <img
                                            src={elementIconUrl}
                                            className="element"
                                            alt={character.element}
                                        />

                                        {/* Verticals (Eidolon/SuperImposition) */}
                                        <div className="verticals">
                                            {/* Eidolon */}
                                            <select
                                                value={drafted.rank as CharacterRank}
                                                onChange={e => handleCharacterUpdate(index, { rank: e.target.value as CharacterRank })}
                                                className="eidolon focus:outline-none"
                                                name="eidolon"
                                                style={{
                                                    paddingRight: `${lightcone ? `0` : ``}`,
                                                    marginRight: `${lightcone ? `0` : ``}`,
                                                }}
                                            >
                                                {[...Eidolons].map((rank) => (
                                                    <option key={rank} value={rank}>
                                                        {rank}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Imposition */}
                                            {drafted.lightconeId && (
                                                <>
                                                    <select
                                                        value={(drafted.lightconeRank || "S1") as LightconeRank}
                                                        onChange={e => handleCharacterUpdate(index, { lightconeId: drafted.lightconeId, lightconeRank: e.target.value as LightconeRank })}
                                                        className="imposition focus:outline-none"
                                                        name="imposition"
                                                    >
                                                        {[...SuperImpositions].map((rank) => (
                                                            <option key={rank} value={rank}>
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
                                        onLightconeChange={(lightconeId, rank) => handleCharacterUpdate(index, { lightconeId, lightconeRank: rank })}
                                        equippingCharacter={character}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Cost Breakdown */}
                <div className="cost-breakdown Box">
                    {/* Header */}
                    <div className="header">
                        <h3 className="title">Cost Breakdown</h3>

                        {/* Switch to view MoC/AS cost */}
                        <button
                            onClick={_ => setRuleSet(prev => (prev === "memoryofchaos") ? "apocalypticshadow" : "memoryofchaos")}
                            className={`mode-switch ${ruleSet}`}
                            title={`Switch to ${(ruleSet === "memoryofchaos") ? `Apocalyptic Shadow` : `Memory of Chaos`} rules`}
                        >
                            <div className="track-bar"/>

                            <div className="thumb">
                                { modeIconMap[ruleSet] && <img className="icon" src={modeIconMap[ruleSet]} /> }
                            </div>
                        </button>
                    </div>
                    
                    {/* Content - Chart */}
                    <div className="content">
                        {currentTeam.length > 0 ? (
                            <Bar
                                // Yes it has to be here. Fuck this library.
                                style={{ position: `absolute`, bottom: 0, left: 0, height: `100%`, width: `100%` }}

                                data={{
                                    labels: currentTeam.map(drafted => showCharacters ? (characters.find(c => c._id === drafted.characterId)?.display_name || "Unknown") : "■".repeat(Math.min(Math.ceil((characters.find(c => c._id === drafted.characterId)?.display_name.length || 3) / 3), 5)) ),

                                    datasets: [
                                        {
                                            label: "Character",
                                            data: currentTeam.map(drafted => {
                                                const character = characters.find(c => c._id === drafted.characterId);
                                                if (!character) return 0;
                                                
                                                return character.cost[ruleSet][drafted.rank];
                                            }),

                                            backgroundColor: getChartCharacterColor(),
                                            borderSkipped: true,
                                        },
                                        {
                                            label: "Lightcone",
                                            data: currentTeam.map(drafted => {
                                                const character = characters.find(c => c._id === drafted.characterId);
                                                if (!character) return 0;
                                                
                                                if (drafted.lightconeId && drafted.lightconeRank) {
                                                    const lightcone = lightcones.find(l => l._id === drafted.lightconeId);
                                                    if (lightcone) return lightcone.cost[drafted.lightconeRank];
                                                }
                                                return 0;
                                            }),

                                            backgroundColor: getChartLightconeColor(),
                                            borderSkipped: true,
                                        },
                                    ],
                                }}

                                options={{
                                    responsive: true,
                                    clip: false,
                                    interaction: {
                                        intersect: false,
                                        mode: 'index',
                                    },

                                    maintainAspectRatio: false,
                                    layout: {
                                        padding: {
                                            top: 24, // Add padding at the top to prevent clipping
                                            right: 8,
                                        }
                                    },

                                    plugins: {
                                        legend: {
                                            display: false,
                                            position: `bottom`
                                        },

                                        datalabels: {
                                            display: true,
                                            anchor: 'end',
                                            align: 'top',
                                            offset: -4,
                                            clamp: true,

                                            color: `rgb(251, 191, 36)`,
                                            font: { weight: 'bold', size: 16 },

                                            formatter: (value: number, ctx: any) => {
                                                if (ctx.datasetIndex !== 1) return ``;
                                                
                                                const drafted = currentTeam[ctx.dataIndex];
                                                const char = characters.find(c => c._id === drafted.characterId);
                                                if (!char) return ``;

                                                let total = char.cost[ruleSet][drafted.rank];
                                                if (drafted.lightconeId && drafted.lightconeRank) {
                                                    const lc = lightcones.find(l => l._id === drafted.lightconeId);
                                                    if (lc) total += lc.cost[drafted.lightconeRank];
                                                }

                                                return `Σ ${total.toFixed(1)}`;
                                            },
                                        },
                                    },

                                    scales: {
                                        // Character names
                                        x: {
                                            stacked: true,
                                            ticks: {
                                                color: `white`,
                                                maxRotation: 45,
                                                minRotation: 0,
                                                font: {
                                                    size: 12,
                                                    weight: "bold"
                                                },
                                            },
                                            grid: {
                                                display: false
                                            },
                                        },

                                        y: {
                                            stacked: true,
                                            beginAtZero: true,
                                            ticks: {
                                                display: false,
                                            },
                                            grid: {
                                                display: true,
                                                color: `rgb(55, 65, 81)`,
                                            },
                                            title: {
                                                display: true,
                                                text: `Cost — ${ruleSet === "memoryofchaos" ? `MoC` : `AS`}`,
                                                color: `rgb(209, 213, 219)`,
                                                font: {
                                                    size: 14,
                                                    weight: 'bold',
                                                }
                                            }
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <div className="empty">
                                <h3>No characters selected</h3>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="footer">
                        {/* Legend */}
                        <div className="legend">
                            <div className="section">
                                <div className="square" style={{ backgroundColor: getChartCharacterColor() }} />
                                <h3 className="name">Character</h3>
                            </div>
                            <div className="section">
                                <div className="square" style={{ backgroundColor: getChartLightconeColor() }} />
                                <h3 className="name">Lightcone</h3>
                            </div>
                        </div>
                        
                        {/* Total Cost */}
                        <h2 className="total-cost">{`Σ ${getTotalCostForMode(ruleSet).toFixed(1)}`}</h2>
                    </div>
                </div>

                {/* Roster Controls */}
                <div className="controls Box">
                    {/* Roster select + Name/Edit */}
                    <div className="header">
                        <RightDropdown>
                            <div className="dropdown-header">
                                <h2 className="title">Loadout Overview</h2>
                            </div>

                            {loadouts.map((loadout: Loadout, index: number) => (
                                <button
                                    key={index}
                                    disabled={index === loadoutIndex}
                                    onClick={_ => handleLoadoutChange(index)}
                                    className="team-option"
                                >
                                    {/* Loadout Name */}
                                    <h3 className="title" style={{ color: (index === loadoutIndex) ? `rgb(229, 203, 148)` : `` }}>
                                        {`${loadout.name}${(index === loadoutIndex) ? ` (Selected)` : ``}`}
                                    </h3>
                                    
                                    {/* Loadout Roster */}
                                    <div className="characters-container">
                                        {Array.from({ length: 4 }).map((_, charIndex: number) => {
                                            const drafted: DraftedCharacter = loadout.team[charIndex];
                                            if (!drafted) {
                                                return (
                                                    <div key={charIndex} className="slot empty">
                                                        <h3>{`Empty`}</h3>
                                                    </div>
                                                );
                                            }

                                            const character: Character | undefined = characters.find(c => c._id === drafted.characterId);
                                            if (!character) return null;
                                            
                                            const elementIconUrl: string = elementIconMap[character.element];

                                            return (
                                                <div
                                                    key={charIndex}
                                                    className="slot rounded border"
                                                    data-rarity={character.rarity}
                                                    style={{ background: `var(--gradient-${character.rarity}star)` }} // Must be here for Path to appear behind portrait
                                                >
                                                    {/* Element */}
                                                    <img
                                                        src={elementIconUrl}
                                                        className="element"
                                                        alt={character.element}
                                                    />

                                                    {/* Portrait */}
                                                    <img
                                                        src={character.imageUrl}
                                                        className="portrait"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </button>
                            ))}
                        </RightDropdown>

                        {!editingName ? <>
                            <h1 
                                className="title name" 
                                onClick={handleStartEditing}
                                title="Click to Edit"
                            >
                                {currentName || defaultTeamName}

                                <EditIcon />
                                
                                { (currentName !== defaultTeamName) && <span className="helper-text">{defaultTeamName}</span> }
                            </h1>

                        </> : (
                            <input
                                className="title editor focus:outline-none"
                                
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value as string)}
                                onBlur={handleNameSubmit}
                                onKeyDown={(e) => (e.key === "Enter") && handleNameSubmit()}
                                
                                placeholder={defaultTeamName}
                                autoFocus
                                maxLength={20}
                            />
                        )}
                    </div>

                    <div className="content">
                        {/* Copy Loadout to Clipboard */}
                        <ScreenshotButton action="clipboard" targetElementId="loadout" />

                        {/* Download Clipboard */}
                        <ScreenshotButton action="download" targetElementId="loadout" />

                        {/* Toggle Character Names Visibility */}
                        <button
                            onClick={_ => setShowCharacters(prev => !prev)}
                            className="button toggle-names"
                            data-hidden={!showCharacters}
                            title={showCharacters ? "Hide Character Names in Breakdown" : "Show Character Names in Breakdown"}
                        >
                            {showCharacters ? "Hide Names" : "Show Names"}
                        </button>
                        
                        {/* Clear button */}
                        <button
                            onClick={handleClearCurrentLoadout}
                            className="button clear"
                        >
                            {`Remove all`}
                        </button>

                        {/* Reset All Loadouts Button + Confirmation Modal */}
                        <button
                            onClick={handleClearAllLoadouts}
                            className="button reset-all"
                        >
                            {`Reset All Loadouts`}
                        </button>
                        <ConfirmationModal
                            isOpen={showResetConfirmation}
                            onConfirm={handleConfirmResetAll}
                            onCancel={handleCancelReset}
                            title="Reset All Loadouts"
                            message="This action cannot be undone and will permanently delete all your saved loadouts"
                            confirmText="Reset All"
                            cancelText="Cancel"
                            isDangerous
                        />

                        {/* Load Preset Roster */}
                        <PresetTeamsDropdown 
                            onSelectTeam={updateCurrentLoadout} 
                            characters={characters}
                            lightcones={lightcones}
                        />
                    </div>

                </div>

                {/* Notes Box */}
                <div className="notes-box">
                    <div className="notes-header">
                        <h3 className="text-white font-medium">Notes</h3>
                        <span className="text-gray-400 text-sm">
                            {(loadouts[loadoutIndex]?.notes || "").length}/1000
                        </span>
                    </div>
                    <textarea
                        value={loadouts[loadoutIndex]?.notes || ""}
                        onChange={(e) => {
                            if (e.target.value.length <= 1000) {
                                const newLoadouts = [...loadouts];
                                newLoadouts[loadoutIndex] = {
                                    ...newLoadouts[loadoutIndex],
                                    notes: e.target.value
                                };
                                setLoadouts(newLoadouts);
                            }
                        }}
                        placeholder="Add notes about this loadout..."
                        className="notes-textarea"
                        maxLength={1000}
                    />
                </div>
            </div>

            {/* Character Pool */}
            <CharacterPool
                characters={characters}
                selectedCharacters={currentTeam.map(d => ({ characterId: d.characterId, action: "pick" } as SelectedCharacter))}
                isDraftComplete={currentTeam.length >= teamSize}
                isDraftStarted={true}
                onCharacterSelect={handleCharacterSelect}
                currentPhase={{ team: "test", action: "test" }}
                canBanCharacter={undefined}
            />
        </div>
    );
}
