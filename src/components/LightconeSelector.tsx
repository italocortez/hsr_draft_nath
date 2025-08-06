import { ChangeEvent, ChangeEventHandler, JSX, useEffect, useMemo, useRef, useState } from "react";
import { LightconeRank } from "@/components/DraftingInterface";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "../css/LightconeSelector.css";

interface LightconeSelectorProps {
	lightcones: any[];
    selectedLightconeId?: Id<"lightcones">;
    selectedRank?: LightconeRank;
    onLightconeChange: (lightconeId?: Id<"lightcones">, rank?: LightconeRank) => void;
}

function LightconeSelector(props: LightconeSelectorProps): JSX.Element {
    const { lightcones, selectedLightconeId, selectedRank, onLightconeChange } = props;
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const [searchTerm, setSearchTerm] = useState<string>("");
    const searchResults = useQuery(api.lightcones.search, searchTerm.trim() ? { searchTerm } : "skip") || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsSearching(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value as string);
        setIsOpen(true);
        setIsSearching(true);
    }
    const handleFocusInput = () => {
        if (selectedLightcone && !isSearching) {
            setIsSearching(true);
            setSearchTerm("");
        }
        setIsOpen(true);
    };

    const handleSelectLightcone = (lightconeId: Id<"lightcones">) => {
        onLightconeChange(lightconeId, selectedRank || "S1");
        setSearchTerm("");
        setIsOpen(false);
        setIsSearching(false);
    };
    const handleClearLightcone = () => {
        onLightconeChange(undefined, undefined);
        setSearchTerm("");
        setIsOpen(false);
        setIsSearching(false);
    }

    const filteredLightcones = searchTerm.trim() ? searchResults : lightcones;
    const selectedLightcone = selectedLightconeId ? lightcones.find(l => l._id === selectedLightconeId) : null;
    const inputValue = (isSearching || !selectedLightcone) ? searchTerm : selectedLightcone.display_name;

    const getRarityColor = (lightconeRarity: number): string => {
        if (!lightconeRarity) return ``;

        switch (lightconeRarity) {
            case 3:
                return `var(--lc-3star)`;
            case 4:
                return `var(--lc-4star)`;
            case 5:
                return `var(--lc-5star)`;
            default:
                return ``;
        }
    }

    return (
        <div className="LightconeSelector" ref={dropdownRef}>
            <div className="inputs" title={selectedLightcone ? `${selectedRank || `S1`} ${selectedLightcone.display_name}` : undefined}>
                {/* SearchBar */}
                <input
                    className="search-bar focus:outline-none"

                    value={inputValue}
                    onChange={handleChangeInput}
                    onFocus={handleFocusInput}
                    placeholder={selectedLightcone ? selectedLightcone.display_name : "Select Lightcone"}
                    name="lightcone"

                    style={{ color: (!isOpen && !isSearching) ? getRarityColor(selectedLightcone?.rarity) : `` }}
                />

                {/* LC Cost */}
                {
                    (selectedLightcone && !isSearching) && <>
                        <span className="cost">
                            {selectedLightcone.cost[selectedRank || "S1"].toFixed(1)}
                        </span>
                    </>
                }
            </div>

            {/* Search Results */}
            {
                isOpen && <>
                    <div className="result-set">
                        
                        {/* Clear button */}
                        {
                            selectedLightcone && <>
                                <button
                                    onClick={handleClearLightcone}
                                    className="clear hover:bg-gray-600"
                                >
                                    <span>{`None`}</span>
                                </button>
                            </>
                        }

                        {/* Results */}
                        {
                            (filteredLightcones?.length > 0 && searchTerm.trim().length > 0) ? <>
                                {
                                    filteredLightcones?.slice(0, 20).map(lightcone => (
                                        <button
                                            key={lightcone._id}
                                            onClick={() => handleSelectLightcone(lightcone._id)}
                                            className="result hover:bg-gray-600"
                                            title={lightcone.display_name}
                                        >
                                            <span className="name" style={{ color: getRarityColor(lightcone.rarity) }}>{lightcone.display_name}</span>
                                            <span className="cost">{(lightcone.cost.S1).toFixed(1)}</span>
                                        </button>
                                    ))
                                }
                            </> : <>
                                {/* Info */}
                                <div className="info">
                                    {searchTerm ? `No Lightcones found.` : `Start typing to search...`}
                                </div>
                            </>
                        }
                    </div>
                </>
            }
        </div>
    );
}

export default LightconeSelector;
