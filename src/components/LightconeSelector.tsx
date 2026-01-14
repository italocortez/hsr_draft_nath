import { ChangeEvent, JSX, useEffect, useRef, useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import "../css/LightconeSelector.css";
import { Character, Lightcone, LightconeRank } from "@/lib/utils";
import { LoadingSpinner } from "./ScreenshotButton";

const EmptyLightconeIcon: React.FC = () => (
    <svg
        className="lc-empty"
        viewBox="0 0 140 160"
        xmlns="http://www.w3.org/2000/svg"
    >
        <polygon
            points="
                0,0
                140,0
                90,80
                140,160
                0,160
                50,80
            "
            fill="none"
            stroke="#cfcfd6"
            strokeWidth="8"
            opacity="0.6"
            strokeLinejoin="round"
        />
        <rect
            x="60"
            y="20"
            width="20"
            height="120"
            fill="white"
            rx="2"
        />
        <rect
            x="10"
            y="70"
            width="52"
            height="20"
            fill="white"
            rx="2"
        />
        <rect
            x="88"
            y="70"
            width="38"
            height="20"
            fill="white"
            rx="2"
        />
    </svg>
);

// Lightcone positioning adjustments
const lightconeDimensions: Record<string, { width: string; bottom: string; left: string }> = {
    'scentalonestaystrue': { width: '120%', bottom: '0.5rem', left: '0.25rem' },
    // and many many more...
};

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
    const [isLightconeImageLoaded, setIsLightconeImageLoaded] = useState<boolean>(false);
    
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

    // In charge of displaying the Image and border properly
    const handleImageRef = (img: HTMLImageElement | null) => {
        if (img && img.complete && img.naturalHeight > 0) {
            setIsLightconeImageLoaded(true);
        }
    };
    useEffect(() => {
        setIsLightconeImageLoaded(false);
    }, [selectedLightconeId]);

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
                    autoComplete="off"

                    style={{ color: (selectedLightcone && !isSearching) ? `var(--lc-${selectedLightcone.rarity}star)` : `` }}
                />

                {/* LC Cost */}
                {/* {(selectedLightcone && !isSearching) && <>
                    <span className="cost">
                        {selectedLightcone.cost[(selectedRank || "S1") as LightconeRank].toFixed(1)}
                    </span>
                </>} */}
            </div>
            
            {/* "Border" for LC art - stops character and LC art from blending together. Also it has to be declared before the real lightcone-slot, to behave as a background */}
            {(selectedLightcone && isLightconeImageLoaded) && <div className="lightcone-slot divider" />}

            <div className="lightcone-slot">
                {selectedLightcone ? <>
                    {/* Loading spinner until Image loads */}
                    {!isLightconeImageLoaded && <LoadingSpinner />}

                    <img
                        src={selectedLightcone.imageUrl || `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${selectedLightcone.name.slice(0, 2)}</text></svg>`}
                        className="lc-art"
                        alt={selectedLightcone.name}
                        
                        // LC divider/"border" won't appear until the Image loads 
                        // Always check if image is actually loaded (handles both fresh and cached)
                        ref={handleImageRef}
                        onLoad={_ => setIsLightconeImageLoaded(true)}

                        style={{
                            opacity: isLightconeImageLoaded ? 1 : 0, // When swapping Lightcones, hide the previous one until new one loads

                            width: lightconeDimensions[selectedLightcone.name]?.width || `100%`,
                            bottom: lightconeDimensions[selectedLightcone.name]?.bottom || `0.5rem`,
                            left: lightconeDimensions[selectedLightcone.name]?.left || `0.5rem`,
                        }}
                    />
                </> : <>
                    <EmptyLightconeIcon />
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