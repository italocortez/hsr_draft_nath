import { useState, useMemo, useEffect } from "react";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "../css/CharacterPool.css";
import { SelectedCharacter } from "./DraftingInterface";
import "../css/CharacterPool.css";
import { SelectedCharacter } from "./DraftingInterface";

interface CharacterPoolProps {
  characters: any[];
  selectedCharacters: SelectedCharacter[];
  selectedCharacters: SelectedCharacter[];
  onCharacterSelect: (characterId: Id<"character">) => void;
  currentPhase?: { team: string; action: string } | null;
  currentPhase?: { team: string; action: string } | null;
  isDraftComplete: boolean;
  isDraftStarted: boolean;
  canBanCharacter?: (characterId: Id<"character">, team: "blue" | "red") => boolean;
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


  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get unique roles from characters
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(characters.map(char => char.role))].filter(Boolean);
    return roles.sort();
  }, [characters]);

  // Get unique elements from characters
  const uniqueElements = useMemo(() => {
    const elements = [...new Set(characters.map(char => char.element))].filter(Boolean);
    return elements.sort();
  }, [characters]);

  // Create icon mappings
  // Create icon mappings
  const roleIconMap = useMemo(() => {
    const map: Record<string, string> = {};
    uniqueRoles.forEach(role => {
      const icon = icons.find(icon => icon.name === role);
      if (icon) {
        map[role] = icon.imageUrl;
      }
    });
    return map;
  }, [uniqueRoles, icons]);

  // Create element to icon mapping
  const elementIconMap = useMemo(() => {
    const map: Record<string, string> = {};
    uniqueElements.forEach(element => {
      const icon = icons.find(icon => icon.name === element);
      if (icon) {
        map[element] = icon.imageUrl;
      }
    });
    return map;
  }, [uniqueElements, icons]);

  // Filter characters based on search term, selected roles, and selected elements
  const filteredCharacters = useMemo(() => {
    let filtered = characters;

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
    const isCharacterSelectable = (characterId: Id<"character">) => {
        if (selectedCharacters.some(selected => selected.characterId === characterId) || isDraftComplete || !currentPhase || !isDraftStarted) {
            return false;
        }

        // Check ban restrictions for ban actions
        if (currentPhase.action === "ban" && canBanCharacter) {
            return canBanCharacter(characterId, currentPhase.team as "blue" | "red");
        }
        // Check ban restrictions for ban actions
        if (currentPhase.action === "ban" && canBanCharacter) {
            return canBanCharacter(characterId, currentPhase.team as "blue" | "red");
        }

        return true;
    };
        return true;
    };

    const toggleRoleFilter = (role: string) => {
        setSelectedRoles(prev => 
            prev.includes(role) 
            ? prev.filter(r => r !== role)
            : [...prev, role]
        );
    };
    const toggleRoleFilter = (role: string) => {
        setSelectedRoles(prev => 
            prev.includes(role) 
            ? prev.filter(r => r !== role)
            : [...prev, role]
        );
    };

    const toggleElementFilter = (element: string) => {
        setSelectedElements(prev => 
            prev.includes(element) 
            ? prev.filter(e => e !== element)
            : [...prev, element]
        );
    };
    const toggleElementFilter = (element: string) => {
        setSelectedElements(prev => 
            prev.includes(element) 
            ? prev.filter(e => e !== element)
            : [...prev, element]
        );
    };

    const clearAllRoleFilters = () => {
        setSelectedRoles([]);
    };
    const clearAllRoleFilters = () => {
        setSelectedRoles([]);
    };

    const clearAllElementFilters = () => {
        setSelectedElements([]);
    };
    const clearAllElementFilters = () => {
        setSelectedElements([]);
    };

    const clearAllFilters = () => {
        setSelectedRoles([]);
        setSelectedElements([]);
        setSearchTerm("");
    };

    const wrapCharacterSelect = (characterID: Id<"character">) => {
        if (!isCharacterSelectable(characterID)) return;

        // Upon selecting a Character, reset all filters - ensure UI updates
        clearAllFilters();
        
        onCharacterSelect(characterID);
    }
    
    const currentTurn = currentPhase?.team as "blue" | "red" | undefined;

    const getBorderColor = (): string => {
        if (!currentPhase || !isDraftStarted || isDraftComplete) return ``;
        if (currentTurn === "blue") return `2px solid rgb(59, 130, 246)`;
        if (currentTurn === "red") return `2px solid rgb(239, 68, 68)`;
        return ``;
    }
    
    const getBackgroundColor = (): string => {
        if (!currentPhase || !isDraftStarted || isDraftComplete) return ``;
        // if (currentTurn === "blue") return `rgb(31, 44, 71)`;
        // if (currentTurn === "red") return `rgb(55, 37, 41)`;
        if (currentTurn === "blue") return `rgba(31, 41, 55, 0.05)`;
        if (currentTurn === "red") return `rgba(239, 68, 68, 0.05)`;
        return ``;
    }
    const clearAllFilters = () => {
        setSelectedRoles([]);
        setSelectedElements([]);
        setSearchTerm("");
    };

    const wrapCharacterSelect = (characterID: Id<"character">) => {
        if (!isCharacterSelectable(characterID)) return;

        // Upon selecting a Character, reset all filters - ensure UI updates
        clearAllFilters();
        
        onCharacterSelect(characterID);
    }
    
    const currentTurn = currentPhase?.team as "blue" | "red" | undefined;

    const getBorderColor = (): string => {
        if (!currentPhase || !isDraftStarted || isDraftComplete) return ``;
        if (currentTurn === "blue") return `2px solid rgb(59, 130, 246)`;
        if (currentTurn === "red") return `2px solid rgb(239, 68, 68)`;
        return ``;
    }
    
    const getBackgroundColor = (): string => {
        if (!currentPhase || !isDraftStarted || isDraftComplete) return ``;
        // if (currentTurn === "blue") return `rgb(31, 44, 71)`;
        // if (currentTurn === "red") return `rgb(55, 37, 41)`;
        if (currentTurn === "blue") return `rgba(31, 41, 55, 0.05)`;
        if (currentTurn === "red") return `rgba(239, 68, 68, 0.05)`;
        return ``;
    }

    return (
        <div className="CharacterPool Box" style={{ border: getBorderColor(), backgroundColor: getBackgroundColor() }}>
            <div className="filters">
                {/* Column 1: Elements */}
                <div className="elements">
                    {
                        uniqueElements.length > 0 && <>
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

                            {uniqueElements.map(element => {
                                const isSelected = selectedElements.includes(element);
                                const iconUrl = elementIconMap[element];

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
                        </>
                    }
                </div>
    return (
        <div className="CharacterPool Box" style={{ border: getBorderColor(), backgroundColor: getBackgroundColor() }}>
            <div className="filters">
                {/* Column 1: Elements */}
                <div className="elements">
                    {
                        uniqueElements.length > 0 && <>
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

                            {uniqueElements.map(element => {
                                const isSelected = selectedElements.includes(element);
                                const iconUrl = elementIconMap[element];

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
                        </>
                    }
                </div>

                {/* Column 2: Roles */}
                <div className="roles">
                    {
                        uniqueRoles.length > 0 && <>
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

                            {uniqueRoles.map(role => {
                                const isSelected = selectedRoles.includes(role);
                                const iconUrl = roleIconMap[role];

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
                        </>
                    }
                {/* Column 2: Roles */}
                <div className="roles">
                    {
                        uniqueRoles.length > 0 && <>
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

                            {uniqueRoles.map(role => {
                                const isSelected = selectedRoles.includes(role);
                                const iconUrl = roleIconMap[role];

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
                        </>
                    }
                </div>

                {/* Column 3: Search & clear all */}
                <div className="search">
                    <input
                        type="text"
                        placeholder="Search characters..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value as string)}
                        className="focus:outline-none"
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
                    {(!isDraftStarted && !isDraftComplete) && (
                        <h3 className="begin-draft">Press "Start Draft" to begin</h3>
                    )}

                    {(currentPhase && isDraftStarted && !isDraftComplete) && (
                        <h3 className="current-move">
                            <span style={{ color: (currentPhase.team === "blue") ? `rgb(96, 165, 250)` : `rgb(248, 113, 113)` }}>
                                {currentPhase.team === "blue" ? "Blue Team" : (currentPhase.team === "red") ? "Red Team" : ""}
                            </span>
                            {` `}
                            {currentPhase.action}
                        </h3>
                    )}
                </div>
            </div>

            {/* Character pool */}
            <div className="characters-container">
                {filteredCharacters.map(character => {
                    const isSelected: SelectedCharacter | undefined = selectedCharacters.find(selected => selected.characterId === character._id);
                    const isSelectable = isCharacterSelectable(character._id);
                    const isPicked: boolean = isSelected?.action === "pick" || false;
                    const isBanned: boolean = isSelected?.action === "ban" || false;

                    const getCharacterStatus = (): string => {
                        if (isPicked) return `picked`;
                        if (isBanned) return `banned`;
                        if (!isSelectable) return `disabled`;
                        return ``;
                    }
            {/* Character pool */}
            <div className="characters-container">
                {filteredCharacters.map(character => {
                    const isSelected: SelectedCharacter | undefined = selectedCharacters.find(selected => selected.characterId === character._id);
                    const isSelectable = isCharacterSelectable(character._id);
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
