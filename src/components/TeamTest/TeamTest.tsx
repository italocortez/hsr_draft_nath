import { useState } from "react";
import { RuleSet, CharacterRank, DraftedCharacter } from "../DraftingInterface/DraftingInterface";
import { Id } from "../../../convex/_generated/dataModel";
import { LightconeSelector } from "../LightconeSelector/LightconeSelector";
import "./TeamTest.css";
import { CharacterPool } from "../CharacterPool/CharacterPool";

interface TeamTestProps {
  characters: any[];
  lightcones: any[];
}

export function TeamTest({ characters, lightcones }: TeamTestProps) {
  const [ruleSet, setRuleSet] = useState<RuleSet>("apocalypticshadow");
  const [testTeam, setTestTeam] = useState<DraftedCharacter[]>([]);
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
    <div className="TeamTest">
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
                <option value="apocalypticshadow">Apocalyptic Shadow</option>
                <option value="memoryofchaos">Memory of Chaos</option>
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
      <div className="preview-team bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Test Team ({testTeam.length}/8)</h2>

        <div className="characters-container grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => {
            const drafted = testTeam[index];
            if (!drafted) {
              return (
                <div
                  key={index}
                  className="aspect-square bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"
                >
                  <h3 className="text-gray-500 text-sm" style={{ fontSize: `1.25rem` }}>Empty</h3>
                </div>
              );
            }

            const character = characters.find(c => c._id === drafted.characterId);
            if (!character) return null;

            const characterCost = character.cost[ruleSet][drafted.rank];
            const lightcone = drafted.lightconeId ? lightcones.find(l => l._id === drafted.lightconeId) : null;
            const lightconeCost = lightcone && drafted.lightconeRank ? lightcone.cost[drafted.lightconeRank] : 0;
            const isFiveStar = character.rarity === 5;

            const rarityBorderColor = character.rarity === 5 ? "border-amber-400" : character.rarity === 4 ? "border-purple-500" : "border-gray-600";
            const rarityBgGradient = character.rarity === 5 
              ? "bg-gradient-to-b from-[#ad6002] to-[#faa237]" 
              : character.rarity === 4 
                ? "bg-gradient-to-b from-purple-800 to-purple-500" 
                : "bg-gradient-to-b from-gray-700 to-gray-500";

            return (
              <div key={index} className="char-wrapper">
                {/* Character info */}
                <div className={`character relative aspect-square rounded-lg overflow-hidden ${rarityBorderColor} border`}>
                  <div className={`absolute inset-0`}></div>
                  
                  <img
                    src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                    alt={character.display_name}
                    className="w-full h-full object-cover relative z-10"

                    style={{ background: `var(${ isFiveStar ? `--gradient-5star` : `--gradient-4star` })` }}
                  />

                    {/* Combined cost */}
                  <div className="total-cost bg-black bg-opacity-75 text-xs rounded" title={`Character: ${characterCost || `-`} cost. LC: ${lightconeCost || `-`} cost`}>
                    {lightcone ? `Σ ${characterCost + lightconeCost}` : characterCost}
                  </div>

                    {/* Character name */}
                  <div className="char-name bg-black bg-opacity-75 text-xs rounded">
                    {character.display_name}
                  </div>
                    
                    {/* Clear button */}
                  <button
                    onClick={() => handleRemoveCharacter(index)}
                    className="clear-button bg-red-600 hover:bg-red-700 rounded"
                  >
                    X
                  </button>

                    {/* Eidolon select */}
                    <select
                        value={drafted.rank}
                        onChange={(e) => handleCharacterUpdate(index, { rank: e.target.value as CharacterRank })}
                        className="eidolon bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        >
                        {(["E0", "E1", "E2", "E3", "E4", "E5", "E6"] as CharacterRank[]).map(rank => (
                            <option key={rank} value={rank}>{rank}</option>
                        ))}
                    </select>
                </div>
                
                {/* Lightcone info */}
                <LightconeSelector
                    lightcones={lightcones}
                    selectedLightconeId={drafted.lightconeId}
                    selectedRank={drafted.lightconeRank}
                    onLightconeChange={(lightconeId, rank) => handleCharacterUpdate(index, { lightconeId, lightconeRank: rank })}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Pool */}
      <CharacterPool
        characters={characters}
        selectedCharacters={selectedCharacterIds}
        isDraftComplete={testTeam.length >= 8}
        isDraftStarted={true}
        onCharacterSelect={handleCharacterSelect}
        currentPhase={{ team: "test", action: "" }}
        canBanCharacter={undefined}
      />
    </div>
  );
}
