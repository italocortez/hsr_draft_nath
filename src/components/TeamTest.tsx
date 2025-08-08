import { Dispatch, SetStateAction, useState } from "react";
import { RuleSet, CharacterRank, DraftedCharacter, LightconeRank, SelectedCharacter } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import { CharacterPool } from "./CharacterPool";
import "../css/TeamTest.css";
import LightconeSelector from "./LightconeSelector";

interface TeamTestProps {
    characters: any[];
    lightcones: any[];
    teamState: { testTeam: DraftedCharacter[], setTestTeam: Dispatch<SetStateAction<DraftedCharacter[]>> };
}

function ClearIcon() {
    return (
        <svg 
            viewBox="0 0 24 24" 
            width="1.375rem" 
            height="1.375rem"
        >
            {/* White rectangle background for the X area */}
            <rect 
                x="6" 
                y="6" 
                width="12" 
                height="12" 
                fill="white" 
                rx="1"
            />
            
            {/* Red circle */}
            <circle 
                cx="12" 
                cy="12" 
                r="12" 
                fill="currentColor"
            />
            
            {/* White X */}
            <path 
                d="M8.5 8.5l7 7M15.5 8.5l-7 7" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round"
            />
        </svg>
    );
}

export function TeamTest({ characters, lightcones, teamState: { testTeam, setTestTeam } }: TeamTestProps) {
  const [ruleSet, setRuleSet] = useState<RuleSet>("apocalypticshadow");
  const selectedCharacters: SelectedCharacter[] = testTeam.map(d => ({ characterId: d.characterId, action: "pick" } as SelectedCharacter));

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
    if (selectedCharacters.some(selected => selected.characterId === characterId) || testTeam.length >= 8) return;

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

                    return (
                        <div
                            key={index}
                            className="slot"
                            data-rarity={character.rarity}
                        >
                            {/* Clear button */}
                            <button
                                onClick={_ => handleRemoveCharacter(index)}
                                className="clear-button"
                                title="Clear"
                            >
                                <ClearIcon />
                            </button>

                            {/* Character IMG */}
                            <img
                                src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                alt={character.display_name}
                                title={`${character.display_name}`}
                            />

                            {/* Character info */}
                            <div className="character">
                                {/* Combined cost */}
                                <h3
                                    className="total-cost"
                                    title={`Character: ${characterCost || `-`} cost — LC: ${lightconeCost || `-`} cost`}
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
                                        name="eidolon"
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
                                                name="imposition"
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
            selectedCharacters={selectedCharacters}
            isDraftComplete={testTeam.length >= 8}
            isDraftStarted={true}
            onCharacterSelect={handleCharacterSelect}
            currentPhase={{ team: "test", action: "" }}
            canBanCharacter={undefined}
        />
    </div>
  );
}