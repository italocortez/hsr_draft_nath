import { useState } from "react";
import { DraftedCharacter, RuleSet, CharacterRank, LightconeRank } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import { LightconeSelector } from "./LightconeSelector";

interface TeamAreaProps {
  team: "blue" | "red";
  teamData: {
    name: string;
    drafted: DraftedCharacter[];
    banned: Id<"character">[];
  };
  characters: any[];
  lightcones: any[];
  ruleSet: RuleSet;
  onTeamNameChange: (team: "blue" | "red", name: string) => void;
  onCharacterUpdate: (team: "blue" | "red", index: number, updates: Partial<DraftedCharacter>) => void;
}

export function TeamArea({
  team,
  teamData,
  characters,
  lightcones,
  ruleSet,
  onTeamNameChange,
  onCharacterUpdate,
}: TeamAreaProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(teamData.name);

  const teamColor = team === "blue" ? "text-blue-400" : "text-red-400";
  const borderColor = team === "blue" ? "border-blue-500" : "border-red-500";

  const calculateTotalCost = () => {
    return teamData.drafted.reduce((total, drafted) => {
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

  const handleNameSubmit = () => {
    onTeamNameChange(team, tempName);
    setEditingName(false);
  };

  const getCharacterImageUrl = (characterId: Id<"character">) => {
    const character = characters.find(c => c._id === characterId);
    if (character?.imageUrl) {
      return character.imageUrl;
    }
    // Fallback to placeholder if no imageUrl
    return `https://via.placeholder.com/120x120/374151/ffffff?text=${encodeURIComponent(
      character?.display_name?.slice(0, 2) || "??"
    )}`;
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border-2 ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              autoFocus
            />
          </div>
        ) : (
          <h2
            className={`text-xl font-bold ${teamColor} cursor-pointer hover:opacity-80`}
            onClick={() => setEditingName(true)}
          >
            {teamData.name}
          </h2>
        )}
        <div className="text-white font-medium">
          Total Cost: <span className="text-amber-400">{calculateTotalCost()}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-2">Drafted Characters ({teamData.drafted.length}/8)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, index) => {
              const drafted = teamData.drafted[index];
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
                  </div>
                  
                  <select
                    value={drafted.rank}
                    onChange={(e) => onCharacterUpdate(team, index, { rank: e.target.value as CharacterRank })}
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
                      onCharacterUpdate(team, index, { lightconeId, lightconeRank: rank })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-white font-medium mb-2">Banned Characters ({teamData.banned.length})</h3>
          <div className="flex flex-wrap gap-2">
            {teamData.banned.map((characterId, index) => {
              const character = characters.find(c => c._id === characterId);
              if (!character) return null;

              const rarityBgGradient = character.rarity === 5 
                ? "bg-gradient-to-b from-[#ad6002] to-[#faa237]" 
                : character.rarity === 4 
                  ? "bg-gradient-to-b from-purple-800 to-purple-500" 
                  : "bg-gradient-to-b from-gray-700 to-gray-500";

              return (
                <div
                  key={index}
                  className={`w-16 h-16 ${rarityBgGradient} rounded border border-red-500 overflow-hidden relative opacity-50`}
                >
                  <div className={`absolute inset-0 ${rarityBgGradient}`}></div>
                  <img
                    src={getCharacterImageUrl(characterId)}
                    alt={character.display_name}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/120x120/374151/ffffff?text=${encodeURIComponent(
                        character.display_name.slice(0, 2)
                      )}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center z-20">
                    <span className="text-red-200 font-bold text-xs">BAN</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
