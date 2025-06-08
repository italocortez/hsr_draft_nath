import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CharacterPoolProps {
  characters: any[];
  selectedCharacters: Id<"character">[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCharacterSelect: (characterId: Id<"character">) => void;
  currentPhase?: { team: string; action: string };
  isDraftComplete: boolean;
  isDraftStarted: boolean;
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
}: CharacterPoolProps) {
  const icons = useQuery(api.icons.list) || [];
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

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

  // Create role to icon mapping
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

  const getCharacterImageUrl = (character: any) => {
    if (character.imageUrl) {
      return character.imageUrl;
    }
    // Fallback to placeholder if no imageUrl
    return `https://via.placeholder.com/100x100/374151/ffffff?text=${encodeURIComponent(
      character.display_name.slice(0, 2)
    )}`;
  };

  const isCharacterSelectable = (characterId: Id<"character">) => {
    return !selectedCharacters.includes(characterId) && !isDraftComplete && currentPhase && isDraftStarted;
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        {/* Column 1: Element Filters */}
        <div className="flex justify-start">
          {uniqueElements.length > 0 && (
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">Filter by Element:</span>
                {selectedElements.length > 0 && (
                  <button
                    onClick={clearAllElementFilters}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline"
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
                        flex items-center justify-center w-10 h-10 rounded-full transition-all
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
                          className="w-6 h-6 object-contain"
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
                  <span className="text-sm text-gray-400 font-medium">Filter by Role:</span>
                  {selectedRoles.length > 0 && (
                    <button
                      onClick={clearAllRoleFilters}
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline"
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
                          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
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
                            className="w-4 h-4 object-contain"
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
                className="text-xs text-red-400 hover:text-red-300 underline font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Column 3: Search and Status */}
        <div className="flex flex-col items-end gap-2">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {currentPhase && !isDraftComplete && isDraftStarted && (
            <div className="text-sm text-gray-300">
              <span className={`font-medium ${currentPhase.team === "blue" ? "text-blue-400" : "text-red-400"}`}>
                {currentPhase.team === "blue" ? "Blue Team" : "Red Team"}
              </span>{" "}
              {currentPhase.action}
            </div>
          )}
          {!isDraftStarted && !isDraftComplete && (
            <div className="text-sm text-yellow-400 font-medium">
              Press "Start Draft" to begin
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filteredCharacters.map((character) => {
          const isSelected = selectedCharacters.includes(character._id);
          const isSelectable = isCharacterSelectable(character._id);

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
                  ? "border-red-500 opacity-50 cursor-not-allowed" 
                  : isSelectable
                    ? `${rarityBorderColor} hover:border-cyan-400 cursor-pointer`
                    : `${rarityBorderColor} opacity-50 cursor-not-allowed`
                }
              `}
            >
              <div className={`absolute inset-0 ${rarityBgGradient}`}></div>
              <img
                src={getCharacterImageUrl(character)}
                alt={character.display_name}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/100x100/374151/ffffff?text=${encodeURIComponent(
                    character.display_name.slice(0, 2)
                  )}`;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate z-20">
                {character.display_name}
              </div>
              {isSelected && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center z-30">
                  <span className="text-white font-bold text-xs">TAKEN</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          {searchTerm || selectedRoles.length > 0 || selectedElements.length > 0
            ? "No characters found matching your filters." 
            : "Loading characters..."
          }
        </div>
      )}
    </div>
  );
}
