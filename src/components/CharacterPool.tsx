import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "../css/CharacterPool.css";
import { SelectedCharacter } from "./DraftingInterface";
import { Character, Element, Path, Role, Team, Turn, UniqueElements, UniquePaths, UniqueRoles } from "@/lib/utils";

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

interface CharacterPoolProps {
    characters: Character[];
    selectedCharacters: SelectedCharacter[];
    onCharacterSelect: (character: Character) => void;
    currentPhase?: Turn;
    isDraftComplete: boolean;
    isDraftStarted: boolean;
    canBanCharacter?: (characterId: Id<"character">, team: Team) => boolean;
}

export function CharacterPool({
  characters,
  selectedCharacters,
  onCharacterSelect,
  currentPhase,
  isDraftComplete,
  isDraftStarted,
  canBanCharacter,
}: CharacterPoolProps) {
    const icons = useQuery(api.icons.list) || [];

    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<Path[]>([]);
    const [selectedElements, setSelectedElements] = useState<Element[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Create Role Icon mappings
    const roleIconMap = useMemo(() => {
        const map = {} as Record<Role, string>;
        [...UniqueRoles].forEach(role => {
            const icon = icons.find(icon => icon.name === role);
            if (icon) map[role] = icon.imageUrl;
        });
        return map;
    }, [icons]);

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

    // Filter characters based on search term, selected roles, and selected elements
    const filteredCharacters = useMemo((): Character[] => {
        let filtered: Character[] = characters;

        // Apply search filter (existing logic)
        if (searchTerm.trim()) {
            filtered = filtered.filter(char => {
                return char.aliases.some((alias: string) => 
                    alias.toLowerCase().includes(searchTerm.toLowerCase())
                    ) || char.display_name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        // Apply role filter
        if (selectedRoles.length > 0) {
            filtered = filtered.filter(char => selectedRoles.includes(char.role));
        }

        // Apply element filter
        if (selectedElements.length > 0) {
            filtered = filtered.filter(char => selectedElements.includes(char.element));
        }

        // Apply path filter
        if (selectedPaths.length > 0) {
            filtered = filtered.filter(char => selectedPaths.includes(char.path));
        }

        return filtered;
    }, [characters, searchTerm, selectedRoles, selectedElements, selectedPaths]);

    const isCharacterSelectable = (characterId: Id<"character">) => {
        if (selectedCharacters.some(selected => selected.characterId === characterId) || isDraftComplete || !currentPhase || !isDraftStarted) {
            return false;
        }

        // Check ban restrictions for ban actions
        if ((currentPhase.action === "ban") && canBanCharacter) {
            return canBanCharacter(characterId, currentPhase.team);
        }

        return true;
    };

    const toggleRoleFilter = (role: Role) => {
        setSelectedRoles(prev => 
            prev.includes(role) 
            ? prev.filter(r => r !== role)
            : [...prev, role]
        );
    };

    const toggleElementFilter = (element: Element) => {
        setSelectedElements(prev => 
            prev.includes(element) 
            ? prev.filter(e => e !== element)
            : [...prev, element]
        );
    };

    const togglePathFilter = (path: Path) => {
        setSelectedPaths(prev => 
            prev.includes(path) 
            ? prev.filter(e => e !== path)
            : [...prev, path]
        );
    };

    const clearAllRoleFilters = () => setSelectedRoles([]);
    const clearAllPathFilters = () => setSelectedPaths([]);
    const clearAllElementFilters = () => setSelectedElements([]);
    const clearAllFilters = () => {
        clearAllRoleFilters();
        clearAllPathFilters();
        clearAllElementFilters();
        setSearchTerm("");
    };

    const wrapCharacterSelect = (character: Character) => {
        if (!isCharacterSelectable(character._id)) return;

        // Upon selecting a Character, reset all filters - ensure UI updates
        clearAllFilters();
        
        onCharacterSelect(character);
    }

    const getCurrentColor = (): string => {
        if (!currentPhase || !isDraftStarted || isDraftComplete) return ``;
        if (currentPhase?.team === "blue") return `blue`;
        if (currentPhase?.team === "red") return `red`;
        return ``;
    }

    return (
        <div className={`CharacterPool Box ${getCurrentColor()}`}>
            {/* Filter options */}
            <div className="filters">
                {/* Roles */}
                <div className="roles">
                    {[...UniqueRoles].map(role => {
                        const isSelected: boolean = selectedRoles.includes(role);
                        const iconUrl: string = roleIconMap[role];

                        return (
                            <button
                                key={role}
                                onClick={_ => toggleRoleFilter(role)}
                                className={`role ${isSelected ? `selected` : ``}`}
                                title={role}
                            >
                                {iconUrl && (
                                    <img
                                        src={iconUrl}
                                        alt={role}
                                        style={{ height: `1.25rem`, width: `1.25rem` }}
                                    />
                                )}
                                
                                <span className="capitalize">{role}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Elements */}
                <div className="elements">
                    {[...UniqueElements].map(element => {
                        const isSelected: boolean = selectedElements.includes(element);
                        const iconUrl: string = elementIconMap[element];

                        return (
                            <button
                                key={element}
                                onClick={_ => toggleElementFilter(element)}
                                className={`elem ${isSelected ? `selected` : ``}`}
                                title={element}
                            >
                                {iconUrl && (
                                    <img
                                        src={iconUrl}
                                        alt={element}
                                        style={{ height: `1.875rem`, width: `1.875rem` }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Paths */}
                <div className="paths">
                    {[...UniquePaths].map(path => {
                        const isSelected: boolean = selectedPaths.includes(path);
                        const iconUrl: string = pathIconMap[path];

                        return (
                            <button
                                key={path}
                                onClick={_ => togglePathFilter(path)}
                                className={`path ${isSelected ? `selected` : ``}`}
                                title={path}
                            >
                                {iconUrl && (
                                    <img
                                        src={iconUrl}
                                        alt={path}
                                        style={{ height: `1.5rem`, width: `1.5rem` }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Search bar */}
                <input
                    type="text"
                    placeholder="Search characters..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value as string)}
                    className="search-bar focus:outline-none"
                    name="search-bar"
                />

                {/* Clear All Filters */}
                <button
                    className="clear-button"
                    onClick={clearAllFilters}
                    disabled={!(selectedRoles.length > 0 || selectedPaths.length > 0 || selectedElements.length > 0 || searchTerm.trim().length > 0)}
                    title={`Clear all filters`}
                >
                    <ClearIcon />

                    <span>{`Clear`}</span>
                </button>
            </div>

            {/* Draft Status */}
            <div className="status-container">
                {(currentPhase?.action !== "test") && <>
                    {!isDraftStarted && <h3 className="begin-draft">Press "Start Draft" to begin</h3>}
                    {isDraftComplete && <h3 className="draft-complete">Complete!</h3>}
                </>}
            </div>
            
            {/* Character pool */}
            <div className="characters-container">
                {filteredCharacters.map(character => {
                    const isSelected: SelectedCharacter | undefined = selectedCharacters.find(selected => selected.characterId === character._id);
                    const isSelectable: boolean = isCharacterSelectable(character._id);
                    const isPicked: boolean = isSelected?.action === "pick" || false;
                    const isBanned: boolean = isSelected?.action === "ban" || false;

                    const getCharacterStatus = (): string => {
                        if (isPicked) return `picked`;
                        if (isBanned) return `banned`;
                        if (!isSelectable) return `disabled`;
                        return ``;
                    }

                    return (
                        <button
                            key={character._id}
                            className={`character ${getCharacterStatus()}`}
                            onClick={_ => isSelectable && wrapCharacterSelect(character)}
                            disabled={!isSelectable}
                            data-rarity={character.rarity}
                        >   
                            {isSelected && (
                                <div className="status-overlay">
                                    <h3>{isPicked ? `Picked` : isBanned ? `Banned` : `Unavailable`}</h3>
                                </div>
                            )}
                            
                            {/* Character IMG */}
                            <img
                                src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                className="portrait"
                                alt={character.display_name}
                                title={`${character.display_name}`}
                            />
                            
                            <h3 className="name">{character.display_name}</h3>
                        </button>
                    );
                })}
            </div>

            {/* Information */}
            {(filteredCharacters.length === 0) && <>
                <h3 className="info">
                    {
                        (searchTerm || selectedRoles.length > 0 || selectedElements.length > 0) ? 
                            "No characters found matching your filters."
                        :
                            "Loading characters..."
                    }
                </h3>
            </>}
        </div>
    );
}