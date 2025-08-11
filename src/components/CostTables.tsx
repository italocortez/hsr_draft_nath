import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RuleSet } from "./DraftingInterface";
import { Character, CharacterRank, Lightcone, LightconeRank, Rarity, Role, UniqueRoles } from "@/lib/utils";

interface CostTablesProps {
  characters: Character[];
  lightcones: Lightcone[];
}

type SortDirection = "asc" | "desc";
type CharacterSortField = "name" | "rarity" | CharacterRank;
type LightconeSortField = "name" | "rarity" | LightconeRank;

interface CharacterSortState {
  field: CharacterSortField;
  direction: SortDirection;
}
interface LightconeSortState {
  field: LightconeSortField;
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
    const [characterSearchTerm, setCharacterSearchTerm] = useState<string>("");
    const [lightconeSearchTerm, setLightconeSearchTerm] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    
    // Sort states
    const [characterSort, setCharacterSort] = useState<CharacterSortState>({ field: "name", direction: "asc" });
    const [lightconeSort, setLightconeSort] = useState<LightconeSortState>({ field: "name", direction: "asc" });

    // Create Role Icon mappings
    const roleIconMap = useMemo(() => {
        const map = {} as Record<Role, string>;
        [...UniqueRoles].forEach(role => {
            const icon = icons.find(icon => icon.name === role);
            if (icon) map[role] = icon.imageUrl;
        });
        return map;
    }, [icons]);

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

    const sortedAndFilteredCharacters = useMemo((): Character[] => {
        let filtered: Character[] = characters;

        // Apply search filter
        if (characterSearchTerm.trim()) {
            filtered = filtered.filter(char => {
                return char.aliases.some((alias: string) => 
                    alias.toLowerCase().includes(characterSearchTerm.toLowerCase())
                    ) || char.display_name.toLowerCase().includes(characterSearchTerm.toLowerCase());
            });
        }

        // Apply role filter
        if (selectedRoles.length > 0) {
            filtered = filtered.filter(char => selectedRoles.includes(char.role));
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

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
                    aValue = a.cost[selectedRuleSet][characterSort.field];
                    bValue = b.cost[selectedRuleSet][characterSort.field];
                    break;
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
                return characterSort.direction === "asc" 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return characterSort.direction === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });

        return sorted;
    }, [characters, characterSearchTerm, selectedRoles, characterSort, selectedRuleSet]);

    const sortedAndFilteredLightcones = useMemo((): Lightcone[] => {
        let filtered: Lightcone[] = lightcones;
        
        // Apply search filter
        filtered = filtered.filter(lightcone => {
            if (!lightconeSearchTerm.trim()) return true;
            
            return lightcone.aliases.some((alias: string) => 
                alias.toLowerCase().includes(lightconeSearchTerm.toLowerCase())
                ) || lightcone.display_name.toLowerCase().includes(lightconeSearchTerm.toLowerCase());
        });

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

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
                    aValue = a.cost[lightconeSort.field];
                    bValue = b.cost[lightconeSort.field];
                    break;
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
                return lightconeSort.direction === "asc" 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return lightconeSort.direction === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });

        return sorted;
    }, [lightcones, lightconeSearchTerm, lightconeSort]);

    const toggleRoleFilter = (role: Role) => {
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
        currentSort: CharacterSortState | LightconeSortState,
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
              value={characterSearchTerm}
              onChange={(e) => setCharacterSearchTerm(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          </div>

            {/* Role Filters */}
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
                {[...UniqueRoles].map(role => {
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
            value={lightconeSearchTerm}
            onChange={(e) => setLightconeSearchTerm(e.target.value)}
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
