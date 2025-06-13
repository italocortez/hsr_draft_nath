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
    reserveTime: number;
  };
  characters: any[];
  lightcones: any[];
  ruleSet: RuleSet;
  onTeamNameChange: (team: "blue" | "red", name: string) => void;
  onCharacterUpdate: (team: "blue" | "red", index: number, updates: Partial<DraftedCharacter>) => void;
  isDraftComplete?: boolean;
}

interface MoCResultData {
  firstHalfCycles: number;
  secondHalfCycles: number;
  deathCharacters: number;
  additionalCycleModifier: number;
}

interface ApocResultData {
  firstHalfScore: number;
  secondHalfScore: number;
  deathCharacters: number;
  additionalScoreModifier: number;
}

interface ResultData {
  memoryofchaos: MoCResultData;
  apocalypticshadow: ApocResultData;
}

export function TeamArea({
  team,
  teamData,
  characters,
  lightcones,
  ruleSet,
  onTeamNameChange,
  onCharacterUpdate,
  isDraftComplete = false,
}: TeamAreaProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(teamData.name);
  const [activeTab, setActiveTab] = useState<"roster" | "result">("roster");
  const [resultData, setResultData] = useState<ResultData>({
    memoryofchaos: {
      firstHalfCycles: 0,
      secondHalfCycles: 0,
      deathCharacters: 0,
      additionalCycleModifier: 0,
    },
    apocalypticshadow: {
      firstHalfScore: 0,
      secondHalfScore: 0,
      deathCharacters: 0,
      additionalScoreModifier: 0,
    },
  });

  const teamColor = team === "blue" ? "text-blue-400" : "text-red-400";
  const borderColor = team === "blue" ? "border-blue-500" : "border-red-500";
  const tabActiveColor = team === "blue" ? "bg-blue-500" : "bg-red-500";
  
  // Default team names
  const defaultTeamName = team === "blue" ? "Blue Team" : "Red Team";
  
  // Use default name if current name is empty or just whitespace
  const displayName = teamData.name.trim() || defaultTeamName;

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
    // If tempName is empty or just whitespace, use the default name
    const finalName = tempName.trim() || defaultTeamName;
    onTeamNameChange(team, finalName);
    setEditingName(false);
  };

  const handleStartEditing = () => {
    // When starting to edit, if the current name is the default, clear it for easier editing
    setTempName(teamData.name === defaultTeamName ? "" : teamData.name);
    setEditingName(true);
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

  const handleMoCResultDataChange = (field: keyof MoCResultData, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && (
      (field === 'additionalCycleModifier' || numValue >= 0)
    ))) {
      setResultData(prev => ({
        ...prev,
        memoryofchaos: {
          ...prev.memoryofchaos,
          [field]: value === '' ? 0 : numValue,
        },
      }));
    }
  };

  const handleApocResultDataChange = (field: keyof ApocResultData, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && (
      (field === 'additionalScoreModifier' || numValue >= 0)
    ))) {
      setResultData(prev => ({
        ...prev,
        apocalypticshadow: {
          ...prev.apocalypticshadow,
          [field]: value === '' ? 0 : numValue,
        },
      }));
    }
  };

  const renderRosterTab = () => (
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
  );

  const renderResultTab = () => {
    if (ruleSet === "memoryofchaos") {
      const mocData = resultData.memoryofchaos;
      return (
        <div className="space-y-4">
          <h3 className="text-white font-medium mb-4">Memory of Chaos Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">1st Half Cycles</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={mocData.firstHalfCycles}
                onChange={(e) => handleMoCResultDataChange('firstHalfCycles', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">2nd Half Cycles</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={mocData.secondHalfCycles}
                onChange={(e) => handleMoCResultDataChange('secondHalfCycles', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Death Characters</label>
              <input
                type="number"
                min="0"
                step="1"
                value={mocData.deathCharacters}
                onChange={(e) => handleMoCResultDataChange('deathCharacters', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Additional Cycle Modifier</label>
              <input
                type="number"
                step="0.1"
                value={mocData.additionalCycleModifier}
                onChange={(e) => handleMoCResultDataChange('additionalCycleModifier', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0.0"
              />
              <p className="text-xs text-gray-400 mt-1">Can be negative, zero, or positive</p>
            </div>
          </div>
        </div>
      );
    } else {
      const apocData = resultData.apocalypticshadow;
      return (
        <div className="space-y-4">
          <h3 className="text-white font-medium mb-4">Apocalyptic Shadow Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">1st Half Score</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={apocData.firstHalfScore}
                onChange={(e) => handleApocResultDataChange('firstHalfScore', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">2nd Half Score</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={apocData.secondHalfScore}
                onChange={(e) => handleApocResultDataChange('secondHalfScore', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Death Characters</label>
              <input
                type="number"
                min="0"
                step="1"
                value={apocData.deathCharacters}
                onChange={(e) => handleApocResultDataChange('deathCharacters', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Additional Score Modifier</label>
              <input
                type="number"
                step="0.1"
                value={apocData.additionalScoreModifier}
                onChange={(e) => handleApocResultDataChange('additionalScoreModifier', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0.0"
              />
              <p className="text-xs text-gray-400 mt-1">Can be negative, zero, or positive</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border-2 ${borderColor}`}>
      {/* Header with team name and total cost */}
      <div className="flex items-center justify-between p-6 pb-4">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder={defaultTeamName}
              autoFocus
            />
          </div>
        ) : (
          <h2
            className={`text-xl font-bold ${teamColor} cursor-pointer hover:opacity-80 min-w-0`}
            onClick={handleStartEditing}
            title="Click to edit team name"
          >
            {displayName}
          </h2>
        )}
        <div className="text-white font-medium">
          Total Cost: <span className="text-amber-400">{calculateTotalCost()}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 px-6">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "roster"
              ? `${tabActiveColor} text-white border-b-2 ${borderColor.replace('border-', 'border-b-')}`
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Roster
        </button>
        <button
          onClick={() => isDraftComplete && setActiveTab("result")}
          disabled={!isDraftComplete}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "result" && isDraftComplete
              ? `${tabActiveColor} text-white border-b-2 ${borderColor.replace('border-', 'border-b-')}`
              : isDraftComplete
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-600 cursor-not-allowed"
          }`}
        >
          Result
          {!isDraftComplete && (
            <span className="ml-1 text-xs">(Draft must be complete)</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "roster" ? renderRosterTab() : renderResultTab()}
      </div>
    </div>
  );
}
