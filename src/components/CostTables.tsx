import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RuleSet } from "./DraftingInterface";

interface CostTablesProps {
  characters: any[];
  lightcones: any[];
}

export function CostTables({ characters, lightcones }: CostTablesProps) {
  const icons = useQuery(api.icons.list) || [];
  const [selectedRuleSet, setSelectedRuleSet] = useState<RuleSet>("apocalypticshadow");
  const [characterSearch, setCharacterSearch] = useState("");
  const [lightconeSearch, setLightconeSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

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

  const filteredCharacters = useMemo(() => {
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

    return filtered;
  }, [characters, characterSearch, selectedRoles]);

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

  const filteredLightcones = lightcones.filter(lightcone => {
    if (!lightconeSearch.trim()) return true;
    return lightcone.aliases.some((alias: string) => 
      alias.toLowerCase().includes(lightconeSearch.toLowerCase())
    ) || lightcone.display_name.toLowerCase().includes(lightconeSearch.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Characters Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="space-y-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Character Costs</h2>
          <div className="flex items-center gap-4">
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
                <th className="text-left py-3 px-4 font-medium">Character</th>
                <th className="text-center py-3 px-4 font-medium">Rarity</th>
                <th className="text-center py-3 px-4 font-medium">E0</th>
                <th className="text-center py-3 px-4 font-medium">E1</th>
                <th className="text-center py-3 px-4 font-medium">E2</th>
                <th className="text-center py-3 px-4 font-medium">E3</th>
                <th className="text-center py-3 px-4 font-medium">E4</th>
                <th className="text-center py-3 px-4 font-medium">E5</th>
                <th className="text-center py-3 px-4 font-medium">E6</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharacters.map((character) => (
                <tr key={character._id} className="border-b border-gray-700 hover:bg-gray-700">
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
        <div className="flex items-center justify-between gap-4 mb-4">
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
                <th className="text-left py-3 px-4 font-medium">Lightcone</th>
                <th className="text-center py-3 px-4 font-medium">Rarity</th>
                <th className="text-center py-3 px-4 font-medium">S1</th>
                <th className="text-center py-3 px-4 font-medium">S2</th>
                <th className="text-center py-3 px-4 font-medium">S3</th>
                <th className="text-center py-3 px-4 font-medium">S4</th>
                <th className="text-center py-3 px-4 font-medium">S5</th>
              </tr>
            </thead>
            <tbody>
              {filteredLightcones.map((lightcone) => (
                <tr key={lightcone._id} className="border-b border-gray-700 hover:bg-gray-700">
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
