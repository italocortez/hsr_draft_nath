import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RuleSet } from "./DraftingInterface";

interface CostTablesProps {
  characters: any[];
  lightcones: any[];
}

type CharacterSortField = "name" | "rarity" | "E0" | "E1" | "E2" | "E3" | "E4" | "E5" | "E6";
type LightconeSortField = "name" | "rarity" | "S1" | "S2" | "S3" | "S4" | "S5";
type SortDirection = "asc" | "desc";

interface SortState {
  field: string;
  direction: SortDirection;
}

function SortIcon({ direction, isActive }: { direction?: SortDirection; isActive: boolean }) {
  return (
    <div className="inline-flex flex-col ml-1 opacity-60">
      <svg
        className={`w-3 h-3 transition-all duration-200 ${
          isActive && direction === "asc" 
            ? "text-cyan-400 opacity-100 transform scale-110" 
            : "text-gray-400"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      <svg
        className={`w-3 h-3 -mt-1 transition-all duration-200 ${
          isActive && direction === "desc" 
            ? "text-cyan-400 opacity-100 transform scale-110" 
            : "text-gray-400"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

export function CostTables({ characters, lightcones }: CostTablesProps) {
  const icons = useQuery(api.icons.list) || [];
  const [selectedRuleSet, setSelectedRuleSet] = useState<RuleSet>("apocalypticshadow");
  const [characterSearch, setCharacterSearch] = useState("");
  const [lightconeSearch, setLightconeSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  // Sort states
  const [characterSort, setCharacterSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [lightconeSort, setLightconeSort] = useState<SortState>({ field: "name", direction: "asc" });

  // Get unique roles from characters
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(characters.map(char => char.role))].filter(Boolean);
    return roles.sort();
  }, [characters]);

  // Create role icon mapping
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

  const handleCharacterSort = (field: CharacterSortField) => {
    setCharacterSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleLightconeSort = (field: LightconeSortField) => {
    setLightconeSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const sortedAndFilteredCharacters = useMemo(() => {
    let filtered = characters;

    // Apply search filter
    if (characterSearch.trim()) {
      filtered = filtered.filter(char => {
        return char.aliases.some((alias: string) => 
          alias.toLowerCase().includes(characterSearch.toLowerCase())
        ) || char.display_name.toLowerCase().includes(characterSearch.toLowerCase());
      });
    }

    // Apply role filter
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(char => selectedRoles.includes(char.role));
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (characterSort.field) {
        case "name":
          aValue = a.display_name.toLowerCase();
          bValue = b.display_name.toLowerCase();
          break;
        case "rarity":
          aValue = a.rarity;
          bValue = b.rarity;
          break;
        default:
          // Handle E0-E6 columns
          aValue = a.cost[selectedRuleSet][characterSort.field];
          bValue = b.cost[selectedRuleSet][characterSort.field];
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return characterSort.direction === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (characterSort.direction === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sorted;
  }, [characters, characterSearch, selectedRoles, characterSort, selectedRuleSet]);

  const sortedAndFilteredLightcones = useMemo(() => {
    let filtered = lightcones.filter(lightcone => {
      if (!lightconeSearch.trim()) return true;
      return lightcone.aliases.some((alias: string) => 
        alias.toLowerCase().includes(lightconeSearch.toLowerCase())
      ) || lightcone.display_name.toLowerCase().includes(lightconeSearch.toLowerCase());
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (lightconeSort.field) {
        case "name":
          aValue = a.display_name.toLowerCase();
          bValue = b.display_name.toLowerCase();
          break;
        case "rarity":
          aValue = a.rarity;
          bValue = b.rarity;
          break;
        default:
          // Handle S1-S5 columns
          aValue = a.cost[lightconeSort.field];
          bValue = b.cost[lightconeSort.field];
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return lightconeSort.direction === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (lightconeSort.direction === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sorted;
  }, [lightcones, lightconeSearch, lightconeSort]);

  const toggleRoleFilter = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const clearAllRoleFilters = () => {
    setSelectedRoles([]);
  };

  const renderSortableHeader = (
    label: string,
    field: string,
    currentSort: SortState,
    onSort: (field: any) => void,
    className: string = "text-center py-3 px-4 font-medium"
  ) => {
    const isActive = currentSort.field === field;
    
    return (
      <th 
        className={`${className} cursor-pointer hover:bg-gray-700 transition-colors duration-200 select-none ${
          isActive ? "bg-gray-700" : ""
        }`}
        onClick={() => onSort(field)}
        title={`Sort by ${label}`}
      >
        <div className="flex items-center justify-center">
          <span className={`transition-colors duration-200 ${
            isActive ? "text-cyan-400" : "text-white"
          }`}>
            {label}
          </span>
          <SortIcon direction={currentSort.direction} isActive={isActive} />
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6">
      {/* Characters Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="space-y-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Character Costs</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Rule Set:</label>
              <select
                value={selectedRuleSet}
                onChange={(e) => setSelectedRuleSet(e.target.value as RuleSet)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="apocalypticshadow">Apocalyptic Shadow</option>
                <option value="memoryofchaos">Memory of Chaos</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Search characters..."
              value={characterSearch}
              onChange={(e) => setCharacterSearch(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          </div>

          {/* Role Filters */}
          {uniqueRoles.length > 0 && (
            <div className="flex flex-col gap-2">
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
              <div className="flex flex-wrap gap-2">
                {uniqueRoles.map(role => {
                  const isSelected = selectedRoles.includes(role);
                  const iconUrl = roleIconMap[role];
                  
                  return (
                    <button
                      key={role}
                      onClick={() => toggleRoleFilter(role)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected 
                          ? "bg-cyan-600 text-white border-2 border-cyan-400" 
                          : "bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500"
                      }`}
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-600">
                {renderSortableHeader("Character", "name", characterSort, handleCharacterSort, "text-left py-3 px-4 font-medium")}
                {renderSortableHeader("Rarity", "rarity", characterSort, handleCharacterSort)}
                {renderSortableHeader("E0", "E0", characterSort, handleCharacterSort)}
                {renderSortableHeader("E1", "E1", characterSort, handleCharacterSort)}
                {renderSortableHeader("E2", "E2", characterSort, handleCharacterSort)}
                {renderSortableHeader("E3", "E3", characterSort, handleCharacterSort)}
                {renderSortableHeader("E4", "E4", characterSort, handleCharacterSort)}
                {renderSortableHeader("E5", "E5", characterSort, handleCharacterSort)}
                {renderSortableHeader("E6", "E6", characterSort, handleCharacterSort)}
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredCharacters.map((character) => (
                <tr key={character._id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150">
                  <td className="py-3 px-4">{character.display_name}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-block w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                        character.rarity === 5 ? "bg-amber-500 text-black" : 
                        character.rarity === 4 ? "bg-purple-500 text-white" : 
                        "bg-gray-500 text-white"
                      }`}>
                        {character.rarity}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-amber-400">{character.cost[selectedRuleSet].E0}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{character.cost[selectedRuleSet].E1}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{character.cost[selectedRuleSet].E2}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{character.cost[selectedRuleSet].E3}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{character.cost[selectedRuleSet].E4}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{character.cost[selectedRuleSet].E5}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{character.cost[selectedRuleSet].E6}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightcones Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-white">Lightcone Costs</h2>
          <input
            type="text"
            placeholder="Search lightcones..."
            value={lightconeSearch}
            onChange={(e) => setLightconeSearch(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-600">
                {renderSortableHeader("Lightcone", "name", lightconeSort, handleLightconeSort, "text-left py-3 px-4 font-medium")}
                {renderSortableHeader("Rarity", "rarity", lightconeSort, handleLightconeSort)}
                {renderSortableHeader("S1", "S1", lightconeSort, handleLightconeSort)}
                {renderSortableHeader("S2", "S2", lightconeSort, handleLightconeSort)}
                {renderSortableHeader("S3", "S3", lightconeSort, handleLightconeSort)}
                {renderSortableHeader("S4", "S4", lightconeSort, handleLightconeSort)}
                {renderSortableHeader("S5", "S5", lightconeSort, handleLightconeSort)}
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredLightcones.map((lightcone) => (
                <tr key={lightcone._id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150">
                  <td className="py-3 px-4">{lightcone.display_name}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-block w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                        lightcone.rarity === 5 ? "bg-amber-500 text-black" : 
                        lightcone.rarity === 4 ? "bg-purple-500 text-white" : 
                        "bg-gray-500 text-white"
                      }`}>
                        {lightcone.rarity}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-amber-400">{lightcone.cost.S1}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{lightcone.cost.S2}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{lightcone.cost.S3}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{lightcone.cost.S4}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{lightcone.cost.S5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
