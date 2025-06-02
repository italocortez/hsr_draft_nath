import { useState } from "react";
import { RuleSet, CharacterRank, LightconeRank, DraftedCharacter } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import { LightconeSelector } from "./LightconeSelector";

interface TeamTestProps {
  characters: any[];
  lightcones: any[];
}

export function TeamTest({ characters, lightcones }: TeamTestProps) {
  const [ruleSet, setRuleSet] = useState<RuleSet>("memoryofchaos");
  const [searchTerm, setSearchTerm] = useState("");
  const [testTeam, setTestTeam] = useState<DraftedCharacter[]>([]);

  const filteredCharacters = characters.filter(char => {
    if (!searchTerm.trim()) return true;
    return char.aliases.some((alias: string) => 
      alias.toLowerCase().includes(searchTerm.toLowerCase())
    ) || char.display_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedCharacterIds = testTeam.map(d => d.characterId);

  const calculateTotalCost = () => {
    return testTeam.reduce((total, drafted) => {
      const character = characters.find(c => c._id === drafted.characterId);
      if (!character) return total;

      let cost = character.cost[ruleSet][drafted.rank];
      
      if (drafted.lightconeId && drafted.lightconeRank) {
        const lightcone = lightcones.find(l => l._id === drafted.lightconeId);
        if (lightcone) {
          cost += lightcone.cost[drafted.lightconeRank];
        }
      }
      
      return total + cost;
    }, 0);
  };

  const handleCharacterSelect = (characterId: Id<"character">) => {
    if (selectedCharacterIds.includes(characterId) || testTeam.length >= 8) return;

    const newCharacter: DraftedCharacter = {
      characterId,
      rank: "E0",
    };

    setTestTeam(prev => [...prev, newCharacter]);
  };

  const handleCharacterUpdate = (index: number, updates: Partial<DraftedCharacter>) => {
    setTestTeam(prev => {
      const newTeam = [...prev];
      newTeam[index] = { ...newTeam[index], ...updates };
      return newTeam;
    });
  };

  const handleRemoveCharacter = (index: number) => {
    setTestTeam(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setTestTeam([]);
  };

  const getCharacterImageUrl = (characterId: Id<"character">) => {
    const character = characters.find(c => c._id === characterId);
    if (character?.imageUrl) {
      return character.imageUrl;
    }
    return `https://via.placeholder.com/120x120/374151/ffffff?text=${encodeURIComponent(
      character?.display_name?.slice(0, 2) || "??"
    )}`;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Rule Set:</label>
              <select
                value={ruleSet}
                onChange={(e) => setRuleSet(e.target.value as RuleSet)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="memoryofchaos">Memory of Chaos</option>
                <option value="apocalypticshadow">Apocalyptic Shadow</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-white font-medium">
              Total Cost: <span className="text-amber-400">{calculateTotalCost()}</span>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Test Team */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Test Team ({testTeam.length}/8)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => {
            const drafted = testTeam[index];
            if (!drafted) {
              return (
                <div
                  key={index}
                  className="aspect-square bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"
                >
                  <span className="text-gray-500 text-sm">Empty</span>
                </div>
              );
            }

            const character = characters.find(c => c._id === drafted.characterId);
            if (!character) return null;

            const characterCost = character.cost[ruleSet][drafted.rank];
            const lightcone = drafted.lightconeId ? lightcones.find(l => l._id === drafted.lightconeId) : null;
            const lightconeCost = lightcone && drafted.lightconeRank ? lightcone.cost[drafted.lightconeRank] : 0;

            const rarityBorderColor = character.rarity === 5 ? "border-amber-400" : character.rarity === 4 ? "border-purple-500" : "border-gray-600";
            const rarityBgGradient = character.rarity === 5 
              ? "bg-gradient-to-b from-[#ad6002] to-[#faa237]" 
              : character.rarity === 4 
                ? "bg-gradient-to-b from-purple-800 to-purple-500" 
                : "bg-gradient-to-b from-gray-700 to-gray-500";

            return (
              <div key={index} className="space-y-2">
                <div className={`relative aspect-square ${rarityBgGradient} rounded-lg overflow-hidden ${rarityBorderColor} border`}>
                  <div className={`absolute inset-0 ${rarityBgGradient}`}></div>
                  <img
                    src={getCharacterImageUrl(drafted.characterId)}
                    alt={character.display_name}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/120x120/374151/ffffff?text=${encodeURIComponent(
                        character.display_name.slice(0, 2)
                      )}`;
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded z-20">
                    {characterCost + lightconeCost}
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded z-20">
                    {character.display_name}
                  </div>
                  <button
                    onClick={() => handleRemoveCharacter(index)}
                    className="absolute top-1 left-1 bg-red-600 hover:bg-red-700 text-white text-xs w-5 h-5 rounded flex items-center justify-center z-20"
                  >
                    ×
                  </button>
                </div>
                
                <select
                  value={drafted.rank}
                  onChange={(e) => handleCharacterUpdate(index, { rank: e.target.value as CharacterRank })}
                  className="w-full bg-gray-700 text-white text-xs border border-gray-600 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {(["E0", "E1", "E2", "E3", "E4", "E5", "E6"] as CharacterRank[]).map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>

                <LightconeSelector
                  lightcones={lightcones}
                  selectedLightconeId={drafted.lightconeId}
                  selectedRank={drafted.lightconeRank}
                  onLightconeChange={(lightconeId, rank) => 
                    handleCharacterUpdate(index, { lightconeId, lightconeRank: rank })
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Pool */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Character Pool</h2>
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredCharacters.map((character) => {
            const isSelected = selectedCharacterIds.includes(character._id);
            const isSelectable = !isSelected && testTeam.length < 8;

            const rarityBorderColor = character.rarity === 5 ? "border-amber-400" : character.rarity === 4 ? "border-purple-500" : "border-gray-600";
            const rarityBgGradient = character.rarity === 5 
              ? "bg-gradient-to-b from-[#ad6002] to-[#faa237]" 
              : character.rarity === 4 
                ? "bg-gradient-to-b from-purple-800 to-purple-500" 
                : "bg-gradient-to-b from-gray-700 to-gray-500";

            return (
              <button
                key={character._id}
                onClick={() => isSelectable && handleCharacterSelect(character._id)}
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
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate z-20">
                  {character.display_name}
                </div>
                {isSelected && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-30 flex items-center justify-center z-30">
                    <span className="text-white font-bold text-xs">SELECTED</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            {searchTerm ? "No characters found matching your search." : "Loading characters..."}
          </div>
        )}
      </div>
    </div>
  );
}
