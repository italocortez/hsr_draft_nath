import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { RuleSet, SelectedCharacter } from "./DraftingInterface";
import { CharacterPool } from "./CharacterPool";
import "../css/TeamTest.css";
import LightconeSelector from "./LightconeSelector";
import { Character, CharacterRank, Eidolons, Element, Lightcone, LightconeRank, Pairing, Path, SuperImpositions, UniqueElements, UniquePaths } from "@/lib/utils";
import LoadoutManager, { Loadout, PresetOption, ResolvedTeamMember, TeamMember, teamSize } from "@/lib/LoadoutManager";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import ScreenshotButton, { LoadingSpinner } from "./ScreenshotButton";
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
const SynergyIcon: React.FC = () => (
    <svg 
        className="synergy-icon"
        xmlns="http://www.w3.org/2000/svg" 
        fill="#b800b8ff" 
        viewBox="0 0 24 24"
    >
        <title>Synergizes greatly with a teammate</title>
        <path d="M10.962 15.867a2.469 2.469 0 0 1-.69 1.377l-1.029 1.028a2.5 2.5 0 0 1-3.536-3.536l1.029-1.029a2.464 2.464 0 0 1 1.423-.694l1.781-1.781a4.425 4.425 0 0 0-4.619 1.062l-1.028 1.028a4.5 4.5 0 0 0 6.364 6.364l1.029-1.029a4.489 4.489 0 0 0 1.073-4.587zM19.686 4.293a4.511 4.511 0 0 0-6.364 0l-1.029 1.029a4.49 4.49 0 0 0-1.063 4.62l1.779-1.779a2.476 2.476 0 0 1 .7-1.427l1.029-1.029a2.5 2.5 0 0 1 3.536 3.536l-1.029 1.029a2.484 2.484 0 0 1-1.379.693l-1.796 1.794a4.409 4.409 0 0 0 4.587-1.072l1.029-1.029a4.5 4.5 0 0 0 0-6.365z"/>
        <path d="M9 16a1 1 0 0 1-.707-1.707l6-6a1 1 0 0 1 1.414 1.414l-6 6A1 1 0 0 1 9 16z"/>
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
            stroke="currentColor" 
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        // Close dropdown when any button inside is clicked
        const handleButtonClick = (event: MouseEvent) => {
            if (isOpen && dropdownRef.current?.contains(event.target as Node)) {
                const closestButton = (event.target as HTMLElement).closest('button');
                if (closestButton && dropdownRef.current.contains(closestButton)) {
                    closeDropdown();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        if (isOpen) document.addEventListener("click", handleButtonClick);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("click", handleButtonClick);
        };
    }, [isOpen]);

    return (
        <div className="rosters">
            <button
                ref={triggerRef}
                onClick={_ => setIsOpen(!isOpen)}
                className="select-button button"
                title="Select Team"
            >
                <DropdownIcon isOpen={isOpen} />

                <span>{`Select Loadout`}</span>
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

interface PresetTeamsDropdownProps {
    onSelectTeam: (team: TeamMember[]) => void;
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTeamSelect = (presetTeam: TeamMember[]) => {
        // Filter out any characters/lightcones that don't exist in the current database
        const validTeam = presetTeam.map(member => {
            const character: Character | undefined = characters.find(c => c.name === member.characterName);
            if (!character) return null;

            const lightcone: Lightcone | undefined = member.lightconeName ? lightcones.find(l => l.name === member.lightconeName) : undefined;
            
            // Only include lightcone properties if they exist
            const validMember: TeamMember = {
                characterName: member.characterName,
                rank: member.rank
            };

            if (lightcone && member.lightconeName && member.lightconeRank) {
                validMember.lightconeName = member.lightconeName;
                validMember.lightconeRank = member.lightconeRank;
            }

            return validMember;
        }).filter((member): member is TeamMember => member !== null);

        onSelectTeam(validTeam);
        setIsOpen(false);
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
                    {LoadoutManager.getPresetTeams().map((preset: PresetOption, index: number) => (
                        <button
                            key={index}
                            onClick={_ => handleTeamSelect(preset.team)}
                            className="preset-option"
                        >
                            <h3 className="title">{preset.name}</h3>
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
    isOpen, onConfirm, onCancel, title,
    message, confirmText = "Confirm", cancelText = "Cancel", isDangerous = false
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
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
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
    pairings: Pairing[];
    lightcones: Lightcone[];
}

export function TeamTest({ characters, pairings, lightcones }: TeamTestProps) {
    const icons = useQuery(api.icons.list) || [];
    const [loadouts, setLoadouts] = useState<Loadout[]>(LoadoutManager.loadLoadouts());
    const [loadoutIndex, setLoadoutIndex] = useState<number>(LoadoutManager.loadCurrentLoadoutIndex());
    const [ruleSet, setRuleSet] = useState<RuleSet>(LoadoutManager.loadRulesetView());
    
    const [editingName, setEditingName] = useState<boolean>(false); // Is User currently editing a Loadout's name
    const [tempName, setTempName] = useState<string>(""); // Temporary field for editing a Loadout's name
    const [showCharacters, setShowCharacters] = useState<boolean>(true); // Show character names on the cost breakdown chart
    const [showResetConfirmation, setShowResetConfirmation] = useState<boolean>(false); // Show overlay to confirm resetting Loadouts
    
    // Used to arrange teamslots
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const currentLoadout: Loadout = loadouts[loadoutIndex] || { name: `Team ${loadoutIndex + 1}`, team: [], notes: "" };
    const resolvedTeam: ResolvedTeamMember[] = useMemo(() => 
        (characters?.length && lightcones?.length) ? LoadoutManager.resolveTeam(currentLoadout.team, characters, lightcones) : [], 
        [currentLoadout.team, characters, lightcones]
    );

    // Load initial data
    useEffect(() => {
        if (characters?.length && lightcones?.length) {
            const storedLoadouts: Loadout[] = LoadoutManager.loadLoadouts();
            const storedIndex: number = LoadoutManager.loadCurrentLoadoutIndex();
            const storedRuleSet: RuleSet = LoadoutManager.loadRulesetView();
            
            setLoadouts(storedLoadouts);
            setLoadoutIndex(storedIndex);
            setRuleSet(storedRuleSet);
        }
    }, [characters, lightcones]);

    // Save changes made by the User
    useEffect(() => {
        if (loadouts.length > 0) LoadoutManager.saveLoadouts(loadouts);
    }, [loadouts]);
    useEffect(() => {
        LoadoutManager.saveCurrentLoadoutIndex(loadoutIndex);
    }, [loadoutIndex]);
    useEffect(() => {
        LoadoutManager.saveRulesetView(ruleSet);
    }, [ruleSet]);

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

    const updateCurrentLoadout = (newTeam: TeamMember[]) => {
        setLoadouts(prev => {
            const newLoadouts = [...prev];
            newLoadouts[loadoutIndex] = { ...newLoadouts[loadoutIndex], team: newTeam };
            return newLoadouts;
        });
    };

    const handleCharacterSelect = (character: Character) => {
        if (resolvedTeam.some(member => member.characterId === character._id) || resolvedTeam.length >= teamSize) {
            return;
        }

        const newMember: TeamMember = {
            characterName: character.name,
            rank: getDefaultRank(character)
        };

        updateCurrentLoadout([...currentLoadout.team, newMember]);
    };

    const handleMemberUpdate = (index: number, updates: Partial<ResolvedTeamMember>) => {
        const updatedMember = { ...resolvedTeam[index], ...updates };
        const unresolvedMember = LoadoutManager.unresolveTeamMember(updatedMember, characters, lightcones);
        
        const newTeam = [...currentLoadout.team];
        newTeam[index] = unresolvedMember;
        updateCurrentLoadout(newTeam);
    };

    const handleRemoveMember = (index: number) => {
        const newTeam = currentLoadout.team.filter((_, i) => i !== index);
        updateCurrentLoadout(newTeam);
    };

    const handleCancelResetAll = () => setShowResetConfirmation(false);
    const handleConfirmResetAll = () => {
        const clearedLoadouts = LoadoutManager.getDefaultLoadouts();
        setLoadouts(clearedLoadouts);
        setLoadoutIndex(0);
        setShowResetConfirmation(false);
    };

    // Teamslot handlers
    const handleDragStart = (index: number, e: React.DragEvent) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };
    const handleDragLeave = () => {
        setDragOverIndex(null);
    };
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };
    const handleDrop = (targetIndex: number, e: React.DragEvent) => {
        e.preventDefault();
        
        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }
        
        // Swap the characters in the team array
        const newTeam = [...currentLoadout.team];
        [newTeam[draggedIndex], newTeam[targetIndex]] = [newTeam[targetIndex], newTeam[draggedIndex]];
        
        updateCurrentLoadout(newTeam);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const getTotalCost = (ruleSet: RuleSet): number => {
        return resolvedTeam.reduce((total, member) => {
            const character = characters.find(c => c._id === member.characterId);
            if (!character) return total;

            let cost = character.cost[ruleSet][member.rank];
            
            if (member.lightconeId && member.lightconeRank) {
                const lightcone = lightcones.find(l => l._id === member.lightconeId);
                if (lightcone) cost += lightcone.cost[member.lightconeRank];
            }
            
            // Add pairing costs
            cost += getPairingCostForCharacter(character.name);
            
            return total + cost;
        }, 0);
    };

    const getPairingCostForCharacter = (characterName: string): number => {
        // Get all characters currently in the team
        const teamCharacterNames = resolvedTeam.map(member => {
            const character = characters.find(c => c._id === member.characterId);
            return character ? character.name : null;
        }).filter(name => name !== null);

        // Calculate total pairing cost for this character
        return pairings
            .filter(pairing => 
                pairing.source === characterName && 
                teamCharacterNames.includes(pairing.pair_target)
            )
            .reduce((total, pairing) => total + pairing.cost[ruleSet], 0);
    };

    const getDefaultRank = (character: Character): CharacterRank => {
        if (character.rarity !== 5) return "E6"; // 4-star characters default to E6
        if (character.display_name.startsWith("MC ")) return "E6"; // Trailblazer variations default to E6
        return "E0"; // 5-star characters default to E0
    }

    const handleStartEditing = () => {
        const defaultName = `Team ${loadoutIndex + 1}`;
        setTempName(currentLoadout.name === defaultName ? "" : currentLoadout.name);
        setEditingName(true);
    };

    const handleNameSubmit = () => {
        const finalName = tempName.trim() || `Team ${loadoutIndex + 1}`;
        setLoadouts(prev => {
            const newLoadouts = [...prev];
            newLoadouts[loadoutIndex] = { ...newLoadouts[loadoutIndex], name: finalName };
            return newLoadouts;
        });
        setEditingName(false);
    };

    const getChartColors = () => ({
        character: (ruleSet === "memoryofchaos") ? "#3b82f6" : "#8b5cf6",
        lightcone: (ruleSet === "memoryofchaos") ? "#60a5fa" : "#a78bfa",
        pairing: (ruleSet === "memoryofchaos") ? "#1d4ed8" : "#6d28d9"
    });

    const hasActivatedPairing = (characterName: string): boolean => {
        const teamCharacterNames: string[] = resolvedTeam
            .map(member => characters.find(c => c._id === member.characterId)?.name)
            .filter(name => name !== undefined);

        return pairings.some(pairing => 
            (pairing.source === characterName && teamCharacterNames.includes(pairing.pair_target)) ||
            (pairing.pair_target === characterName && teamCharacterNames.includes(pairing.source))
        );
    }

    const renderSynergies = () => {
        const teamCharacterNames: string[] = resolvedTeam
            .map(member => characters.find(c => c._id === member.characterId)?.name)
            .filter(name => name !== undefined);

        const teamPairings = pairings.filter(pairing => 
            teamCharacterNames.includes(pairing.source) && 
            teamCharacterNames.includes(pairing.pair_target)
        );

        if (teamPairings.length === 0) {
            return <h3 className="empty-message">none</h3>
        }

        return teamPairings.map(pairing => {
            const sourceChar: string = characters.find(c => c.name === pairing.source)?.display_name || pairing.source;
            const targetChar: string = characters.find(c => c.name === pairing.pair_target)?.display_name || pairing.pair_target;
            
            return (
                <h3 key={`${sourceChar}-${targetChar}`} className="pair" title={`Additional cost due to strong synergy between ${sourceChar} and ${targetChar}`}>
                    {`${pairing.cost[ruleSet] > 0 ? `+` : ``}${pairing.cost[ruleSet]} ${sourceChar} - ${targetChar}`}
                </h3>
            );
        });
    };

    return (
        <div className="TeamTest">
            <div className="main" id="loadout">
                {/* Team view */}
                <div className="roster Box">
                    {/* <h2 className="sub-header">{`Team (${resolvedTeam.length}/${teamSize})`}</h2> */}

                    <div className="characters-container">
                        {Array.from({ length: teamSize }).map((_, index) => {
                            const member: ResolvedTeamMember = resolvedTeam[index];
                            if (!member) {
                                return (
                                    <div key={index} className="slot empty">
                                        { currentLoadout.team[index] ? <LoadingSpinner /> : <h3>{`Empty`}</h3> }
                                    </div>
                                );
                            }

                            const character: Character | undefined = characters.find(c => c._id === member.characterId);
                            if (!character) return null;
                            
                            const elementIconUrl: string = elementIconMap[character.element];
                            const pathIconUrl: string = pathIconMap[character.path];
                            
                            const isDragging = draggedIndex === index;
                            const isValidDropTarget = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;

                            return (
                                <div
                                    key={index}
                                    className={`slot ${isDragging ? `dragging` : isValidDropTarget ? `drop-target` : ``}`}
                                    data-rarity={character.rarity}
                                    style={{ background: `var(--gradient-${character.rarity}star)` }} // Must be here for Path to appear behind portrait

                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(index, e)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDragEnd={handleDragEnd}
                                    onDrop={(e) => handleDrop(index, e)}
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

                                    <div className={`block-character-portrait ${!showCharacters ? `active` : ``}`} />

                                    {/* Clear button */}
                                    <button
                                        onClick={_ => handleRemoveMember(index)}
                                        className="clear-button"
                                        title={`Remove ${character.display_name}`}
                                    >
                                        <ClearIcon />
                                    </button>

                                    {/* Character info */}
                                    <div className="character">
                                        <div className="icons">
                                            {/* Element */}
                                            <img
                                                src={elementIconUrl}
                                                className="element"
                                                alt={character.element}
                                            />

                                            {/* Synergy Icon */}
                                            { hasActivatedPairing(member.characterName) && <SynergyIcon /> }
                                        </div>

                                        {/* Verticals (Eidolon/SuperImposition) */}
                                        <div className="verticals">
                                            {/* Eidolon */}
                                            <select
                                                value={member.rank as CharacterRank}
                                                onChange={e => {
                                                    handleMemberUpdate(
                                                        index, 
                                                        { rank: e.target.value as CharacterRank }
                                                    );
                                                    e.currentTarget.blur(); // unfocus after selecting - LC search bar returns to collapsed height
                                                }}
                                                className="eidolon focus:outline-none"
                                                name="eidolon"
                                                style={{
                                                    paddingRight: `${member.lightconeId ? `0` : ``}`,
                                                    marginRight: `${member.lightconeId  ? `0` : ``}`,
                                                }}
                                            >
                                                {[...Eidolons].map((rank) => (
                                                    <option key={rank} value={rank}>
                                                        {rank}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Imposition */}
                                            {member.lightconeId && (
                                                <>
                                                    <select
                                                        value={(member.lightconeRank || "S1") as LightconeRank}
                                                        onChange={e => {
                                                            handleMemberUpdate(
                                                                index, 
                                                                { lightconeRank: e.target.value as LightconeRank }
                                                            );
                                                            e.currentTarget.blur(); // unfocus after selecting - LC search bar returns to collapsed height
                                                        }}
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
                                        selectedLightconeId={member.lightconeId}
                                        selectedRank={member.lightconeRank}
                                        onLightconeChange={(lightconeId, rank) => handleMemberUpdate(index, { lightconeId, lightconeRank: rank })}
                                        equippingCharacter={character}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="synergies">
                        <h2>Synergies:</h2>
                        { renderSynergies() }
                    </div>
                </div>

                {/* Cost Breakdown */}
                <div className="cost-breakdown Box">
                    {/* Header */}
                    <div className="header">
                        <h3 className="title">{`Cost Breakdown — ${(ruleSet === "memoryofchaos") ? `MoC` : `AS`}`}</h3>

                        {/* Switch to view MoC/AS cost */}
                        <button
                            onClick={_ => setRuleSet(prev => (prev === "memoryofchaos") ? "apocalypticshadow" : "memoryofchaos")}
                            className={`mode-switch ${ruleSet}`}
                            title={`Switch to ${(ruleSet === "memoryofchaos") ? `Apocalyptic Shadow` : `Memory of Chaos`} rules`}
                        >
                            <div className="track-bar" />

                            <div className="thumb">
                                { modeIconMap[ruleSet] && <img className="icon" src={modeIconMap[ruleSet]} /> }
                            </div>
                        </button>
                    </div>
                    
                    {/* Content - Chart */}
                    <div className="content">
                        {resolvedTeam.length > 0 ? (
                            <Bar
                                // Yes it has to be here. Fuck this library.
                                style={{ position: `absolute`, bottom: 0, left: 0, height: `100%`, width: `100%` }}

                                data={{
                                    labels: resolvedTeam.map(member => 
                                        showCharacters 
                                            ? member.characterDisplayName 
                                            : "■".repeat(Math.min(Math.ceil(member.characterDisplayName.length / 3), 5))
                                    ),

                                    datasets: [
                                        {
                                            label: "Character",
                                            data: resolvedTeam.map(member => {
                                                const character = characters.find(c => c._id === member.characterId);
                                                return character ? character.cost[ruleSet][member.rank] : 0;
                                            }),
                                            backgroundColor: getChartColors().character,
                                            borderSkipped: true,
                                        },
                                        {
                                            label: "Lightcone",
                                            data: resolvedTeam.map(member => {
                                                if (member.lightconeId && member.lightconeRank) {
                                                    const lightcone = lightcones.find(l => l._id === member.lightconeId);
                                                    return lightcone ? lightcone.cost[member.lightconeRank] : 0;
                                                }
                                                return 0;
                                            }),
                                            backgroundColor: getChartColors().lightcone,
                                            borderSkipped: true,
                                        },
                                        {
                                            label: "Pairing",
                                            data: resolvedTeam.map(member => {
                                                const character = characters.find(c => c._id === member.characterId);
                                                return character ? getPairingCostForCharacter(character.name) : 0;
                                            }),
                                            backgroundColor: getChartColors().pairing,
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

                                        tooltip: {
                                            callbacks: {
                                                label: function(context: any) {
                                                    const label = context.dataset.label || '';
                                                    const value = context.parsed.y;

                                                    if (label !== 'Pairing' || value === 0) {
                                                        return `${label}: ${value}`;
                                                    }

                                                    const member = resolvedTeam[context.dataIndex];
                                                    const sourceChar = characters.find(c => c._id === member.characterId);
                                                    if (!sourceChar) return `${label}: ${value}`;

                                                    const teamNames = resolvedTeam.map(m => characters.find(c => c._id === m.characterId)?.name).filter(Boolean);
                                                    const breakdown = pairings.filter(p => p.source === sourceChar.name && teamNames.includes(p.pair_target))
                                                        .map(p => `${characters.find(c => c.name === p.pair_target)?.display_name}: ${p.cost[ruleSet]}`).join(', ');

                                                    return `Pairing: ${value} (from ${breakdown})`;
                                                }
                                            }
                                        },

                                        datalabels: {
                                            display: true,
                                            anchor: 'end',
                                            align: 'top',
                                            offset: -4,
                                            clamp: true,

                                            color: `rgb(244, 206, 122)`, // Doesn't recognize css variables
                                            font: { weight: 'bold', size: 16 },

                                            formatter: (value: number, ctx: any) => {
                                                if (ctx.datasetIndex !== 2) return '';
                                                
                                                const member = resolvedTeam[ctx.dataIndex];
                                                const char = characters.find(c => c._id === member.characterId);
                                                if (!char) return '';

                                                let total = char.cost[ruleSet][member.rank];
                                                if (member.lightconeId && member.lightconeRank) {
                                                    const lc = lightcones.find(l => l._id === member.lightconeId);
                                                    if (lc) total += lc.cost[member.lightconeRank];
                                                }
                                                total += getPairingCostForCharacter(char.name);
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
                                { (currentLoadout.team.length > 0) ? <LoadingSpinner /> : <h3>{`No characters selected`}</h3> }
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="footer">
                        {/* Legend */}
                        <div className="legend">
                            <div className="section">
                                <div className="square" style={{ backgroundColor: getChartColors().character }} />
                                <h3 className="name">Character</h3>
                            </div>
                            <div className="section">
                                <div className="square" style={{ backgroundColor: getChartColors().lightcone }} />
                                <h3 className="name">Lightcone</h3>
                            </div>
                            <div className="section">
                                <div className="square" style={{ backgroundColor: getChartColors().pairing }} />
                                <h3 className="name">Pairing</h3>
                            </div>
                        </div>
                        
                        {/* Total Cost */}
                        <h2 className="total-cost">{`Σ ${getTotalCost(ruleSet).toFixed(1)}`}</h2>
                    </div>
                </div>

                {/* Roster Controls */}
                <div className="controls Box">
                    {/* Name/Edit */}
                    <div className="header">
                        {!editingName ? <>
                            <h1 
                                className="title name" 
                                onClick={handleStartEditing}
                                title="Click to Edit"
                            >
                                {currentLoadout.name}

                                <EditIcon />
                                
                                { (currentLoadout.name !== `Team ${loadoutIndex + 1}`) && <span className="helper-text">{`Team ${loadoutIndex + 1}`}</span> }
                            </h1>

                        </> : (
                            <input
                                className="title editor focus:outline-none"
                                
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value as string)}
                                onBlur={handleNameSubmit}
                                onKeyDown={(e) => (e.key === "Enter") && handleNameSubmit()}
                                
                                placeholder={`Team ${loadoutIndex + 1}`}
                                autoFocus
                                maxLength={20}
                                name="team-name"
                            />
                        )}
                    </div>

                    <div className="content">
                        {/* Select Loadout Button */}
                        <RightDropdown>
                            <div className="dropdown-header">
                                <h2 className="title">Loadout Overview</h2>
                            </div>

                            {loadouts.map((loadout: Loadout, index: number) => (
                                <button
                                    key={index}
                                    disabled={index === loadoutIndex}
                                    onClick={_ => setLoadoutIndex(index)}
                                    className="team-option"
                                >
                                    {/* Loadout Name */}
                                    <h3 className="title" style={{ color: (index === loadoutIndex) ? `rgb(229, 203, 148)` : `` }}>
                                        {`${loadout.name}${(index === loadoutIndex) ? ` (Selected)` : ``}`}
                                    </h3>
                                    
                                    {/* Loadout Roster */}
                                    <div className="characters-container">
                                        {Array.from({ length: teamSize }).map((_, charIndex: number) => {
                                            const member: TeamMember = loadout.team[charIndex];
                                            if (!member) {
                                                return (
                                                    <div key={charIndex} className="slot empty">
                                                        <h3>{`Empty`}</h3>
                                                    </div>
                                                );
                                            }

                                            const character: Character | undefined = characters.find(c => c.name === member.characterName);
                                            if (!character) return null;
                                            
                                            const elementIconUrl: string = elementIconMap[character.element];

                                            return (
                                                <div
                                                    key={charIndex}
                                                    className="slot"
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

                        {/* Clear button */}
                        <button
                            onClick={_ => updateCurrentLoadout([])}
                            className="button clear"
                            title="Clear Loadout"
                        >
                            <ClearIcon />
                            
                            <span>{`Clear`}</span>
                        </button>

                        {/* Copy Loadout to Clipboard */}
                        <ScreenshotButton action="clipboard" targetElementId="loadout" />

                        {/* Download Clipboard */}
                        <ScreenshotButton action="download" targetElementId="loadout" />
                        
                        {/* Loadout Menu */}
                        <button
                            onClick={_ => setShowResetConfirmation(true)}
                            className="button menu"
                            title="Open Menu"
                        >
                            <span>{`Loadout Menu (WIP)`}</span>
                        </button>

                        {/* Toggle Character Names Visibility */}
                        {/* <button
                            onClick={_ => setShowCharacters(prev => !prev)}
                            className="button toggle-names"
                            data-hidden={!showCharacters}
                            title={showCharacters ? "Hide Character Names in Breakdown" : "Show Character Names in Breakdown"}
                        >
                            {showCharacters ? "Hide Team" : "Show Team"}
                        </button> */}
                        
                        {/* Reset All Loadouts Button + Confirmation Modal */}
                        {/* <button
                            onClick={_ => setShowResetConfirmation(true)}
                            className="button reset-all"
                        >
                            {`Reset All Loadouts`}
                        </button> */}
                        {/* <ConfirmationModal
                            isOpen={showResetConfirmation}
                            onConfirm={handleConfirmResetAll}
                            onCancel={handleCancelResetAll}
                            title="Reset All Loadouts"
                            message="This action cannot be undone and will permanently delete all your saved loadouts"
                            confirmText="Reset All"
                            isDangerous
                        /> */}

                        {/* Load Preset Roster */}
                        {/* <PresetTeamsDropdown 
                            onSelectTeam={updateCurrentLoadout} 
                            characters={characters}
                            lightcones={lightcones}
                        /> */}
                    </div>
                </div>

                {/* Notes Box */}
                <div className="notes-box">
                    <div className="notes-header">
                        <h3 className="text-white font-medium">Notes</h3>
                        <span className="text-gray-400 text-sm">
                            {(currentLoadout.notes || "").length}/1000
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
                selectedCharacters={resolvedTeam.map(member => ({ characterId: member.characterId, action: "pick" } as SelectedCharacter))}
                isDraftComplete={resolvedTeam.length >= teamSize}
                isDraftStarted={true}
                onCharacterSelect={handleCharacterSelect}
                currentPhase={{ team: "test", action: "test" }}
                canBanCharacter={undefined}
            />
        </div>
    );
}