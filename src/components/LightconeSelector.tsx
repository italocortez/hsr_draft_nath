import { ChangeEvent, ChangeEventHandler, JSX, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "../css/LightconeSelector.css";
import { Character, Lightcone, LightconeRank, Rarity } from "@/lib/utils";

interface LightconeSelectorProps {
	lightcones: Lightcone[];
    selectedLightconeId?: Id<"lightcones">;
    selectedRank?: LightconeRank;
    onLightconeChange: (lightconeId?: Id<"lightcones">, rank?: LightconeRank) => void;
    equippingCharacter?: Character;
}

function LightconeSelector(props: LightconeSelectorProps): JSX.Element {
    const { lightcones, selectedLightconeId, selectedRank, onLightconeChange, equippingCharacter } = props;
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [character, setCharacter] = useState<Character | undefined>(equippingCharacter);

    const [signatureLightcone, setSignatureLightcone] = useState<Lightcone | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredLightcones, setFilteredLightcones] = useState<Lightcone[]>([]);
    const selectedLightcone: Lightcone | undefined = selectedLightconeId ? lightcones.find(l => l._id === selectedLightconeId) : undefined;

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsSearching(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredLightcones([]);
            return undefined;
        }
        
        filterOutLightcones(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        // Check if character passed as argument
        if (equippingCharacter) {
            setCharacter(equippingCharacter);

            // Check if they're is limited banner (has Signature)
            if (equippingCharacter.rarity === 5) {
                const characterName = equippingCharacter.display_name.toLowerCase().replace(/\s/g, "");
                const sigLC: Lightcone | undefined = lightcones.find(lightcone => 
                    lightcone.aliases.some(alias => 
                        alias.toLowerCase() === characterName // LC alias matches Character's name
                        || equippingCharacter.aliases.some(charAlias => alias.toLowerCase() === charAlias.toLowerCase()) // Character alias matches LC alias
                    )
                );

                // Signature found - safely exit useEffect
                if (sigLC) {
                    setSignatureLightcone(sigLC);
                    return undefined;
                }
            } 

            // Character isn't a limited or no Signature was found
            setSignatureLightcone(undefined);
        } else {
            // No Character provided
            setCharacter(undefined);
            setSignatureLightcone(undefined);
        }
    }, [equippingCharacter]);

    const filterOutLightcones = (term: string) => {
        term = term.toLowerCase().replace(/\s/g, ""); // Lowercase ~ Remove spaces

        const newFiltered = [...lightcones].filter(lightcone => 
            lightcone._id !== selectedLightconeId // Avoid showing the currently equipped LC
            && (
                lightcone.display_name.toLowerCase().includes(term) // Name matches with searchTerm
                || lightcone.aliases.some(alias => alias.toLowerCase().includes(term)) // Alias matches with searchTerm
            ) 
        );

        setFilteredLightcones(newFiltered);
    }

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

    const handleSelectLightcone = (lightcone: Lightcone) => {
        // Limited LCs are selected as S1 by default
        if (lightcone.rarity === 5 && !lightcone.aliases.some(alias => alias.toLowerCase() === "shop")) {
            onLightconeChange(lightcone._id, "S1" as LightconeRank);
        } else {
            onLightconeChange(lightcone._id, "S5" as LightconeRank);
        }

        // Reset UI attributes
        setSearchTerm("");
        setIsOpen(false);
        setIsSearching(false);
    };
    const handleClearLightcone = () => {
        onLightconeChange(undefined, undefined);

        // Reset UI attributes
        setSearchTerm("");
        setIsOpen(false);
        setIsSearching(false);
    }

    return (
        <div className="LightconeSelector" ref={dropdownRef}>
            <div className="input-wrapper" title={selectedLightcone ? `${(selectedRank || "S1") as LightconeRank} ${selectedLightcone.display_name}` : undefined}>
                {/* Search Bar */}
                <input
                    className="search-bar focus:outline-none"

                    value={(isSearching || !selectedLightcone) ? searchTerm : selectedLightcone.display_name}
                    onChange={handleChangeInput}
                    onFocus={handleFocusInput}
                    placeholder={selectedLightcone?.display_name || "Select Lightcone"}
                    name="lightcone"

                    style={{ color: (selectedLightcone && !isSearching) ? `var(--lc-${selectedLightcone.rarity}star)` : `` }}
                />

                {/* LC Cost */}
                {(selectedLightcone && !isSearching) && <>
                    <span className="cost">
                        {selectedLightcone.cost[(selectedRank || "S1") as LightconeRank].toFixed(1)}
                    </span>
                </>}
            </div>

            {/* Search Results */}
            {isOpen && <>
                <div className="result-set">
                    
                    {/* Unequip Lightcone Button */}
                    {selectedLightcone && <>
                        <button
                            onClick={handleClearLightcone}
                            className="unequip-button"
                        >
                            {`Unequip Lightcone`}
                        </button>
                    </>}
                    
                    {/* Search Results */}
                    {filteredLightcones.length > 0 ? (
                        filteredLightcones.slice(0, 12).map(lightcone => (
                            <button
                                key={lightcone._id}
                                onClick={_ => handleSelectLightcone(lightcone)}
                                className="lightcone"
                                title={lightcone.display_name}
                            >
                                <span className="name" style={{ color: `var(--lc-${lightcone.rarity}star)` }}>{lightcone.display_name}</span>
                                <span className="cost">{(lightcone.cost.S1).toFixed(1)}</span>
                            </button>
                        ))
                    ) : (
                        <h3 className="info">
                            {(searchTerm.trim() === "") ? `Start typing to search...` : `No Lightcones found.`}
                        </h3>
                    )}

                    {/* Signature Lightcone */}
                    {(!selectedLightcone && signatureLightcone && (searchTerm.trim() === "")) && (
                        <button 
                            onClick={_ => handleSelectLightcone(signatureLightcone)}
                            className="sig-lc"
                            title={signatureLightcone.display_name}
                        >
                            <span className="name" style={{ color: `var(--lc-${signatureLightcone.rarity}star)` }}>{signatureLightcone.display_name}</span>
                            <span className="info">{`${character?.display_name}'s Signature`}</span>
                        </button>
                    )}
                </div>
            </>}
        </div>
    );
}

export default LightconeSelector;
