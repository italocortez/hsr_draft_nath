import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RuleSet } from "./DraftingInterface";
import { Character, CharacterRank, Element, Lightcone, LightconeRank, Path, Rarity, Role, UniqueElements, UniquePaths, UniqueRoles } from "@/lib/utils";
import "../css/CostTables.css";
import LoadoutManager from "@/lib/LoadoutManager";

const ClearIcon: React.FC = () => (
    <svg 
        width="1.375rem" 
        height="1.375rem" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

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
    const [ruleSet, setRuleSet] = useState<RuleSet>(LoadoutManager.loadRulesetView()); // Last viewed RuleSet - Doesn't update on switch

    // Character sorting
    const [characterSelectedRoles, setCharacterSelectedRoles] = useState<Role[]>([]);
    const [characterSelectedPaths, setCharacterSelectedPaths] = useState<Path[]>([]);
    const [characterSelectedElements, setCharacterSelectedElements] = useState<Element[]>([]);
    const [characterSearchTerm, setCharacterSearchTerm] = useState<string>("");
    const [characterSort, setCharacterSort] = useState<CharacterSortState>({ field: "name", direction: "asc" });

    // Lightcone sorting
    const [lightconeSelectedPaths, setLightconeSelectedPaths] = useState<Path[]>([]);
    const [lightconeSearchTerm, setLightconeSearchTerm] = useState<string>("");
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
        if (characterSelectedRoles.length > 0) {
            filtered = filtered.filter(char => characterSelectedRoles.includes(char.role));
        }

        // Apply element filter
        if (characterSelectedElements.length > 0) {
            filtered = filtered.filter(char => characterSelectedElements.includes(char.element));
        }

        // Apply path filter
        if (characterSelectedPaths.length > 0) {
            filtered = filtered.filter(char => characterSelectedPaths.includes(char.path));
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
                    aValue = a.cost[ruleSet][characterSort.field];
                    bValue = b.cost[ruleSet][characterSort.field];
                    break;
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
                return characterSort.direction === "asc" 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return characterSort.direction === "asc" ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number);
        });

        return sorted;
    }, [characters, characterSelectedRoles, characterSelectedPaths, characterSelectedElements, characterSearchTerm, characterSort, ruleSet]);

    const sortedAndFilteredLightcones = useMemo((): Lightcone[] => {
        let filtered: Lightcone[] = lightcones;
        
        // Apply search filter
        filtered = filtered.filter(lightcone => {
            if (!lightconeSearchTerm.trim()) return true;
            
            return lightcone.aliases.some((alias: string) => 
                alias.toLowerCase().includes(lightconeSearchTerm.toLowerCase())
                ) || lightcone.display_name.toLowerCase().includes(lightconeSearchTerm.toLowerCase());
        });

        // Apply path filter
        if (lightconeSelectedPaths.length > 0) {
            filtered = filtered.filter(lightcone => lightconeSelectedPaths.includes(lightcone.path));
        }

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
            return lightconeSort.direction === "asc" ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number);
        });

        return sorted;
    }, [lightcones, lightconeSelectedPaths, lightconeSearchTerm, lightconeSort]);

    const toggleCharacterRoleFilter = (role: Role) => {
        setCharacterSelectedRoles(prev => 
            prev.includes(role) 
            ? prev.filter(r => r !== role)
            : [...prev, role]
        );
    };
    const toggleCharacterElementFilter = (element: Element) => {
        setCharacterSelectedElements(prev => 
            prev.includes(element) 
            ? prev.filter(e => e !== element)
            : [...prev, element]
        );
    };
    const toggleCharacterPathFilter = (path: Path) => {
        setCharacterSelectedPaths(prev => 
            prev.includes(path) 
            ? prev.filter(e => e !== path)
            : [...prev, path]
        );
    };
    const clearAllCharacterFilters = () => {
        setCharacterSelectedRoles([]);
        setCharacterSelectedPaths([]);
        setCharacterSelectedElements([]);
        setCharacterSearchTerm("");
    };

    const toggleLightconePathFilter = (path: Path) => {
        setLightconeSelectedPaths(prev => 
            prev.includes(path) 
            ? prev.filter(e => e !== path)
            : [...prev, path]
        );
    };
    const clearAllLightconeFilters = () => {
        setLightconeSelectedPaths([]);
        setLightconeSearchTerm("");
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
        <div className="CostTables">
            {/* Characters Table */}
            <div className="table Box">
                {/* Header */}
                <div className="header">
                    {/* Top Section */}
                    <div className="top">
                        {/* Title */}
                        <h2 className="title">
                            {`Character Costs — ${(ruleSet === "memoryofchaos") ? `MoC` : `AS`}`}
                        </h2>

                        {/* Switch to view MoC/AS cost */}
                        <button
                            onClick={_ => setRuleSet(prev => (prev === "memoryofchaos") ? "apocalypticshadow" : "memoryofchaos")}
                            className={`mode-switch ${ruleSet}`}
                            title={`Switch to ${(ruleSet === "memoryofchaos") ? `Apocalyptic Shadow` : `Memory of Chaos`} rules`}
                        >
                            <div className="track-bar"/>

                            <div className="thumb">
                                { modeIconMap[ruleSet] && <img className="icon" src={modeIconMap[ruleSet]} /> }
                            </div>
                        </button>
                    </div>

                    {/* Filter options */}
                    <div className="filters">
                        {/* Roles */}
                        <div className="roles">
                            {[...UniqueRoles].map(role => {
                                const isSelected: boolean = characterSelectedRoles.includes(role);
                                const iconUrl: string = roleIconMap[role];
        
                                return (
                                    <button
                                        key={role}
                                        onClick={_ => toggleCharacterRoleFilter(role)}
                                        className={`role ${isSelected ? `selected` : ``}`}
                                        title={role}
                                    >
                                        {iconUrl && (
                                            <img
                                                src={iconUrl}
                                                alt={role}
                                                style={{ height: `1.25rem`, width: `1.25rem` }}
                                            />
                                        )}
                                        
                                        <span className="capitalize">{role}</span>
                                    </button>
                                );
                            })}
                        </div>
        
                        {/* Elements */}
                        <div className="elements">
                            {[...UniqueElements].map(element => {
                                const isSelected: boolean = characterSelectedElements.includes(element);
                                const iconUrl: string = elementIconMap[element];
        
                                return (
                                    <button
                                        key={element}
                                        onClick={_ => toggleCharacterElementFilter(element)}
                                        className={`elem ${isSelected ? `selected` : ``}`}
                                        title={element}
                                    >
                                        {iconUrl && (
                                            <img
                                                src={iconUrl}
                                                alt={element}
                                                style={{ height: `1.875rem`, width: `1.875rem` }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
        
                        {/* Paths */}
                        <div className="paths">
                            {[...UniquePaths].map(path => {
                                const isSelected: boolean = characterSelectedPaths.includes(path);
                                const iconUrl: string = pathIconMap[path];
        
                                return (
                                    <button
                                        key={path}
                                        onClick={_ => toggleCharacterPathFilter(path)}
                                        className={`path ${isSelected ? `selected` : ``}`}
                                        title={path}
                                    >
                                        {iconUrl && (
                                            <img
                                                src={iconUrl}
                                                alt={path}
                                                style={{ height: `1.5rem`, width: `1.5rem` }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
        
                        {/* Search bar */}
                        <input
                            type="text"
                            placeholder="Search characters..."
                            value={characterSearchTerm}
                            onChange={e => setCharacterSearchTerm(e.target.value as string)}
                            className="search-bar focus:outline-none"
                            name="search-bar"
                        />
        
                        {/* Clear All Filters */}
                        <button
                            className="clear-button"
                            onClick={clearAllCharacterFilters}
                            disabled={!(characterSelectedRoles.length > 0 || characterSelectedPaths.length > 0 || characterSelectedElements.length > 0 || characterSearchTerm.trim().length > 0)}
                            title={`Clear all filters`}
                        >
                            <ClearIcon />
        
                            <span>{`Clear`}</span>
                        </button>
                    </div>
                </div>
                
                {/* Table Head + Entries */}
                <div className="content">
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
                                    <td className="py-3 px-4" style={{ fontSize: `1.125rem` }}>{character.display_name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <div 
                                            data-rarity={character.rarity}
                                            className="w-6 h-6 flex justify-center"
                                            style={{ margin: `0 auto`, backgroundColor: `var(--lc-${character.rarity}star)`, borderRadius: `0.25rem` }}
                                        >
                                            <span 
                                                className={`text-sm font-bold flex items-center`}
                                                style={{ filter: `drop-shadow(0px 1px 2px black)` }}    
                                            >
                                                {character.rarity}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{character.cost[ruleSet].E0}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{character.cost[ruleSet].E1}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{character.cost[ruleSet].E2}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{character.cost[ruleSet].E3}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{character.cost[ruleSet].E4}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{character.cost[ruleSet].E5}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{character.cost[ruleSet].E6}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Information */}
                {(sortedAndFilteredCharacters.length === 0) && <>
                    <h3 className="info">
                        {
                            (characterSearchTerm || characterSelectedRoles.length > 0 || characterSelectedElements.length > 0 || characterSelectedPaths.length > 0) ? 
                                "No characters found matching your filters."
                            :
                                "Loading characters..."
                        }
                    </h3>
                </>}
            </div>

            {/* Lightcones Table */}
            <div className="table Box">
                {/* Header */}
                <div className="header">
                    {/* Top Section */}
                    <div className="top">
                        {/* Title */}
                        <h2 className="title">{`Lightcone Costs — ${(ruleSet === "memoryofchaos") ? `MoC` : `AS`}`}</h2>

                        {/* Switch to view MoC/AS cost */}
                        <button
                            onClick={_ => setRuleSet(prev => (prev === "memoryofchaos") ? "apocalypticshadow" : "memoryofchaos")}
                            className={`mode-switch ${ruleSet}`}
                            title={`Switch to ${(ruleSet === "memoryofchaos") ? `Apocalyptic Shadow` : `Memory of Chaos`} rules`}
                        >
                            <div className="track-bar"/>

                            <div className="thumb">
                                { modeIconMap[ruleSet] && <img className="icon" src={modeIconMap[ruleSet]} /> }
                            </div>
                        </button>
                    </div>

                    {/* Filter options */}
                    <div className="filters">
                        {/* Paths */}
                        <div className="paths">
                            {[...UniquePaths].map(path => {
                                const isSelected: boolean = lightconeSelectedPaths.includes(path);
                                const iconUrl: string = pathIconMap[path];
        
                                return (
                                    <button
                                        key={path}
                                        onClick={_ => toggleLightconePathFilter(path)}
                                        className={`path ${isSelected ? `selected` : ``}`}
                                        title={path}
                                    >
                                        {iconUrl && (
                                            <img
                                                src={iconUrl}
                                                alt={path}
                                                style={{ height: `1.5rem`, width: `1.5rem` }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
        
                        {/* Search bar */}
                        <input
                            type="text"
                            placeholder="Search lightcones..."
                            value={lightconeSearchTerm}
                            onChange={e => setLightconeSearchTerm(e.target.value as string)}
                            className="search-bar focus:outline-none"
                            name="search-bar"
                        />
        
                        {/* Clear All Filters */}
                        <button
                            className="clear-button"
                            onClick={clearAllLightconeFilters}
                            disabled={!(lightconeSelectedPaths.length > 0 || lightconeSearchTerm.trim().length > 0)}
                            title={`Clear all filters`}
                        >
                            <ClearIcon />
        
                            <span>{`Clear`}</span>
                        </button>
                    </div>
                </div>

                <div className="content">
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
                                    <td className="py-3 px-4" style={{ fontSize: `1.125rem` }}>{lightcone.display_name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <div 
                                            data-rarity={lightcone.rarity}
                                            className="w-6 h-6 flex justify-center"
                                            style={{ margin: `0 auto`, backgroundColor: `var(--lc-${lightcone.rarity}star)`, borderRadius: `0.25rem` }}
                                        >
                                            <span 
                                                className={`text-sm font-bold flex items-center`}
                                                style={{ filter: `drop-shadow(0px 1px 2px black)` }}    
                                            >
                                                {lightcone.rarity}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{lightcone.cost.S1}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{lightcone.cost.S2}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{lightcone.cost.S3}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{lightcone.cost.S4}</td>
                                    <td className="py-3 px-4 text-center" style={{ color: `var(--color-cost)`, fontWeight: 500 }}>{lightcone.cost.S5}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Information */}
                {(sortedAndFilteredLightcones.length === 0) && <>
                    <h3 className="info">
                        {
                            (lightconeSearchTerm || lightconeSelectedPaths.length > 0) ? 
                                "No lightcones found matching your filters."
                            :
                                "Loading lightcones..."
                        }
                    </h3>
                </>}
            </div>
        </div>
    );
}
