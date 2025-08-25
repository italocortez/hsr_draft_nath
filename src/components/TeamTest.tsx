import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { RuleSet, SelectedCharacter } from "./DraftingInterface";
import { CharacterPool } from "./CharacterPool";
import "../css/TeamTest.css";
import LightconeSelector from "./LightconeSelector";
import { Character, CharacterRank, Eidolons, Element, Lightcone, LightconeRank, Path, SuperImpositions, UniqueElements, UniquePaths } from "@/lib/utils";
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
    lightcones: Lightcone[];
}

export function TeamTest({ characters, lightcones }: TeamTestProps) {
    const icons = useQuery(api.icons.list) || [];
    const [loadouts, setLoadouts] = useState<Loadout[]>(LoadoutManager.loadLoadouts());
    const [loadoutIndex, setLoadoutIndex] = useState<number>(LoadoutManager.loadCurrentLoadoutIndex());
    const [ruleSet, setRuleSet] = useState<RuleSet>(LoadoutManager.loadRulesetView());
    
    const [editingName, setEditingName] = useState<boolean>(false); // Is User currently editing a Loadout's name
    const [tempName, setTempName] = useState<string>(""); // Temporary field for editing a Loadout's name
    const [showCharacters, setShowCharacters] = useState<boolean>(true); // Show character names on the cost breakdown chart
    const [showResetConfirmation, setShowResetConfirmation] = useState<boolean>(false); // Show overlay to confirm resetting Loadouts

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

    const getTotalCost = (ruleSet: RuleSet): number => {
        return resolvedTeam.reduce((total, member) => {
            const character = characters.find(c => c._id === member.characterId);
            if (!character) return total;

            let cost = character.cost[ruleSet][member.rank];
            
            if (member.lightconeId && member.lightconeRank) {
                const lightcone = lightcones.find(l => l._id === member.lightconeId);
                if (lightcone) cost += lightcone.cost[member.lightconeRank];
            }
            
            return total + cost;
        }, 0);
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
        lightcone: (ruleSet === "memoryofchaos") ? "#60a5fa" : "#a78bfa"
    });

    return (
        <div className="TeamTest">
            <div className="main" id="loadout">
                {/* Team view */}
                <div className="roster Box">
                    <h2 className="sub-header">{`Team (${resolvedTeam.length}/${teamSize})`}</h2>

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
                                            onClick={_ => handleRemoveMember(index)}
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
                                                value={member.rank as CharacterRank}
                                                onChange={e => handleMemberUpdate(index, { rank: e.target.value as CharacterRank })}
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
                                                        onChange={e => handleMemberUpdate(index, { lightconeRank: e.target.value as LightconeRank })}
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
                                                if (ctx.datasetIndex !== 1) return '';
                                                
                                                const member = resolvedTeam[ctx.dataIndex];
                                                const char = characters.find(c => c._id === member.characterId);
                                                if (!char) return '';

                                                let total = char.cost[ruleSet][member.rank];
                                                if (member.lightconeId && member.lightconeRank) {
                                                    const lc = lightcones.find(l => l._id === member.lightconeId);
                                                    if (lc) total += lc.cost[member.lightconeRank];
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
                        </div>
                        
                        {/* Total Cost */}
                        <h2 className="total-cost">{`Σ ${getTotalCost(ruleSet).toFixed(1)}`}</h2>
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
                            onClick={_ => updateCurrentLoadout([])}
                            className="button clear"
                        >
                            {`Remove all`}
                        </button>

                        {/* Reset All Loadouts Button + Confirmation Modal */}
                        <button
                            onClick={_ => setShowResetConfirmation(true)}
                            className="button reset-all"
                        >
                            {`Reset All Loadouts`}
                        </button>
                        <ConfirmationModal
                            isOpen={showResetConfirmation}
                            onConfirm={handleConfirmResetAll}
                            onCancel={handleCancelResetAll}
                            title="Reset All Loadouts"
                            message="This action cannot be undone and will permanently delete all your saved loadouts"
                            confirmText="Reset All"
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
