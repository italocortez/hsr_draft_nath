import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { RuleSet, DraftedCharacter, SelectedCharacter } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import { CharacterPool } from "./CharacterPool";
import "../css/TeamTest.css";
import LightconeSelector from "./LightconeSelector";
import { Character, CharacterRank, Eidolons, Element, Lightcone, LightconeRank, Path, SuperImpositions, UniqueElements, UniquePaths } from "@/lib/utils";
import LoadoutManager, { Loadout, loadoutCount } from "@/lib/LoadoutManager";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CostBreakdown {
    index: number;
    characterName: string;
    characterRank: CharacterRank;
    characterCostMOC: number;
    characterCostAS: number;
    lightconeName: string;
    lightconeRank: string;
    lightconeCost: number;
    totalMOC: number;
    totalAS: number;
}

interface TeamTestProps {
    characters: Character[];
    lightcones: Lightcone[];
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

export function TeamTest({ characters, lightcones }: TeamTestProps) {
    const icons = useQuery(api.icons.list) || [];
    const [ruleSet, setRuleSet] = useState<RuleSet>("memoryofchaos");
    
    const [currentLoadoutIndex, setCurrentLoadoutIndex] = useState<number>(LoadoutManager.loadCurrentLoadoutIndex());
    const [loadouts, setLoadouts] = useState<Loadout[]>(LoadoutManager.loadLoadouts());
    const currentTeam: DraftedCharacter[] = loadouts[currentLoadoutIndex]?.team || [];

    // Initialize Loadouts and active loadout
    useEffect(() => {
        const storedLoadouts = LoadoutManager.loadLoadouts();
        const storedIndex = LoadoutManager.loadCurrentLoadoutIndex();
        
        setLoadouts(storedLoadouts);
        setCurrentLoadoutIndex(storedIndex);
    }, []);

    // Save the index of last Loadout slot worked on 
    useEffect(() => {
        LoadoutManager.saveCurrentLoadoutIndex(currentLoadoutIndex);
    }, [currentLoadoutIndex]);

    // Upon updating a team, sync changes with data stored in localStorage
    useEffect(() => {
        if (loadouts.length > 0) {
            LoadoutManager.saveLoadouts(loadouts);
        }
    }, [loadouts]);

    // Create Path Icon mappings
    const pathIconMap = useMemo(() => {
        const map = {} as Record<Path, string>;
        [...UniquePaths].forEach(path => {
            const icon = icons.find(icon => icon.name === path);
            if (icon) map[path] = icon.imageUrl;
        });
        return map;
    }, [icons]);

    // Create Element Icon mappings
    const elementIconMap = useMemo(() => {
        const map = {} as Record<Element, string>;
        [...UniqueElements].forEach(element => {
            const icon = icons.find(icon => icon.name === element);
            if (icon) map[element] = icon.imageUrl;
        });
        return map;
    }, [icons]);

    // Create Gamemode Icon mappings
    const modeIconMap = useMemo(() => {
        const map = {} as Record<RuleSet, string>;
        (["memoryofchaos", "apocalypticshadow"] as RuleSet[]).forEach(mode => {
            const icon = icons.find(icon => icon.name === mode);
            if (icon) map[mode] = icon.imageUrl;
        });
        return map;
    }, [icons]);

    const calculateTotalCost = (): number => {
        return currentTeam.reduce((total, drafted) => {
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

    const getCostBreakdown = (): CostBreakdown[] => {
        return currentTeam.map((drafted, index) => {
            const character = characters.find(c => c._id === drafted.characterId);
            if (!character) return null;

            const characterCostMOC = character.cost.memoryofchaos[drafted.rank];
            const characterCostAS = character.cost.apocalypticshadow[drafted.rank];
            
            let lightconeCost = 0;
            let lightconeName = "None";
            
            if (drafted.lightconeId && drafted.lightconeRank) {
                const lightcone = lightcones.find(l => l._id === drafted.lightconeId);
                if (lightcone) {
                    lightconeCost = lightcone.cost[drafted.lightconeRank];
                    lightconeName = lightcone.display_name;
                }
            }

            return {
                index,
                characterName: character.display_name,
                characterRank: drafted.rank,
                characterCostMOC,
                characterCostAS,
                lightconeName,
                lightconeRank: drafted.lightconeRank || "N/A",
                lightconeCost,
                totalMOC: characterCostMOC + lightconeCost,
                totalAS: characterCostAS + lightconeCost
            };
        }).filter(Boolean) as CostBreakdown[];
    };

    const updateCurrentLoadout = (newTeam: DraftedCharacter[]) => {
        setLoadouts(prev => {
            const newLoadouts = [...prev];
            newLoadouts[currentLoadoutIndex] = {
                ...newLoadouts[currentLoadoutIndex],
                team: newTeam
            };
            return newLoadouts;
        });
    };

    const handleCharacterSelect = (characterId: Id<"character">) => {
        if (currentTeam.some(selected => selected.characterId === characterId) || currentTeam.length >= 4) return;

        const newCharacter: DraftedCharacter = {
            characterId,
            rank: "E0",
        };

        updateCurrentLoadout([...currentTeam, newCharacter]);
    };

    const handleCharacterUpdate = (index: number, updates: Partial<DraftedCharacter>) => {
        const newTeam = [...currentTeam];
        newTeam[index] = { ...newTeam[index], ...updates };
        updateCurrentLoadout(newTeam);
    };

    const handleRemoveCharacter = (index: number) => {
        const newTeam = currentTeam.filter((_, i) => i !== index);
        updateCurrentLoadout(newTeam);
    };

    const handleLoadoutChange = (newIndex: number) => {
        setCurrentLoadoutIndex(newIndex);
    };

    const handleClearCurrentLoadout = () => {
        updateCurrentLoadout([]);
    };

    const handleClearAllLoadouts = () => {
        const clearedLoadouts = LoadoutManager.getDefaultLoadouts();
        setLoadouts(clearedLoadouts);
        setCurrentLoadoutIndex(0);
    };

    const getTotalCostForMode = (ruleSet: RuleSet): number => {
        return currentTeam.reduce((total, drafted) => {
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

    return (
        <div className="TeamTest">
            {/* Controls */}
            <div className="controls Box p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-white font-medium">Loadout:</label>
                        <select
                            value={currentLoadoutIndex}
                            onChange={(e) => handleLoadoutChange(Number(e.target.value))}
                            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                            {loadouts.map((loadout, index) => (
                                <option key={index} value={index}>
                                    {loadout.name} ({loadout.team.length}/4)
                                </option>
                            ))}
                        </select>
                    </div>
                    
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

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={handleClearCurrentLoadout}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                        >
                            Clear Current
                        </button>
                        <button
                            onClick={handleClearAllLoadouts}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>

            {/* Loadout */}
            <div className="roster Box">
                {/* <div className="sub-header">
                    <h2 className="title">{`Picks (${testTeam?.length ?? 0}/8)`}</h2>

                    <h2 className="total-cost">{`Σ ${calculateTotalCost().toFixed(1)}`}</h2>
                </div> */}
                
                <div className="characters-container">
                    {Array.from({ length: 4 }).map((_, index) => {
                        const drafted: DraftedCharacter = currentTeam[index];
                        if (!drafted) {
                            return (
                                <div key={index} className="slot empty">
                                    <h3>{`Empty`}</h3>
                                </div>
                            );
                        }

                        const character: Character | undefined = characters.find(c => c._id === drafted.characterId);
                        if (!character) return null;
                        
                        const elementIconUrl: string = elementIconMap[character.element];
                        const pathIconUrl: string = pathIconMap[character.path];
                        const characterCost: number = character.cost[ruleSet][drafted.rank];
                        const lightcone: Lightcone | undefined = (drafted.lightconeId) ? lightcones.find((l) => l._id === drafted.lightconeId) ?? undefined : undefined;
                        const lightconeCost: number = (lightcone && drafted.lightconeRank) ? lightcone.cost[drafted.lightconeRank] : 0;

                        return (
                            <div
                                key={index}
                                className="slot"
                                data-rarity={character.rarity}
                                style={{ background: `var(--gradient-${character.rarity}star)` }} // Must be here for Path to appear behind portrait
                            >
                                {/* Clear button */}
                                <button
                                    onClick={_ => handleRemoveCharacter(index)}
                                    className="clear-button"
                                    title="Clear"
                                >
                                    <ClearIcon />
                                </button>

                                {/* Path */}
                                <img
                                    src={pathIconUrl}
                                    className="path"
                                    alt={character.path}
                                />

                                {/* Portrait */}
                                <img
                                    src={character.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${character.display_name.slice(0, 2)}</text></svg>`}
                                    className="portrait"
                                    alt={character.display_name}
                                    title={`${character.display_name}`}
                                />

                                {/* Character info */}
                                <div className="character">
                                    {/* Combined cost */}
                                    {/* <h3
                                        className="total-cost"
                                        title={`Character: ${characterCost || `-`} cost — LC: ${lightconeCost || `-`} cost`}
                                    >
                                        {lightcone
                                            ? `Σ ${characterCost + lightconeCost}`
                                            : characterCost}
                                    </h3> */}

                                    <img
                                        src={elementIconUrl}
                                        className="element"
                                        alt={character.element}
                                        style={{ height: `2.875rem`, width: `2.875rem` }}
                                    />

                                    {/* Verticals (Eidolon/SuperImposition) */}
                                    <div className="verticals">
                                        {/* Eidolon */}
                                        <select
                                            value={drafted.rank as CharacterRank}
                                            onChange={e => handleCharacterUpdate(index, { rank: e.target.value as CharacterRank })}
                                            className="eidolon focus:outline-none"
                                            name="eidolon"
                                            style={{
                                                paddingRight: `${lightcone ? `0` : ``}`,
                                                marginRight: `${lightcone ? `0` : ``}`,
                                            }}
                                        >
                                            {[...Eidolons].map((rank) => (
                                                <option key={rank} value={rank}>
                                                    {rank}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Imposition */}
                                        {drafted.lightconeId && (
                                            <>
                                                <select
                                                    value={(drafted.lightconeRank || "S1") as LightconeRank}
                                                    onChange={e => handleCharacterUpdate(index, { lightconeId: drafted.lightconeId, lightconeRank: e.target.value as LightconeRank })}
                                                    className="imposition focus:outline-none"
                                                    name="imposition"
                                                >
                                                    {[...SuperImpositions].map((rank) => (
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
                                    equippingCharacter={character}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="graphics Box">
                <div className="header">
                    {/* Switch */}
                    {/* <div className="relative">
                        <button
                            onClick={_ => setRuleSet(prev => prev === "memoryofchaos" ? "apocalypticshadow" : "memoryofchaos")}
                            className={`
                                relative inline-flex w-24 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                                transition-colors duration-300 ease-in-out focus:outline-none focus:outline-none bg-gray-600
                            `}
                            style={{ display: `flex`, alignItems: `center` }}
                        >
                            <span
                                className={`
                                pointer-events-none inline-block transform rounded-full shadow-lg ring-0 
                                transition-all duration-300 ease-in-out flex items-center justify-center
                                ${(ruleSet === "memoryofchaos") ? 'translate-x-14' : 'translate-x-0'}
                                `}
                            >
                                <div className="relative overflow-hidden rounded-full" style={{ padding: `1px` }}>
                                    {modeIconMap[ruleSet] && (
                                        <img
                                            src={modeIconMap[ruleSet]}
                                            alt={ruleSet}
                                            className="object-cover transition-opacity duration-200"
                                            style={{ height: `1.813rem`, width: `1.813rem` }}
                                        />
                                    )}
                                </div>
                            </span>
                        </button>
                    </div> */}

                    {/* Switch Container */}
                    <button
                        onClick={_ => setRuleSet(prev => prev === "memoryofchaos" ? "apocalypticshadow" : "memoryofchaos")}
                        className="relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none"
                    >
                        {/* Track Bar */}
                        <div 
                            className={`absolute top-1/2 left-2 right-2 h-5 rounded-full transition-colors duration-300 transform -translate-y-1/2 ${
                            (ruleSet === "memoryofchaos") ? 'bg-blue-300' : 'bg-green-300'
                            }`}
                            style={{  }}
                        />

                        {/* Thumb */}
                        <div
                            className={`absolute top-1/2 w-8 h-8 rounded-full shadow-md transition-all duration-300 transform -translate-y-1/2 flex items-center justify-center ${
                                (ruleSet === "memoryofchaos") 
                                ? 'translate-x-8 bg-blue-500' 
                                : 'translate-x-1 bg-green-500'
                                }`}
                            style={{ backgroundColor: (ruleSet === "memoryofchaos") ? `rgb(0, 145, 255)` : `` }}
                        >
                            {/* Icon */}
                            {modeIconMap[ruleSet] && (
                                <img
                                    src={modeIconMap[ruleSet]}
                                    alt={ruleSet}
                                    style={{ width: '100%', height: '1.5rem', objectFit: `contain`, objectPosition: `50% 50%` }}
                                />
                            )}
                        </div>
                    </button>
                </div>

                <div className="content">
                    {Array.from({ length: 4 }).map((_, index) => {
                        const drafted: DraftedCharacter = currentTeam[index];
                        if (!drafted) {
                            return (
                                <div key={index} className="slot empty">
                                    <h3>{`Empty`}</h3>
                                </div>
                            );
                        }

                        const character: Character | undefined = characters.find(c => c._id === drafted.characterId);
                        if (!character) return null;

                        const characterCost: number = character.cost[ruleSet][drafted.rank];
                        const lightcone: Lightcone | undefined = (drafted.lightconeId) ? lightcones.find((l) => l._id === drafted.lightconeId) ?? undefined : undefined;
                        const lightconeCost: number = (lightcone && drafted.lightconeRank) ? lightcone.cost[drafted.lightconeRank] : 0;

                        return (
                            <div className="character" style={{ display: `flex`, flexDirection: `column-reverse`, alignItems: `center` }}>
                                <h3 className="name" style={{ color: `rgb(209, 213, 219)`, fontWeight: `500` }}>{character.display_name}</h3>

                                {/* <div className="cost-visuals" style={{ position: `relative`, display: `flex`, flexDirection: `column-reverse`, alignItems: `center`, height: `stretch` }}>
                                </div> */}

                                <div style={{ flex: 1, width: `min-content`, display: `flex`, alignItems: `flex-end`, backgroundColor: `rgb(55, 65, 81)`, borderRadius: `0.25rem`, overflow: `hidden` }}>
                                    {/* ~20 cost should be the limit */}
                                    <div className="cost-bar" style={{ backgroundColor: `rgb(8, 145, 178)`, width: 32, height: `${String(Math.min(Math.floor(characterCost + lightconeCost), 10))}rem`, bottom: `1rem` }} />
                                </div>

                                <h3
                                    className="total-cost"
                                    title={`Character: ${characterCost || `-`} cost — LC: ${lightconeCost || `-`} cost`}
                                    style={{ zIndex: `20`, fontSize: `1.25rem`, fontWeight: `bold`, color: `var(--color-cost)` }}
                                >
                                    {lightcone
                                        ? `Σ ${characterCost + lightconeCost}`
                                        : characterCost}
                                </h3>
                            </div>
                        );
                    })}
                </div>
                
                <div className="footer">
                    <h3>Total:</h3>
                    <h2 className="total-cost" style={{ color: `var(--color-cost)`, fontSize: `1.625rem`, fontWeight: `bold`, backgroundColor: `rgba(0, 0, 0, 0.5)`, padding: `0.125rem 0.5rem` }}>{`Σ ${calculateTotalCost().toFixed(1)}`}</h2>
                </div>
            </div>

            {/* Individual Cost Breakdown */}
            {/* {currentTeam.length > 0 && (
                <div className="graphics Box p-6">
                    <h3 className="text-white text-xl font-semibold mb-4">Individual Cost Breakdown</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead>
                                <tr className="border-b border-gray-600">
                                    <th className="text-left p-3 font-semibold">Character</th>
                                    <th className="text-center p-3 font-semibold">Rank</th>
                                    <th className="text-center p-3 font-semibold">MoC Cost</th>
                                    <th className="text-center p-3 font-semibold">AS Cost</th>
                                    <th className="text-left p-3 font-semibold">Lightcone</th>
                                    <th className="text-center p-3 font-semibold">LC Rank</th>
                                    <th className="text-center p-3 font-semibold">LC Cost</th>
                                    <th className="text-center p-3 font-semibold">Total MoC</th>
                                    <th className="text-center p-3 font-semibold">Total AS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getCostBreakdown().map((breakdown, idx) => (
                                    <tr key={idx} className="border-b border-gray-700">
                                        <td className="p-3 font-medium">{breakdown.characterName}</td>
                                        <td className="p-3 text-center">{breakdown.characterRank}</td>
                                        <td className="p-3 text-center">{breakdown.characterCostMOC.toFixed(1)}</td>
                                        <td className="p-3 text-center">{breakdown.characterCostAS.toFixed(1)}</td>
                                        <td className="p-3 text-sm">{breakdown.lightconeName}</td>
                                        <td className="p-3 text-center">{breakdown.lightconeRank}</td>
                                        <td className="p-3 text-center">{breakdown.lightconeCost.toFixed(1)}</td>
                                        <td className="p-3 text-center font-semibold">{breakdown.totalMOC.toFixed(1)}</td>
                                        <td className="p-3 text-center font-semibold">{breakdown.totalAS.toFixed(1)}</td>
                                    </tr>
                                ))}
                                <tr className="border-t-2 border-gray-500 font-bold">
                                    <td colSpan={7} className="p-3 text-right">Team Total:</td>
                                    <td className="p-3 text-center">{getTotalCostForMode('memoryofchaos').toFixed(1)}</td>
                                    <td className="p-3 text-center">{getTotalCostForMode('apocalypticshadow').toFixed(1)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )} */}

            {/* Character Pool */}
            <CharacterPool
                characters={characters}
                selectedCharacters={currentTeam.map(d => ({ characterId: d.characterId, action: "pick" } as SelectedCharacter))}
                isDraftComplete={currentTeam.length >= 4}
                isDraftStarted={true}
                onCharacterSelect={handleCharacterSelect}
                currentPhase={{ team: "test", action: "test" }}
                canBanCharacter={undefined}
            />
        </div>
    );
}