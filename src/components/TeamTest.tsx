import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { RuleSet, DraftedCharacter, SelectedCharacter } from "./DraftingInterface";
import { Id } from "../../convex/_generated/dataModel";
import { CharacterPool } from "./CharacterPool";
import "../css/TeamTest.css";
import LightconeSelector from "./LightconeSelector";
import { Character, CharacterRank, Eidolons, Element, Lightcone, LightconeRank, Path, SuperImpositions, UniqueElements, UniquePaths } from "@/lib/utils";
import LoadoutManager, { Loadout, teamSize } from "@/lib/LoadoutManager";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import ScreenshotButton from "./ScreenshotButton";
import { createPortal } from "react-dom";

ChartJS.register(CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,ChartDataLabels);

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
const EditIcon: React.FC = () => (
    <svg 
        width="1rem" 
        height="1rem"    
        viewBox="0 0 528.899 528.899" 
        fill="white" 
        xmlns="http://www.w3.org/2000/svg" 
        style={{ cursor: `text` }}
    >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier"> 
            <g>
                <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path> 
            </g>
        </g>
    </svg>
);
const DropdownIcon = ({ isOpen = false }) => (
  <svg 
    width="1.5rem" 
    height="1.5rem" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <path 
      d="M4 6L8 10L12 6" 
      stroke="rgb(229, 203, 148)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

interface RightDropdownProps {
    children: ReactNode;
}
const RightDropdown: React.FC<RightDropdownProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const closeDropdown = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown when any button inside is clicked
    useEffect(() => {
        const handleButtonClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if the clicked element is inside a button within the dropdown
            if (dropdownRef.current && dropdownRef.current.contains(target)) {
                const closestButton = target.closest('button');
                if (closestButton && dropdownRef.current.contains(closestButton)) {
                    closeDropdown();
                }
            }
        };

        if (isOpen) {
            document.addEventListener("click", handleButtonClick);
        }

        return () => {
            document.removeEventListener("click", handleButtonClick);
        };
    }, [isOpen]);

    return (
        <div className="rosters">
            <button
                ref={triggerRef}
                onClick={_ => setIsOpen(!isOpen)}
                className="select-button"
                title="Select Team"
            >
                <DropdownIcon isOpen={isOpen} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="rosters-list" ref={dropdownRef}>
                    {children}
                </div>
            )}
        </div>
    );
};

interface PresetTeam {
    name: string;
    characters: DraftedCharacter[];
}
const presetTeams: PresetTeam[] = [
    {
        name: "Phainon",
        characters: [
            { characterId: ("k97a5m9a17jcmvegq0r5fywmf17nese0" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn72st4sw2bfsnh49k30jj1g0n7njh7r" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Phainon + Thus Burns the Dawn
            { characterId: ("k978apcyhknm1y61mxs23rbced7nex05" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn77jsbswdyrd750y1zqtnn2cs7njnkm" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Cerydra + Epoch Etched in Golden Blood
            { characterId: ("k977e3xtk9s3367xs9c16m7h5s7neh4p" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn70ggr4ggj06x35y82jse58sd7nkd62" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Sunday + A Grounded Ascent
            { characterId: ("k976p9djhk4f9zgfte2mjfyz3s7ne0qv" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn72zccerxtzxpn3qxhyqw48kx7nkq6y" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Bronya + But the Battle Isn't Over
        ]
    },
    {
        name: "Castorice",
        characters: [
            { characterId: ("k9764wr4x5hwgshhatqs4qq79h7neegd" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn78jv855hw5tny19z770g4tyn7nj0xk" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Castorice + Make Farewells More Beautiful
            { characterId: ("k97a9wrtw2adsj4542rdjewfb97nfabr" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7dw18xba6zx1e2wh7e78g9qx7njfhb" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Tribbie + If Time Were a Flower
            { characterId: ("k977j0xkfyf2jq8rxswr7far5n7nf97z" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn78dzbd7b51cnh9bevfjgnhz97nj4s5" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Hyacine + Long May Rainbows Adorn the Sky
            { characterId: ("k976cg42vpczqq9bh80hwbh4an7nezr6" as Id<"character">), rank: ("E6" as CharacterRank), lightconeId: ("kn76gwj2a8g5hgqsjfden6nbrn7nk5e7" as Id<"lightcones">), lightconeRank: ("S5" as LightconeRank) }, // MC Remembrance + Sailing Towards A Second Life
        ]
    },
    {
        name: "Saber",
        characters: [
            { characterId: ("k9754r9f6szn75acjp7w7a54p97nefha" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7bq15fy62e5wk5haay9wz01d7nj43c" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Saber + A Thankless Coronation
            { characterId: ("k977e3xtk9s3367xs9c16m7h5s7neh4p" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn70ggr4ggj06x35y82jse58sd7nkd62" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Sunday + A Grounded Ascent
            { characterId: ("k97810829e9352yvz2vg5qzsss7neq86" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7df79brpvpks465hcs0cm78s7nk5fs" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Robin + Flowing Nightglow
            { characterId: ("k9766zxwjq807p935g5sb93tfx7nfyeb" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7a1cmkeymd15zqt2ymjdqck97nk1r4" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Huohuo + Night of Fright
        ]
    },
    {
        name: "Archer",
        characters: [
            { characterId: ("k971ddqj1pw5x5f08s9jzjpaz97neeps" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn74sm5sahm7gszrhk6bcq46xn7nkp1a" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Archer + The Hell Where Ideals Burn
            { characterId: ("k978qka446vy5thqbvn6crrqv57ne1qw" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn70txch1779dh1j68htjzwhe97nk2ah" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Sparkle + Earthly Escapade
            { characterId: ("k97fm6h5zxcmh8n17fyekanv5h7neptb" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn74ejphy0kcppypw9djzepk6h7njd2s" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Silver Wolf + Incessant Rain
            { characterId: ("k974vzpj9nqgdt5r0cdgh2edqx7nej1f" as Id<"character">), rank: ("E6" as CharacterRank), lightconeId: ("kn7bk9eqhrzvbst0d0mpm5mvqx7nkq2n" as Id<"lightcones">), lightconeRank: ("S5" as LightconeRank) }, // Gallagher + Quid Pro Quo
        ]
    },
    {
        name: "Acheron",
        characters: [
            { characterId: ("k971yf2pyr48ccjhd3b04e4hqh7ne2t2" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn79mj8dm65vktscprd4b6808x7njx00" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Acheron + Along the Passing Shore
            { characterId: ("k976vb20n5hqchcsbzg89rx04s7nfcta" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn73mfbc8bwmye38evhjet1bb17nj2rr" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Cipher + Lies Dance on the Breeze
            { characterId: ("k978pgybt1ewtfhg35bfggc18n7nfzcf" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn734smf185sgw47vtrd1r6pvh7njknm" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Jiaoqiu + Those Many Springs
            { characterId: ("k97cdrr4k6zt5aarjmbsx5bz817nfn6z" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn747rxg98pa58a9p83ta5fdcd7njbpm" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Aventurine + Inherently Unjust Destiny
        ]
    },
    {
        name: "Feixiao",
        characters: [
            { characterId: ("k9791zwayydp16ys38e29ng17n7neyv7" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn71y8bwxg0gpfp3x6jn9wdks97nk620" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Feixiao + I Venture Forth to Hunt
            { characterId: ("k97dnx79871dj628zy4g548re17ne90s" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn71wahsrhctqmh0yqv2rkw5817nky9s" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Topaz + Worrisome, Blissful
            { characterId: ("k97810829e9352yvz2vg5qzsss7neq86" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7df79brpvpks465hcs0cm78s7nk5fs" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Robin + Flowing Nightglow
            { characterId: ("k97cdrr4k6zt5aarjmbsx5bz817nfn6z" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn747rxg98pa58a9p83ta5fdcd7njbpm" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Aventurine + Inherently Unjust Destiny
        ]
    },
    {
        name: "Firefly",
        characters: [
            { characterId: ("k97ah2ksjey5036tkqhecq9ybx7ne7b4" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn743sqwrqbv95qgxzyna1a2dd7njzv1" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Firefly + Whereabouts Should Dreams Rest
            { characterId: ("k9750srm30azpys5shmk8qcex17neqb8" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7awbmkp1e1a5nbm0bqq6svkh7nk20v" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Fugue + Long Road Leads Home
            { characterId: ("k97f16tew7csfmad66z3sdw9j57nfmph" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7eqt2dvfsg1dqaxsnaycj2rs7njrja" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Lingsha + Scent Alone Stays True
            { characterId: ("k972cf91sg2p70td2m6b15c2z97nfy2z" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7d5qnrbkgdyhpdcs4g34d6d57njyfg" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Ruan Mei + Past Self in Mirror
        ]
    },
    {
        name: "DoT Kafka",
        characters: [
            { characterId: ("k974gjdammnrsd1bcbcykaw5rn7ne79d" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn79pjvc877bb7d9t16cbyapxn7nj319" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Kafka + Patience Is All You Need
            { characterId: ("k97ewdd4gzzh1v64d7jwem2zjd7nfwkz" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn70ceg10zcz5hkwr35xja3bg97njrd5" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Hysilens + Why Does the Ocean Sing
            { characterId: ("k97fq3ggy3ztzf7je96mh785p97nfkqj" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn70vz5aqpnjhefbmn693h7ky57nk97p" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Black Swan + Reforged Remembrance
            { characterId: ("k9766zxwjq807p935g5sb93tfx7nfyeb" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7a1cmkeymd15zqt2ymjdqck97nk1r4" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Huohuo + Night of Fright
        ]
    },
    {
        name: "The Herta",
        characters: [
            { characterId: ("k973ahce4gjxpqkg1a3yp2v0v17nehvd" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn77qr931sske3f371c0y0r7as7nkecv" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // The Herta + Into the Unreachable Veil
            { characterId: ("k970q9v4avaxhsap8yr9ax6twx7nf8v9" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn72nny42bcqv8qq0rd34314b97njdc4" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Anaxa + Life Should Be Cast to Flames
            { characterId: ("k97a9wrtw2adsj4542rdjewfb97nfabr" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7dw18xba6zx1e2wh7e78g9qx7njfhb" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Tribbie + If Time Were a Flower
            { characterId: ("k97f16tew7csfmad66z3sdw9j57nfmph" as Id<"character">), rank: ("E0" as CharacterRank), lightconeId: ("kn7eqt2dvfsg1dqaxsnaycj2rs7njrja" as Id<"lightcones">), lightconeRank: ("S1" as LightconeRank) }, // Lingsha + Scent Alone Stays True
        ]
    }
];

interface PresetTeamsDropdownProps {
    onSelectTeam: (newTeam: DraftedCharacter[]) => void;
}
const PresetTeamsDropdown: React.FC<PresetTeamsDropdownProps> = ({ onSelectTeam }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const closeDropdown = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown when team is selected
    const handleTeamSelect = (newTeam: DraftedCharacter[]) => {
        onSelectTeam(newTeam);
        closeDropdown();
    };

    return (
        <div className="preset-teams">
            <button
                ref={triggerRef}
                onClick={_ => setIsOpen(!isOpen)}
                className="preset-button button"
            >
                {`Load Preset Rosters`}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="preset-list"
                >
                    {presetTeams.map((team: PresetTeam, index: number) => (
                        <button
                            key={index}
                            onClick={_ => handleTeamSelect(team.characters)}
                            className="preset-option"
                        >
                            <h3 className="title">{team.name}</h3>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false
}) => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Create or get the portal container
            let container = document.getElementById('confirmation-modal-portal');
            if (!container) {
                container = document.createElement('div');
                container.id = 'confirmation-modal-portal';
                document.body.appendChild(container);
            }
            setPortalContainer(container);
        }

        // Cleanup: remove container when component unmounts
        return () => {
            if (!isOpen) {
                const existingContainer = document.getElementById('confirmation-modal-portal');
                if (existingContainer && existingContainer.children.length === 0) {
                    document.body.removeChild(existingContainer);
                }
            }
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onCancel]);

    // Fix for preventing accidental modal closure when dragging text selection outside modal
    const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only track mousedown if it's directly on the overlay (not on modal content)
        if (e.target === e.currentTarget) {
            (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay = 'true';
        }
    };
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only close if both mousedown and click happened on the overlay
        if (e.target === e.currentTarget && 
            (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay === 'true') {
            onCancel();
        }
        // Clear the flag
        delete (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay;
    };

    if (!isOpen || !portalContainer) {
        return (<></>);
    }
    return createPortal(
        <div 
            className="confirmation-overlay"
            onMouseDown={handleOverlayMouseDown}
            onClick={handleOverlayClick} 
        >
            <div className="confirmation-modal Box">
                <h2 className="confirmation-title">
                    {title}
                </h2>
                
                <p className="confirmation-message">
                    {message}
                </p>
                
                <div className="confirmation-actions">
                    <button
                        onClick={onCancel}
                        className="button confirmation-cancel"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`button confirmation-confirm ${isDangerous ? 'dangerous' : ''}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        portalContainer
    );
};

interface TeamTestProps {
    characters: Character[];
    lightcones: Lightcone[];
}

export function TeamTest({ characters, lightcones }: TeamTestProps) {
    const icons = useQuery(api.icons.list) || [];
    const [loadouts, setLoadouts] = useState<Loadout[]>(LoadoutManager.loadLoadouts());
    const [loadoutIndex, setLoadoutIndex] = useState<number>(LoadoutManager.loadCurrentLoadoutIndex());
    const [ruleSet, setRuleSet] = useState<RuleSet>(LoadoutManager.getLatestRulesetView());
    
    const defaultTeamName: string = `Team ${(loadoutIndex ?? 0) + 1}`;
    const [editingName, setEditingName] = useState<boolean>(false); // Is User currently editing a Loadout's name
    const [tempName, setTempName] = useState<string>(loadouts[loadoutIndex]?.name); // Temporary field for editing a Loadout's name
    const [showCharacters, setShowCharacters] = useState<boolean>(true); // Show character names on the cost breakdown chart
    const [showResetConfirmation, setShowResetConfirmation] = useState<boolean>(false); // Show overlay to confirm resetting Loadouts

    const currentTeam: DraftedCharacter[] = loadouts[loadoutIndex]?.team || [];
    const currentName: string = loadouts[loadoutIndex]?.name || defaultTeamName;

    // Initialize Loadouts and active loadout
    useEffect(() => {
        const storedLoadouts = LoadoutManager.loadLoadouts();
        const storedIndex = LoadoutManager.loadCurrentLoadoutIndex();
        const lastRuleSet = LoadoutManager.getLatestRulesetView();
        
        setLoadouts(storedLoadouts);
        setLoadoutIndex(storedIndex);
        setRuleSet(lastRuleSet);
    }, []);

    // Save the index of last Loadout slot worked on 
    useEffect(() => {
        LoadoutManager.saveCurrentLoadoutIndex(loadoutIndex);
    }, [loadoutIndex]);

    // Save the Last Rule Set viewed
    useEffect(() => {
        LoadoutManager.setLatestRulesetView(ruleSet);
    }, [ruleSet]);

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

    const updateCurrentLoadout = (newTeam: DraftedCharacter[]) => {
        setLoadouts(prev => {
            const newLoadouts = [...prev];
            newLoadouts[loadoutIndex] = {
                ...newLoadouts[loadoutIndex],
                team: newTeam
            };
            return newLoadouts;
        });
    };

    const handleCharacterSelect = (character: Character) => {
        if (currentTeam.some(selected => selected.characterId === character._id) || currentTeam.length >= teamSize) return;

        const newCharacter: DraftedCharacter = {
            characterId: character._id,
            rank: getCharacterRank(character),
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
        setLoadoutIndex(newIndex);
    };

    const handleClearCurrentLoadout = () => {
        updateCurrentLoadout([]);
    };
    
    const handleClearAllLoadouts = () => setShowResetConfirmation(true);
    const handleCancelReset = () => setShowResetConfirmation(false);
    const handleConfirmResetAll = () => {
        const clearedLoadouts = LoadoutManager.getDefaultLoadouts();
        setLoadouts(clearedLoadouts);
        setLoadoutIndex(0);
        setShowResetConfirmation(false);
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

    const getCharacterRank = (character: Character): CharacterRank => {
        if (character.rarity !== 5) return "E6"; // Default 4-star Characters to be E6
        if (character.display_name.startsWith("MC ")) return "E6"; // Default Trailblazer variations are E6
        return "E0";
    }
    
    const getChartCharacterColor = (): string => {
        if (ruleSet === "memoryofchaos") return `#3b82f6`;
        if (ruleSet === "apocalypticshadow") return `#8b5cf6`;
        return ``;
    }
    const getChartLightconeColor = (): string => {
        if (ruleSet === "memoryofchaos") return `#60a5fa`;
        if (ruleSet === "apocalypticshadow") return `#a78bfa`;
        return ``;
    }

    const handleStartEditing = () => {
        // When starting to edit, if the current name is the default, clear it for easier editing
        setTempName((currentName === defaultTeamName) ? "" : currentName);
        setEditingName(true);
    };
    const handleNameSubmit = () => {
        // If tempName is empty or just whitespace, use the default name
        const finalName = tempName.trim() || defaultTeamName;

        setLoadouts(prev => {
            const newLoadouts = [...prev];
            newLoadouts[loadoutIndex] = {
                ...newLoadouts[loadoutIndex],
                name: finalName
            };
            return newLoadouts;
        });
        setEditingName(false);
    };

    return (
        <div className="TeamTest">
            <div className="main" id="loadout">
                {/* Team view */}
                <div className="roster Box">
                    <h2 className="sub-header">{`Team (${currentTeam.length}/4)`}</h2>

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
                            const lightcone: Lightcone | undefined = (drafted.lightconeId) ? lightcones.find((l) => l._id === drafted.lightconeId) ?? undefined : undefined;

                            return (
                                <div
                                    key={index}
                                    className="slot"
                                    data-rarity={character.rarity}
                                    style={{ background: `var(--gradient-${character.rarity}star)` }} // Must be here for Path to appear behind portrait
                                >
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
                                    />

                                    {/* Character info */}
                                    <div className="character">
                                        {/* Clear button */}
                                        <button
                                            onClick={_ => handleRemoveCharacter(index)}
                                            className="clear-button"
                                            title={`Remove ${character.display_name}`}
                                        >
                                            <ClearIcon />
                                        </button>

                                        {/* Element */}
                                        <img
                                            src={elementIconUrl}
                                            className="element"
                                            alt={character.element}
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

                {/* Cost Breakdown */}
                <div className="cost-breakdown Box">
                    {/* Header */}
                    <div className="header">
                        <h3 className="title">Cost Breakdown</h3>

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
                    
                    {/* Content - Chart */}
                    <div className="content">
                        {currentTeam.length > 0 ? (
                            <Bar
                                // Yes it has to be here. Fuck this library.
                                style={{ position: `absolute`, bottom: 0, left: 0, height: `100%`, width: `100%` }}

                                data={{
                                    labels: currentTeam.map(drafted => showCharacters ? (characters.find(c => c._id === drafted.characterId)?.display_name || "Unknown") : "■".repeat(Math.min(Math.ceil((characters.find(c => c._id === drafted.characterId)?.display_name.length || 3) / 3), 5)) ),

                                    datasets: [
                                        {
                                            label: "Character",
                                            data: currentTeam.map(drafted => {
                                                const character = characters.find(c => c._id === drafted.characterId);
                                                if (!character) return 0;
                                                
                                                return character.cost[ruleSet][drafted.rank];
                                            }),

                                            backgroundColor: getChartCharacterColor(),
                                            borderSkipped: true,
                                        },
                                        {
                                            label: "Lightcone",
                                            data: currentTeam.map(drafted => {
                                                const character = characters.find(c => c._id === drafted.characterId);
                                                if (!character) return 0;
                                                
                                                if (drafted.lightconeId && drafted.lightconeRank) {
                                                    const lightcone = lightcones.find(l => l._id === drafted.lightconeId);
                                                    if (lightcone) return lightcone.cost[drafted.lightconeRank];
                                                }
                                                return 0;
                                            }),

                                            backgroundColor: getChartLightconeColor(),
                                            borderSkipped: true,
                                        },
                                    ],
                                }}

                                options={{
                                    responsive: true,
                                    clip: false,
                                    interaction: {
                                        intersect: false,
                                        mode: 'index',
                                    },

                                    maintainAspectRatio: false,
                                    layout: {
                                        padding: {
                                            top: 24, // Add padding at the top to prevent clipping
                                            right: 8,
                                        }
                                    },

                                    plugins: {
                                        legend: {
                                            display: false,
                                            position: `bottom`
                                        },

                                        datalabels: {
                                            display: true,
                                            anchor: 'end',
                                            align: 'top',
                                            offset: -4,
                                            clamp: true,

                                            color: `rgb(251, 191, 36)`,
                                            font: { weight: 'bold', size: 16 },

                                            formatter: (value: number, ctx: any) => {
                                                if (ctx.datasetIndex !== 1) return ``;
                                                
                                                const drafted = currentTeam[ctx.dataIndex];
                                                const char = characters.find(c => c._id === drafted.characterId);
                                                if (!char) return ``;

                                                let total = char.cost[ruleSet][drafted.rank];
                                                if (drafted.lightconeId && drafted.lightconeRank) {
                                                    const lc = lightcones.find(l => l._id === drafted.lightconeId);
                                                    if (lc) total += lc.cost[drafted.lightconeRank];
                                                }

                                                return `Σ ${total.toFixed(1)}`;
                                            },
                                        },
                                    },

                                    scales: {
                                        // Character names
                                        x: {
                                            stacked: true,
                                            ticks: {
                                                color: `white`,
                                                maxRotation: 45,
                                                minRotation: 0,
                                                font: {
                                                    size: 12,
                                                    weight: "bold"
                                                },
                                            },
                                            grid: {
                                                display: false
                                            },
                                        },

                                        y: {
                                            stacked: true,
                                            beginAtZero: true,
                                            ticks: {
                                                display: false,
                                            },
                                            grid: {
                                                display: true,
                                                color: `rgb(55, 65, 81)`,
                                            },
                                            title: {
                                                display: true,
                                                text: `Cost — ${ruleSet === "memoryofchaos" ? `MoC` : `AS`}`,
                                                color: `rgb(209, 213, 219)`,
                                                font: {
                                                    size: 14,
                                                    weight: 'bold',
                                                }
                                            }
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <div className="empty">
                                <h3>No characters selected</h3>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="footer">
                        {/* Legend */}
                        <div className="legend">
                            <div className="section">
                                <div className="square" style={{ backgroundColor: getChartCharacterColor() }} />
                                <h3 className="name">Character</h3>
                            </div>
                            <div className="section">
                                <div className="square" style={{ backgroundColor: getChartLightconeColor() }} />
                                <h3 className="name">Lightcone</h3>
                            </div>
                        </div>
                        
                        {/* Total Cost */}
                        <h2 className="total-cost">{`Σ ${getTotalCostForMode(ruleSet).toFixed(1)}`}</h2>
                    </div>
                </div>

                {/* Roster Controls */}
                <div className="controls Box">
                    {/* Roster select + Name/Edit */}
                    <div className="header">
                        <RightDropdown>
                            <div className="dropdown-header">
                                <h2 className="title">Loadout Overview</h2>
                            </div>

                            {loadouts.map((loadout: Loadout, index: number) => (
                                <button
                                    key={index}
                                    disabled={index === loadoutIndex}
                                    onClick={_ => handleLoadoutChange(index)}
                                    className="team-option"
                                >
                                    {/* Loadout Name */}
                                    <h3 className="title" style={{ color: (index === loadoutIndex) ? `rgb(229, 203, 148)` : `` }}>
                                        {`${loadout.name}${(index === loadoutIndex) ? ` (Selected)` : ``}`}
                                    </h3>
                                    
                                    {/* Loadout Roster */}
                                    <div className="characters-container">
                                        {Array.from({ length: 4 }).map((_, charIndex: number) => {
                                            const drafted: DraftedCharacter = loadout.team[charIndex];
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

                                            return (
                                                <div
                                                    key={charIndex}
                                                    className="slot rounded border"
                                                    data-rarity={character.rarity}
                                                    style={{ background: `var(--gradient-${character.rarity}star)` }} // Must be here for Path to appear behind portrait
                                                >
                                                    {/* Element */}
                                                    <img
                                                        src={elementIconUrl}
                                                        className="element"
                                                        alt={character.element}
                                                    />

                                                    {/* Portrait */}
                                                    <img
                                                        src={character.imageUrl}
                                                        className="portrait"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </button>
                            ))}
                        </RightDropdown>

                        {!editingName ? <>
                            <h1 
                                className="title name" 
                                onClick={handleStartEditing}
                                title="Click to Edit"
                            >
                                {currentName || defaultTeamName}

                                <EditIcon />
                                
                                { (currentName !== defaultTeamName) && <span className="helper-text">{defaultTeamName}</span> }
                            </h1>

                        </> : (
                            <input
                                className="title editor focus:outline-none"
                                
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value as string)}
                                onBlur={handleNameSubmit}
                                onKeyDown={(e) => (e.key === "Enter") && handleNameSubmit()}
                                
                                placeholder={defaultTeamName}
                                autoFocus
                                maxLength={20}
                            />
                        )}
                    </div>

                    <div className="content">
                        {/* Copy Loadout to Clipboard */}
                        <ScreenshotButton action="clipboard" targetElementId="loadout" />

                        {/* Download Clipboard */}
                        <ScreenshotButton action="download" targetElementId="loadout" />

                        {/* Toggle Character Names Visibility */}
                        <button
                            onClick={_ => setShowCharacters(prev => !prev)}
                            className="button toggle-names"
                            data-hidden={!showCharacters}
                            title={showCharacters ? "Hide Character Names in Breakdown" : "Show Character Names in Breakdown"}
                        >
                            {showCharacters ? "Hide Names" : "Show Names"}
                        </button>
                        
                        {/* Clear button */}
                        <button
                            onClick={handleClearCurrentLoadout}
                            className="button clear"
                        >
                            {`Remove all`}
                        </button>

                        {/* Reset All Loadouts Button + Confirmation Modal */}
                        <button
                            onClick={handleClearAllLoadouts}
                            className="button reset-all"
                        >
                            {`Reset All Loadouts`}
                        </button>
                        <ConfirmationModal
                            isOpen={showResetConfirmation}
                            onConfirm={handleConfirmResetAll}
                            onCancel={handleCancelReset}
                            title="Reset All Loadouts"
                            message="This action cannot be undone and will permanently delete all your saved loadouts"
                            confirmText="Reset All"
                            cancelText="Cancel"
                            isDangerous
                        />

                        {/* Load Preset Roster */}
                        <PresetTeamsDropdown onSelectTeam={updateCurrentLoadout} />
                    </div>

                </div>

                {/* Notes Box */}
                <div className="notes-box">
                    <div className="notes-header">
                        <h3 className="text-white font-medium">Notes</h3>
                        <span className="text-gray-400 text-sm">
                            {(loadouts[loadoutIndex]?.notes || "").length}/1000
                        </span>
                    </div>
                    <textarea
                        value={loadouts[loadoutIndex]?.notes || ""}
                        onChange={(e) => {
                            if (e.target.value.length <= 1000) {
                                const newLoadouts = [...loadouts];
                                newLoadouts[loadoutIndex] = {
                                    ...newLoadouts[loadoutIndex],
                                    notes: e.target.value
                                };
                                setLoadouts(newLoadouts);
                            }
                        }}
                        placeholder="Add notes about this loadout..."
                        className="notes-textarea"
                        maxLength={1000}
                    />
                </div>
            </div>

            {/* Character Pool */}
            <CharacterPool
                characters={characters}
                selectedCharacters={currentTeam.map(d => ({ characterId: d.characterId, action: "pick" } as SelectedCharacter))}
                isDraftComplete={currentTeam.length >= teamSize}
                isDraftStarted={true}
                onCharacterSelect={handleCharacterSelect}
                currentPhase={{ team: "test", action: "test" }}
                canBanCharacter={undefined}
            />
        </div>
    );
}
