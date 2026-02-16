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
const DEFAULT_ANCHOR = { width: 100, x: -48, y: -32 };
const lightconeAnchors: Record<string, { 
    width: number | undefined;  // Image scale: Zoom in/out, 50 - 100 (original) - 150, value is converted into %
    x: number | undefined;      // X axis (0-100): Move left/right, 0 (far left) - 50 - 100 (far right), value is converted into %
    y: number | undefined;      // Y axis (0-100): Move up/down, 0 (far top) - 50 - 100 (far down), value is converted into %
}> = {
    'adreamscentedinwheat': { width: 130, x: -25, y: -30 },
    'agroundedascent': { width: 114, x: -40, y: -28 },
    'asecretvow': { width: 125, x: -29, y: -25 },
    'athanklesscoronation': { width: 130, x: -12, y: -26 },
    'atrailofbygoneblood': { width: 141, x: -12, y: -24 },
    'adversarial': { width: 80, x: -31, y: -40 },
    'afterthecharmonyfall': { width: 155, x: -49, y: -22 },
    'alongthepassingshore': { width: 160, x: -32, y: -68 },
    'amber': { width: 80, x: -25, y: -45 },
    'aninstantbeforeagaze': { width: 103, x: -29, y: -32 },
    'arrows': { width: 88, x: -18, y: -40 },
    'baptismofpurethought': { width: 115, x: -28, y: -35 },
    'beforedawn': { width: 115, x: -38, y: -30 },
    'beforethetutorialmissionstarts': { width: 100, x: -48, y: -32 },
    'boundlesschoreo': { width: 115, x: -35, y: -35 },
    'brighterthanthesun': { width: 110, x: -18, y: -30 },
    'butthebattleisntover': { width: 120, x: -25, y: -37 },
    'carvethemoonweavetheclouds': { width: 90, x: -26, y: -40 },
    'chorus': { width: 100, x: -18, y: -38 },
    'collapsingsky': { width: 110, x: -18, y: -33 },
    'concertfortwo': { width: 88, x: -14, y: -41 },
    'cornucopia': { width: 100, x: -48, y: -36 },
    'cruisinginthestellarsea': { width: 70, x: -18, y: -48 },
    'danceatsunset': { width: 100, x: -28, y: -36 },
    'dancedancedance': { width: 105, x: -48, y: -34 },
    'dartingarrow': { width: 88, x: -30, y: -60 },
    'databank': { width: 89, x: -40, y: -39 },
    'dayoneofmynewlife': { width: 168, x: -32, y: -21 },
    'defense': { width: 100, x: -42, y: -49 },
    'destinysthreadsforewoven': { width: 80, x: -25, y: -45 },
    'dreamsmontage': { width: 100, x: -22, y: -35 },
    'dreamvilleadventure': { width: 85, x: -22, y: -41 },
    'earthlyescapade': { width: 135, x: -18, y: -27 },
    'echoesofthecoffin': { width: 140, x: -15, y: -25 },
    'epochetchedingoldenblood': { width: 120, x: -30, y: -30 },
    'eternalcalculus': { width: 80, x: -22, y: -50 },
    'eyesoftheprey': { width: 150, x: -25, y: -24 },
    'fermata': { width: 100, x: -48, y: -36 },
    'finalvictor': { width: 120, x: -12, y: -29 },
    'finefruit': { width: 80, x: -15, y: -45 },
    'flameofbloodblazemypath': { width: 150, x: -30, y: -25 },
    'flamesafar': { width: 120, x: -30, y: -29 },
    'flowingnightglow': { width: 120, x: -23, y: -29 },
    'flyintoapinktomorrow': { width: 108, x: -36, y: -38 },
    'fortomorrowsjourney': { width: 105, x: -28, y: -32 },
    'geniusesgreetings': { width: 136, x: -40, y: -26 },
    'geniusesrepose': { width: 110, x: -12, y: -32 },
    'goodnightandsleepwell': { width: 90, x: -16, y: -38 },
    'heyoverhere': { width: 120, x: -16, y: -29 },
    'hiddenshadow': { width: 90, x: -16, y: -34 },
    'holidaythermaeescapade': { width: 110, x: -42, y: -29 },
    'ishallbemyownsword': { width: 189, x: -35, y: -20 },
    'iventureforthtohunt': { width: 164, x: -18, y: -22 },
    'iftimewereaflower': { width: 110, x: -28, y: -29 },
    'inpursuitofthewind': { width: 125, x: -22, y: -29 },
    'inthenameoftheworld': { width: 160, x: -38, y: -20 },
    'inthenight': { width: 148, x: -18, y: -24 },
    'incessantrain': { width: 112, x: -40, y: -28 },
    'indeliblepromise': { width: 110, x: -31, y: -32 },
    'inherentlyunjustdestiny': { width: 186, x: -23, y: -19 },
    'intotheunreachableveil': { width: 120, x: -25, y: -37 },
    'itsshowtime': { width: 100, x: -48, y: -36 },
    'journeyforeverpeaceful': { width: 124, x: -28, y: -29 },
    'landauschoice': { width: 168, x: -43, y: -21 },
    'liesdanceonthebreeze': { width: 100, x: -30, y: -54 },
    'lifeshouldbecasttoflames': { width: 124, x: -28, y: -29 },
    'longmayrainbowsadornthesky': { width: 114, x: -48, y: -27 },
    'longroadleadshome': { width: 124, x: -30, y: -29 },
    'loop': { width: 64, x: -18, y: -48 },
    'makefarewellsmorebeautiful': { width: 124, x: -26, y: -27 },
    'maketheworldclamor': { width: 124, x: -15, y: -25 },
    'mediation': { width: 90, x: -28, y: -35 },
    'memoriesofthepast': { width: 120, x: -29, y: -27 },
    'memoryscurtainneverfalls': { width: 103, x: -29, y: -35 },
    'meshingcogs': { width: 64, x: -18, y: -48 },
    'momentofvictory': { width: 158, x: -48, y: -23 },
    'multiplication': { width: 64, x: -18, y: -48 },
    'mutualdemise': { width: 100, x: -23, y: -32 },
    'neverforgetherflame': { width: 160, x: -50, y: -25 },
    'nightoffright': { width: 120, x: -25, y: -26 },
    'nightonthemilkyway': { width: 160, x: -32, y: -20 },
    'ninjarecordsoundhunt': { width: 135, x: -18, y: -22 },
    'ninjutsuinscriptiondazzlingevilbreaker': { width: 124, x: -20, y: -25 },
    'nowheretorun': { width: 166, x: -18, y: -24 },
    'onthefallofanaeon': { width: 70, x: -20, y: -48 },
    'onlysilenceremains': { width: 118, x: -38, y: -29 },
    'passkey': { width: 80, x: -18, y: -40 },
    'pastandfuture': { width: 170, x: -15, y: -19 },
    'pastselfinmirror': { width: 90, x: -18, y: -38 },
    'patienceisallyouneed': { width: 120, x: -28, y: -26 },
    'perfecttiming': { width: 135, x: -35, y: -23 },
    'pioneering': { width: 100, x: -24, y: -32 },
    'planetaryrendezvous': { width: 140, x: -19, y: -22 },
    'poisedtobloom': { width: 140, x: -25, y: -22 },
    'postopconversation': { width: 156, x: -26, y: -20 },
    'quidproquo': { width: 122, x: -25, y: -28 },
    'reforgedremembrance': { width: 122, x: -25, y: -28 },
    'reminiscence': { width: 100, x: -44, y: -41 },
    'resolutionshinesaspearlsofsweat': { width: 160, x: -35, y: -20 },
    'returntodarkness': { width: 138, x: -35, y: -25 },
    'riverflowsinspring': { width: 189, x: -22, y: -19 },
    'sagacity': { width: 90, x: -18, y: -35 },
    'sailingtowardsasecondlife': { width: 145, x: -23, y: -25 },
    'scentalonestaystrue': { width: 140, x: -48, y: -23 },
    'seeyouattheend': { width: 133, x: -42, y: -28 },
    'shadowburn': { width: 75, x: -20, y: -47 },
    'shadowedbynight': { width: 164, x: -35, y: -22 },
    'sharedfeeling': { width: 100, x: -48, y: -32 },
    'shatteredhome': { width: 80, x: -25, y: -44 },
    'shealreadyshuthereyes': { width: 119, x: -32, y: -29 },
    'sleeplikethedead': { width: 85, x: -28, y: -35 },
    'solitaryhealing': { width: 85, x: -18, y: -36 },
    'somethingirreplaceable': { width: 141, x: -38, y: -25 },
    'subscribeformore': { width: 163, x: -34, y: -22 },
    'sweatnowcryless': { width: 139, x: -12, y: -26 },
    'swordplay': { width: 126, x: -33, y: -27 },
    'textureofmemories': { width: 90, x: -26, y: -39 },
    'thebirthoftheself': { width: 110, x: -15, y: -29 },
    'thedaythecosmosfell': { width: 80, x: -15, y: -42 },
    'theflowerremembers': { width: 122, x: -28, y: -39 },
    'theforevervictual': { width: 80, x: -28, y: -39 },
    'thegreatcosmicenterprise': { width: 70, x: -18, y: -50 },
    'thehellwhereidealsburn': { width: 133, x: -32, y: -26 },
    'themoleswelcomeyou': { width: 100, x: -23, y: -32 },
    'theseriousnessofbreakfast': { width: 100, x: -12, y: -32 },
    'thestorysnextpage': { width: 158, x: -29, y: -23 },
    'theunreachableside': { width: 205, x: -63, y: -19 },
    'thisloveforever': { width: 132, x: -45, y: -24 },
    'thisisme': { width: 102, x: -43, y: -39 },
    'thosemanysprings': { width: 150, x: -22, y: -22 },
    'thoughworldsapart': { width: 174, x: -14, y: -22 },
    'thusburnsthedawn': { width: 113, x: -12, y: -29 },
    'timewaitsfornoone': { width: 153, x: -19, y: -26 },
    'timewovenintogold': { width: 130, x: -32, y: -28 },
    'toevernightsstars': { width: 128, x: -14, y: -46 },
    'todayisanotherpeacefulday': { width: 100, x: -29, y: -32 },
    'trendoftheuniversalmarket': { width: 129, x: -33, y: -27 },
    'underthebluesky': { width: 100, x: -19, y: -38 },
    'untotomorrowsmorrow': { width: 115, x: -41, y: -30 },
    'victoryinablink': { width: 119, x: -30, y: -32 },
    'void': { width: 100, x: -25, y: -32 },
    'warmthshortenscoldnights': { width: 118, x: -33, y: -29 },
    'wearewildfire': { width: 105, x: -31, y: -33 },
    'wewillmeetagain': { width: 120, x: -50, y: -31},
    'whatisreal': { width: 118, x: -36, y: -40 },
    'whereaboutsshoulddreamsrest': { width: 153, x: -42, y: -23 },
    'whydoestheoceansing': { width: 165, x: -34, y: -26 },
    'woofwalktime': { width: 127, x: -38, y: -28 },
    'worrisomeblissful': { width: 146, x: -36, y: -24 },
    'yethopeispriceless': { width: 143, x: -26, y: -27},
    'sneerin': { width: 80, x: -26, y: -45},
    'lingeringtear': { width: 130, x: -25, y: -27},
    'todaysgoodluck': { width: 110, x: -23, y: -32},
    'mushyshroomysadventures': { width: 90, x: -23, y: -38},
    'whenshedecidedtosee': { width: 100, x: -25, y: -35},
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

                            width: `${lightconeAnchors[selectedLightcone.name]?.width || DEFAULT_ANCHOR.width}%`,
                            transform: `translate(
                                ${lightconeAnchors[selectedLightcone.name]?.x || DEFAULT_ANCHOR.x}%,
                                ${lightconeAnchors[selectedLightcone.name]?.y || DEFAULT_ANCHOR.y}%
                            )`,
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
                            <span className="name">{signatureLightcone.display_name}</span>
                            <span className="info">{`${character?.display_name}'s Signature`}</span>
                        </button>
                    )}
                </div>
            </>}
        </div>
    );
}

export default LightconeSelector;