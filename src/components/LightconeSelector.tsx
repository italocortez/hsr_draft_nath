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
const DEFAULT_ANCHOR = { width: 100, x: 48, y: 32 };
const lightconeAnchors: Record<string, { 
    width: number | undefined;  // Image scale: Zoom in/out, 50 - 100 (original) - 150, value is converted into %
    x: number | undefined;      // X axis (0-100): Move left/right, 0 (far left) - 50 - 100 (far right), value is converted into %
    y: number | undefined;      // Y axis (0-100): Move up/down, 0 (far top) - 50 - 100 (far down), value is converted into %
}> = {
    'adreamscentedinwheat': { width: 130, x: 25, y: 30 },
    'agroundedascent': { width: 114, x: 40, y: 28 },
    'asecretvow': { width: 125, x: 29, y: 25 },
    'athanklesscoronation': { width: 130, x: 12, y: 26 },
    'atrailofbygoneblood': { width: 141, x: 12, y: 24 },
    'adversarial': { width: 80, x: 31, y: 40 },
    'afterthecharmonyfall': { width: 155, x: 49, y: 22 },

    'alongthepassingshore': { width: undefined, x: undefined, y: undefined },
    'amber': { width: undefined, x: undefined, y: undefined },
    'aninstantbeforeagaze': { width: undefined, x: undefined, y: undefined },
    'arrows': { width: undefined, x: undefined, y: undefined },
    'baptismofpurethought': { width: undefined, x: undefined, y: undefined },
    'beforedawn': { width: undefined, x: undefined, y: undefined },
    'beforethetutorialmissionstarts': { width: undefined, x: undefined, y: undefined },
    'boundlesschoreo': { width: undefined, x: undefined, y: undefined },
    'brighterthanthesun': { width: undefined, x: undefined, y: undefined },
    'butthebattleisntover': { width: undefined, x: undefined, y: undefined },
    'carvethemoonweavetheclouds': { width: undefined, x: undefined, y: undefined },
    'chorus': { width: undefined, x: undefined, y: undefined },
    'collapsingsky': { width: undefined, x: undefined, y: undefined },
    'concertfortwo': { width: undefined, x: undefined, y: undefined },
    'cornucopia': { width: undefined, x: undefined, y: undefined },
    'cruisinginthestellarsea': { width: undefined, x: undefined, y: undefined },
    'danceatsunset': { width: undefined, x: undefined, y: undefined },
    'dancedancedance': { width: undefined, x: undefined, y: undefined },
    'dartingarrow': { width: undefined, x: undefined, y: undefined },
    'databank': { width: undefined, x: undefined, y: undefined },
    'dayoneofmynewlife': { width: undefined, x: undefined, y: undefined },
    'defense': { width: undefined, x: undefined, y: undefined },
    'destinysthreadsforewoven': { width: undefined, x: undefined, y: undefined },
    'dreamsmontage': { width: undefined, x: undefined, y: undefined },
    'dreamvilleadventure': { width: undefined, x: undefined, y: undefined },
    'earthlyescapade': { width: undefined, x: undefined, y: undefined },
    'echoesofthecoffin': { width: undefined, x: undefined, y: undefined },
    'epochetchedingoldenblood': { width: undefined, x: undefined, y: undefined },
    'eternalcalculus': { width: undefined, x: undefined, y: undefined },
    'eyesoftheprey': { width: undefined, x: undefined, y: undefined },
    'fermata': { width: undefined, x: undefined, y: undefined },
    'finalvictor': { width: undefined, x: undefined, y: undefined },
    'finefruit': { width: undefined, x: undefined, y: undefined },
    'flameofbloodblazemypath': { width: undefined, x: undefined, y: undefined },
    'flamesafar': { width: undefined, x: undefined, y: undefined },
    'flowingnightglow': { width: undefined, x: undefined, y: undefined },
    'flyintoapinktomorrow': { width: undefined, x: undefined, y: undefined },
    'fortomorrowsjourney': { width: undefined, x: undefined, y: undefined },
    'geniusesgreetings': { width: undefined, x: undefined, y: undefined },
    'geniusesrepose': { width: undefined, x: undefined, y: undefined },
    'goodnightandsleepwell': { width: undefined, x: undefined, y: undefined },
    'heyoverhere': { width: undefined, x: undefined, y: undefined },
    'hiddenshadow': { width: undefined, x: undefined, y: undefined },
    'holidaythermaeescapade': { width: undefined, x: undefined, y: undefined },
    'ishallbemyownsword': { width: undefined, x: undefined, y: undefined },
    'iventureforthtohunt': { width: undefined, x: undefined, y: undefined },
    'iftimewereaflower': { width: undefined, x: undefined, y: undefined },
    'inpursuitofthewind': { width: undefined, x: undefined, y: undefined },
    'inthenameoftheworld': { width: undefined, x: undefined, y: undefined },
    'inthenight': { width: undefined, x: undefined, y: undefined },
    'incessantrain': { width: undefined, x: undefined, y: undefined },
    'indeliblepromise': { width: undefined, x: undefined, y: undefined },
    'inherentlyunjustdestiny': { width: undefined, x: undefined, y: undefined },
    'intotheunreachableveil': { width: undefined, x: undefined, y: undefined },
    'itsshowtime': { width: undefined, x: undefined, y: undefined },
    'journeyforeverpeaceful': { width: undefined, x: undefined, y: undefined },
    'landauschoice': { width: undefined, x: undefined, y: undefined },
    'liesdanceonthebreeze': { width: undefined, x: undefined, y: undefined },
    'lifeshouldbecasttoflames': { width: undefined, x: undefined, y: undefined },
    'longmayrainbowsadornthesky': { width: undefined, x: undefined, y: undefined },
    'longroadleadshome': { width: undefined, x: undefined, y: undefined },
    'loop': { width: undefined, x: undefined, y: undefined },
    'makefarewellsmorebeautiful': { width: undefined, x: undefined, y: undefined },
    'maketheworldclamor': { width: undefined, x: undefined, y: undefined },
    'mediation': { width: undefined, x: undefined, y: undefined },
    'memoriesofthepast': { width: undefined, x: undefined, y: undefined },
    'memoryscurtainneverfalls': { width: undefined, x: undefined, y: undefined },
    'meshingcogs': { width: undefined, x: undefined, y: undefined },
    'momentofvictory': { width: undefined, x: undefined, y: undefined },
    'multiplication': { width: undefined, x: undefined, y: undefined },
    'mutualdemise': { width: undefined, x: undefined, y: undefined },
    'neverforgetherflame': { width: undefined, x: undefined, y: undefined },
    'nightoffright': { width: undefined, x: undefined, y: undefined },
    'nightonthemilkyway': { width: undefined, x: undefined, y: undefined },
    'ninjarecordsoundhunt': { width: undefined, x: undefined, y: undefined },
    'ninjutsuinscriptiondazzlingevilbreaker': { width: undefined, x: undefined, y: undefined },
    'nowheretorun': { width: undefined, x: undefined, y: undefined },
    'onthefallofanaeon': { width: undefined, x: undefined, y: undefined },
    'onlysilenceremains': { width: undefined, x: undefined, y: undefined },
    'passkey': { width: undefined, x: undefined, y: undefined },
    'pastandfuture': { width: undefined, x: undefined, y: undefined },
    'pastselfinmirror': { width: undefined, x: undefined, y: undefined },
    'patienceisallyouneed': { width: undefined, x: undefined, y: undefined },
    'perfecttiming': { width: undefined, x: undefined, y: undefined },
    'pioneering': { width: undefined, x: undefined, y: undefined },
    'planetaryrendezvous': { width: undefined, x: undefined, y: undefined },
    'poisedtobloom': { width: undefined, x: undefined, y: undefined },
    'postopconversation': { width: undefined, x: undefined, y: undefined },
    'quidproquo': { width: undefined, x: undefined, y: undefined },
    'reforgedremembrance': { width: undefined, x: undefined, y: undefined },
    'reminiscence': { width: undefined, x: undefined, y: undefined },
    'resolutionshinesaspearlsofsweat': { width: undefined, x: undefined, y: undefined },
    'returntodarkness': { width: undefined, x: undefined, y: undefined },
    'riverflowsinspring': { width: undefined, x: undefined, y: undefined },
    'sagacity': { width: undefined, x: undefined, y: undefined },
    'sailingtowardsasecondlife': { width: undefined, x: undefined, y: undefined },
    'scentalonestaystrue': { width: 140, x: 48, y: 23 },
    'seeyouattheend': { width: undefined, x: undefined, y: undefined },
    'shadowburn': { width: undefined, x: undefined, y: undefined },
    'shadowedbynight': { width: undefined, x: undefined, y: undefined },
    'sharedfeeling': { width: undefined, x: undefined, y: undefined },
    'shatteredhome': { width: undefined, x: undefined, y: undefined },
    'shealreadyshuthereyes': { width: undefined, x: undefined, y: undefined },
    'sleeplikethedead': { width: undefined, x: undefined, y: undefined },
    'solitaryhealing': { width: undefined, x: undefined, y: undefined },
    'somethingirreplaceable': { width: undefined, x: undefined, y: undefined },
    'subscribeformore': { width: undefined, x: undefined, y: undefined },
    'sweatnowcryless': { width: undefined, x: undefined, y: undefined },
    'swordplay': { width: undefined, x: undefined, y: undefined },
    'textureofmemories': { width: undefined, x: undefined, y: undefined },
    'thebirthoftheself': { width: undefined, x: undefined, y: undefined },
    'thedaythecosmosfell': { width: undefined, x: undefined, y: undefined },
    'theflowerremembers': { width: undefined, x: undefined, y: undefined },
    'theforevervictual': { width: undefined, x: undefined, y: undefined },
    'thegreatcosmicenterprise': { width: undefined, x: undefined, y: undefined },
    'thehellwhereidealsburn': { width: undefined, x: undefined, y: undefined },
    'themoleswelcomeyou': { width: undefined, x: undefined, y: undefined },
    'theseriousnessofbreakfast': { width: undefined, x: undefined, y: undefined },
    'thestorysnextpage': { width: undefined, x: undefined, y: undefined },
    'theunreachableside': { width: undefined, x: undefined, y: undefined },
    'thisloveforever': { width: undefined, x: undefined, y: undefined },
    'thisisme': { width: undefined, x: undefined, y: undefined },
    'thosemanysprings': { width: undefined, x: undefined, y: undefined },
    'thoughworldsapart': { width: undefined, x: undefined, y: undefined },
    'thusburnsthedawn': { width: undefined, x: undefined, y: undefined },
    'timewaitsfornoone': { width: undefined, x: undefined, y: undefined },
    'timewovenintogold': { width: undefined, x: undefined, y: undefined },
    'toevernightsstars': { width: undefined, x: undefined, y: undefined },
    'todayisanotherpeacefulday': { width: undefined, x: undefined, y: undefined },
    'trendoftheuniversalmarket': { width: undefined, x: undefined, y: undefined },
    'underthebluesky': { width: undefined, x: undefined, y: undefined },
    'untotomorrowsmorrow': { width: undefined, x: undefined, y: undefined },
    'victoryinablink': { width: undefined, x: undefined, y: undefined },
    'void': { width: undefined, x: undefined, y: undefined },
    'warmthshortenscoldnights': { width: undefined, x: undefined, y: undefined },
    'wearewildfire': { width: undefined, x: undefined, y: undefined },
    'wewillmeetagain': { width: undefined, x: undefined, y: undefined },
    'whatisreal': { width: undefined, x: undefined, y: undefined },
    'whereaboutsshoulddreamsrest': { width: undefined, x: undefined, y: undefined },
    'whydoestheoceansing': { width: undefined, x: undefined, y: undefined },
    'woofwalktime': { width: undefined, x: undefined, y: undefined },
    'worrisomeblissful': { width: undefined, x: undefined, y: undefined },
    'yethopeispriceless': { width: undefined, x: undefined, y: undefined },
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
                                -${lightconeAnchors[selectedLightcone.name]?.x || DEFAULT_ANCHOR.x}%,
                                -${lightconeAnchors[selectedLightcone.name]?.y || DEFAULT_ANCHOR.y}%
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