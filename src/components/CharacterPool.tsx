import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RuleSet, CharacterRank, LightconeRank, DraftedCharacter } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";

interface CharacterPoolProps {
  characters: any[];
  selectedCharacters: Id<"character">[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCharacterSelect: (characterId: Id<"character">) => void;
  currentPhase?: { team: string; action: string } | null;
  isDraftComplete: boolean;
  isDraftStarted: boolean;
  canBanCharacter: (characterId: Id<"character">, team: "blue" | "red") => boolean;
}

export function CharacterPool({
  characters,
  selectedCharacters,
  searchTerm,
  onSearchChange,
  onCharacterSelect,
  currentPhase,
  isDraftComplete,
  isDraftStarted,
  canBanCharacter,
}: CharacterPoolProps) {
  const icons = useQuery(api.icons.list) || [];
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  // Get unique roles and elements from characters
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(characters.map(char => char.role))].filter(Boolean);
    return roles.sort();
  }, [characters]);

  const uniqueElements = useMemo(() => {
    const elements = [...new Set(characters.map(char => char.element))].filter(Boolean);
    return elements.sort();
  }, [characters]);

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

    if (searchTerm.trim()) {
      filtered = filtered.filter(char => {
        return char.aliases.some((alias: string) => 
          alias.toLowerCase().includes(searchTerm.toLowerCase())
        ) || char.display_name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (selectedRoles.length > 0) {
      filtered = filtered.filter(char => selectedRoles.includes(char.role));
    }

    if (selectedElements.length > 0) {
      filtered = filtered.filter(char => selectedElements.includes(char.element));
    }

    return filtered;
  }, [characters, searchTerm, selectedRoles, selectedElements]);

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

  const clearAllRoleFilters = () => {
    setSelectedRoles([]);
  };

  const clearAllElementFilters = () => {
    setSelectedElements([]);
  };

  const clearAllFilters = () => {
    setSelectedRoles([]);
    setSelectedElements([]);
  };

  // Determine current turn from currentPhase
  const currentTurn = currentPhase?.team as "blue" | "red" | undefined;

  // Determine highlight colors based on current turn
  const getHighlightClasses = () => {
    if (!currentTurn || isDraftComplete || !isDraftStarted) return "";
    
    if (currentTurn === "blue") {
      return "border-blue-500 bg-blue-500 bg-opacity-5";
    } else {
      return "border-red-500 bg-red-500 bg-opacity-5";
    }
  };

  const highlightClasses = getHighlightClasses();

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border-2 transition-all duration-300 ${
      currentTurn && isDraftStarted && !isDraftComplete ? `${highlightClasses}` : "border-gray-700"
    }`}>
      <div className="flex items-center justify-center gap-2 mb-4">
        {!isDraftStarted || isDraftComplete ? (
          <h2 className="text-2xl font-bold text-white">Character Pool</h2>
        ) : (
          currentTurn && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentTurn === "blue" 
                ? "bg-blue-600 text-white" 
                : "bg-red-600 text-white"
            }`}>
              {currentTurn === "blue" ? "Blue Team's Turn" : "Red Team's Turn"} - {currentPhase?.action === "ban" ? "Ban" : "Pick"}
            </div>
          )
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
        {/* Column 1: Element Filters */}
        <div className="flex justify-center sm:justify-start">
          {uniqueElements.length > 0 && (
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-400 font-medium">Filter by Element:</span>
                {selectedElements.length > 0 && (
                  <button
                    onClick={clearAllElementFilters}
                    className="text-sm text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Clear Elements
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueElements.map(element => {
                  const isSelected = selectedElements.includes(element);
                  const iconUrl = elementIconMap[element];
                  
                  return (
                    <button
                      key={element}
                      onClick={() => toggleElementFilter(element)}
                      className={`
                        flex items-center justify-center w-12 h-12 rounded-full transition-all
                        ${isSelected 
                          ? "bg-cyan-600 border-2 border-cyan-400" 
                          : "bg-gray-700 border-2 border-gray-600 hover:border-gray-500"
                        }
                      `}
                      title={element}
                    >
                      {iconUrl && (
                        <img
                          src={iconUrl}
                          alt={element}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Role Filters */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-3">
            {/* Role Filters */}
            {uniqueRoles.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-400 font-medium">Filter by Role:</span>
                  {selectedRoles.length > 0 && (
                    <button
                      onClick={clearAllRoleFilters}
                      className="text-sm text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Clear Roles
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {uniqueRoles.map(role => {
                    const isSelected = selectedRoles.includes(role);
                    const iconUrl = roleIconMap[role];
                    
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRoleFilter(role)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-full text-lg font-medium transition-all
                          ${isSelected 
                            ? "bg-cyan-600 text-white border-2 border-cyan-400" 
                            : "bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500"
                          }
                        `}
                      >
                        {iconUrl && (
                          <img
                            src={iconUrl}
                            alt={role}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="capitalize">{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clear All Filters */}
            {(selectedRoles.length > 0 || selectedElements.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-400 hover:text-red-300 underline font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Column 3: Search */}
        <div className="flex flex-col items-center sm:items-end gap-2">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-gray-700 text-white text-lg border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filteredCharacters.map((character) => {
          const isSelected = selectedCharacters.includes(character._id);
          const isSelectable = !isSelected && isDraftStarted && !isDraftComplete;

          const rarityBorderColor = character.rarity === 5 ? "border-amber-400" : character.rarity === 4 ? "border-purple-500" : "border-gray-600";
          const rarityBgGradient = character.rarity === 5 
            ? "bg-gradient-to-b from-[#ad6002] to-[#faa237]" 
            : character.rarity === 4 
              ? "bg-gradient-to-b from-purple-800 to-purple-500" 
              : "bg-gradient-to-b from-gray-700 to-gray-500";

          return (
            <button
              key={character._id}
              onClick={() => isSelectable && onCharacterSelect(character._id)}
              disabled={!isSelectable}
              className={`
                relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                ${isSelected 
                  ? "border-green-500 opacity-50 cursor-not-allowed" 
                  : isSelectable
                    ? `${rarityBorderColor} hover:border-cyan-400 cursor-pointer`
                    : `${rarityBorderColor} opacity-50 cursor-not-allowed`
                }
              `}
            >
              <div className={`absolute inset-0 ${rarityBgGradient}`}></div>
              <img
                src={character.imageUrl || `https://via.placeholder.com/100x100/374151/ffffff?text=${encodeURIComponent(character.display_name.slice(0, 2))}`}
                alt={character.display_name}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/100x100/374151/ffffff?text=${encodeURIComponent(
                    character.display_name.slice(0, 2)
                  )}`;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-sm p-1 truncate z-20 font-medium">
                {character.display_name}
              </div>
              {isSelected && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-30 flex items-center justify-center z-30">
                  <span className="text-white font-bold text-sm">SELECTED</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center text-gray-400 py-8 text-lg">
          {searchTerm || selectedRoles.length > 0 || selectedElements.length > 0
            ? "No characters found matching your filters." 
            : "Loading characters..."
          }
        </div>
      )}
    </div>
  );
}
