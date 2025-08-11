import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "../css/CharacterPool.css";
import { SelectedCharacter } from "./DraftingInterface";
import { Character, Element, Role, Team, Turn, UniqueElements, UniqueRoles } from "@/lib/utils";

interface CharacterPoolProps {
    characters: Character[];
    selectedCharacters: SelectedCharacter[];
    onCharacterSelect: (characterId: Id<"character">) => void;
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

        return filtered;
    }, [characters, searchTerm, selectedRoles, selectedElements]);

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

    const clearAllRoleFilters = () => setSelectedRoles([]);
    const clearAllElementFilters = () => setSelectedElements([]);
    const clearAllFilters = () => {
        clearAllRoleFilters();
        clearAllElementFilters();
        setSearchTerm("");
    };

    const wrapCharacterSelect = (characterID: Id<"character">) => {
        if (!isCharacterSelectable(characterID)) return;

        // Upon selecting a Character, reset all filters - ensure UI updates
        clearAllFilters();
        
        onCharacterSelect(characterID);
    }

    const getCurrentColor = (): string => {
        if (!currentPhase || !isDraftStarted || isDraftComplete) return ``;
        if (currentPhase?.team === "blue") return `blue`;
        if (currentPhase?.team === "red") return `red`;
        return ``;
    }

    return (
        <div className={`CharacterPool Box ${getCurrentColor()}`}>
            <div className="filters">
                {/* Column 1: Elements */}
                <div className="elements">
                    <div className="sub-header">
                        <h3 className="title">Filter by Element:</h3>

                        {/* Clear Elements Button */}
                        {selectedElements.length > 0 && (
                            <button
                                onClick={clearAllElementFilters}
                                className="clear-button"
                            >
                                {`Clear Elements`}
                            </button>
                        )}
                    </div>
                    
                    {[...UniqueElements].map(element => {
                        const isSelected: boolean = selectedElements.includes(element);
                        const iconUrl: string = elementIconMap[element];

                        return (
                            <button
                                key={element}
                                onClick={_ => toggleElementFilter(element)}
                                className={`elem-button ${isSelected ? `selected` : ``} focus:outline-none`}
                                title={element}
                            >
                                {iconUrl && (
                                    <img
                                        src={iconUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='10' font-weight='bold' text-anchor='middle' fill='white'>${element.slice(0, 4)}</text></svg>`}
                                        alt={element}
                                        className="elem-img"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Column 2: Roles */}
                <div className="roles">
                    <div className="sub-header">
                        <h3 className="title">Filter by Role:</h3>

                        {/* Clear Roles Button */}
                        {
                            selectedRoles.length > 0 && <>
                                <button
                                    onClick={clearAllRoleFilters}
                                    className="clear-button"
                                >
                                    {`Clear Roles`}
                                </button>
                            </>
                        }
                    </div>

                    {[...UniqueRoles].map(role => {
                        const isSelected: boolean = selectedRoles.includes(role);
                        const iconUrl: string = roleIconMap[role];

                        return (
                            <button
                                key={role}
                                onClick={_ => toggleRoleFilter(role)}
                                className={`role-button ${isSelected ? `selected` : ``} focus:outline-none`}
                                title={role}
                            >
                                {/* Role's Icon */}
                                {iconUrl && (
                                    <img
                                        src={iconUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='10' font-weight='bold' text-anchor='middle' fill='white'>${role.slice(0, 3)}</text></svg>`}
                                        alt={role}
                                        className="role-img"
                                    />
                                )}
                                
                                {/* Role's title */}
                                <span className="capitalize">{role}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Column 3: Search & clear all */}
                <div className="search">
                    <input
                        type="text"
                        placeholder="Search characters..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value as string)}
                        className="focus:outline-none"
                        name="search-bar"
                    />

                    {/* Clear All Filters Button */}
                    {(selectedRoles.length > 0 || selectedElements.length > 0 || searchTerm.trim().length > 0) && (
                        <button
                            className="clear-all-button"
                            onClick={clearAllFilters}
                        >
                            {`Clear All Filters`}
                        </button>
                    )}
                </div>

                {/* Column 4: Shortened Draft status */}
                <div className="status">
                    {currentPhase?.action !== "test" && <>
                        {(!isDraftStarted && !isDraftComplete) && (
                            <h3 className="begin-draft">Press "Start Draft" to begin</h3>
                        )}

                        {(currentPhase && isDraftStarted && !isDraftComplete) && (
                            <h3 className="current-move">
                                <span style={{ color: (currentPhase.team === "blue") ? `rgb(59, 130, 246)` : `rgb(239, 68, 68)` }}>
                                    {currentPhase.team === "blue" ? "Blue Team" : "Red Team"}
                                </span>
                                {` `}
                                {currentPhase.action}
                            </h3>
                        )}

                        {isDraftComplete && (
                            <h3 className="draft-complete">
                                {`Complete!`}
                            </h3>
                        )}
                    </>}
                </div>
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
                            onClick={_ => isSelectable && wrapCharacterSelect(character._id)}
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