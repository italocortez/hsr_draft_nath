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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

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
                    <h3 className="text-white font-medium">Team Cost Breakdown</h3>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">

                            <span className="text-sm text-white">Character</span>
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF004D' }}></div>
                        </div>
                        <div className="flex items-center gap-2">

                            <span className="text-sm text-white">LC</span>
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7E2553' }}></div>
                        </div>
                    </div>
                </div>

                <div className="content">
								    {currentTeam.length > 0 ? (
								        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
								            <Bar
								                data={{
								                    labels: currentTeam.map(drafted => {
								                        const character = characters.find(c => c._id === drafted.characterId);
								                        return character ? character.display_name : 'Unknown';
								                    }),
								                    datasets: [
								                        {
								                            label: 'Character',
								                            data: currentTeam.map(drafted => {
								                                const character = characters.find(c => c._id === drafted.characterId);
								                                if (!character) return 0;
								                                
								                                return character.cost[ruleSet][drafted.rank];
								                            }),
								                            backgroundColor: '#FF004D',
								                            borderColor: '#CC0039',
								                            borderWidth: 1,
								                        },
								                        {
								                            label: 'LC',
								                            data: currentTeam.map(drafted => {
								                                const character = characters.find(c => c._id === drafted.characterId);
								                                if (!character) return 0;
								                                
								                                if (drafted.lightconeId && drafted.lightconeRank) {
								                                    const lightcone = lightcones.find(l => l._id === drafted.lightconeId);
								                                    if (lightcone) {
								                                        return lightcone.cost[drafted.lightconeRank];
								                                    }
								                                }
								                                return 0;
								                            }),
								                            backgroundColor: '#7E2553',
								                            borderColor: '#5A1A3A',
								                            borderWidth: 1,
								                        },
								                    ],
								                }}
								                options={{
								                    responsive: true,
								                    maintainAspectRatio: false,
																	  layout: {
																				padding: {
																						top: 15, // Add padding at the top to prevent clipping
																						left: 5,
																						right: 5,
																						bottom: 5
																				}
																		},
								                    plugins: {
								                        legend: {
								                            display: false,
								                        },
								                        datalabels: {
								                            display: true,
								                            anchor: 'end',
								                            align: 'top',
								                            clamp: true,
								                            color: '#ffffff',
								                            font: { weight: 'bold', size: 12 },
								                            formatter: (value: number, ctx: any) => {
								                                if (ctx.datasetIndex !== 1) return '';
								                                const drafted = currentTeam[ctx.dataIndex];
								                                const char = characters.find(c => c._id === drafted.characterId);
								                                if (!char) return '';
								                                let total = char.cost[ruleSet][drafted.rank];
								                                if (drafted.lightconeId && drafted.lightconeRank) {
								                                    const lc = lightcones.find(l => l._id === drafted.lightconeId);
								                                    if (lc) total += lc.cost[drafted.lightconeRank];
								                                }
								                                return total.toFixed(1);
								                            },
								                            offset: -5,
								                        },
								                        tooltip: {
								                        }
								                    },
								                    scales: {
								                        x: {
								                            stacked: true,
								                            ticks: {
								                                color: '#ffffff',
								                                maxRotation: 45,
								                                minRotation: 0,
								                            },
								                            grid: {
								                              color: '#374151',
																							display: false
								                            },
								                        },
								                        y: {
								                            stacked: true,
								                            beginAtZero: true,
								                            ticks: {
								                                color: '#ffffff',
								                                callback: function(value) {
								                                    return typeof value === 'number' ? value.toFixed(1) : value;
								                                },
																								display: false
								                            },
								                            grid: {
								                                color: '#374151',
																								display: false
								                            },
								                            title: {
								                                display: true,
								                                text: 'Cost',
								                                color: '#ffffff',
								                                font: {
								                                    size: 14,
								                                    weight: 'bold'
								                                }
								                            }
								                        },
								                    },
								                }}
								            />
								        </div>
								    ) : (
								        <div className="flex items-center justify-center h-full">
								            <p className="text-gray-400 text-lg">No characters selected</p>
								        </div>
								    )}
								</div>
                
                <div className="footer">
                    <div className="flex justify-center items-center w-full">
                        <div className="flex items-center gap-2">
                            <h3 className="text-white">Total:</h3>
                            <h2 className="total-cost" style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                {getTotalCostForMode(ruleSet).toFixed(1)}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

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
