import { useState } from "react";
import { RuleSet, CharacterRank, DraftedCharacter, LightconeRank } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import { CharacterPool } from "./CharacterPool";
import "../css/TeamTest.css";
import NoImpositionLightconeSelector from "./LightconeSelector";

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

  return (
    <div className="TeamTest">
        {/* Controls */}
        <div className="Box p-6">
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
        <div className="roster Box">
            <div className="sub-header">
                <h2 className="title">{`Picks (${testTeam?.length ?? 0}/8)`}</h2>

                <h2 className="total-cost">{`Σ ${calculateTotalCost().toFixed(1)}`}</h2>
            </div>
            
            <div className="characters-container">
                {Array.from({ length: 8 }).map((_, index) => {
                    const drafted = testTeam[index];
                    if (!drafted) {
                        return (
                            <div key={index} className="slot empty">
                                <h3>{`Empty`}</h3>
                            </div>
                        );
                    }

                    const character = characters.find(c => c._id === drafted.characterId);
                    if (!character) return null;

                    const characterCost = character.cost[ruleSet][drafted.rank];
                    const lightcone = (drafted.lightconeId) ? lightcones.find((l) => l._id === drafted.lightconeId) : null;
                    const lightconeCost = (lightcone && drafted.lightconeRank) ? lightcone.cost[drafted.lightconeRank] : 0;
                    const isFiveStar = character.rarity === 5;

                    return (
                        <div
                            key={index}
                            className="slot"
                            style={{
                                borderColor: `var(${isFiveStar ? `--border-5star` : `--border-4star`})`,
                                boxShadow: `var(${isFiveStar ? `--shadow-5star` : `--shadow-4star`})`,
                            }}
                        >
                            {/* Clear button */}
                            <button
                                onClick={_ => handleRemoveCharacter(index)}
                                className="clear-button"
                            >
                                X
                            </button>

                            {/* Character IMG */}
                            <img
                                src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                alt={character.display_name}
                                title={`${character.display_name}`}
                                
                                style={{
                                    background: `var(${isFiveStar ? `--gradient-5star` : `--gradient-4star`})`,
                                }}
                            />

                            {/* Character info */}
                            <div className="character">
                                {/* Combined cost */}
                                <h3
                                    className="total-cost"
                                    title={`Character: ${characterCost || `-`} cost. LC: ${lightconeCost || `-`} cost`}
                                >
                                    {lightcone
                                        ? `Σ ${characterCost + lightconeCost}`
                                        : characterCost}
                                </h3>

                                {/* Verticals (Eidolon/SuperImposition) */}
                                <div className="verticals">
                                    {/* Eidolon */}
                                    <select
                                        value={drafted.rank}
                                        onChange={e => handleCharacterUpdate(index, { rank: e.target.value as CharacterRank })}
                                        className="eidolon focus:outline-none"
                                        style={{
                                            paddingRight: `${lightcone ? `0` : ``}`,
                                            marginRight: `${lightcone ? `0` : ``}`,
                                        }}
                                    >
                                        {([ "E0", "E1", "E2", "E3", "E4", "E5", "E6" ] as CharacterRank[]).map((rank) => (
                                            <option key={rank} value={rank}>
                                                {rank}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Imposition */}
                                    {drafted.lightconeId && (
                                        <>
                                            <select
                                                value={drafted.lightconeRank || "S1"}
                                                onChange={e => handleCharacterUpdate(index, { lightconeId: drafted.lightconeId, lightconeRank: e.target.value as LightconeRank })}
                                                className="imposition focus:outline-none"
                                            >
                                                {(["S1", "S2", "S3", "S4", "S5"] as LightconeRank[]).map((rank) => (
                                                    <option key={rank} value={rank}>
                                                        {rank}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Lightcone */}
                            <NoImpositionLightconeSelector
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
