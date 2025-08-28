import { RuleSet } from "@/components/DraftingInterface";
import { toast } from "sonner";
import { Character, CharacterRank, Lightcone, LightconeRank } from "./utils";
import { Id } from "../../convex/_generated/dataModel";

export interface TeamMember {
    characterName: string; // e.g. "ruanmei" - not display_name
    rank: CharacterRank;
    lightconeName?: string; // e.g. "pastselfinmirror" - not display_name
    lightconeRank?: LightconeRank;
}

// Runtime interface with resolved IDs for UI operations
export interface ResolvedTeamMember extends TeamMember {
    characterId: Id<"character">;
    characterDisplayName: string;
    lightconeId?: Id<"lightcones">;
    lightconeDisplayName?: string;
}

export interface Loadout {
    name: string; // Loadout slot's name
    team: TeamMember[];
    notes: string;
}

export const teamSize = 4; // 4 Character slots per loadout
export const loadoutSlots = 3; // 3 loadout save slots

export interface PresetOption {
    name: string; // Preset Team's name
    team: TeamMember[];
}
const presetTeamTemplates: PresetOption[] = [
    {
        name: "Phainon",
        team: [
            { characterName: "phainon", rank: "E0", lightconeName: "thusburnsthedawn", lightconeRank: "S1" },
            { characterName: "cerydra", rank: "E0", lightconeName: "epochetchedingoldenblood", lightconeRank: "S1" },
            { characterName: "sunday", rank: "E0", lightconeName: "agroundedascent", lightconeRank: "S1" },
            { characterName: "bronya", rank: "E0", lightconeName: "butthebattleisntover", lightconeRank: "S1" },
        ]
    },
    {
        name: "Castorice",
        team: [
            { characterName: "castorice", rank: "E0", lightconeName: "makefarewellsmorebeautiful", lightconeRank: "S1" },
            { characterName: "tribbie", rank: "E0", lightconeName: "iftimewereaflower", lightconeRank: "S1" },
            { characterName: "hyacine", rank: "E0", lightconeName: "longmayrainbowsadornthesky", lightconeRank: "S1" },
            { characterName: "trailblaizerremembrance", rank: "E6", lightconeName: "sailingtowardsasecondlife", lightconeRank: "S5" },
        ]
    },
    {
        name: "Saber",
        team: [
            { characterName: "saber", rank: "E0", lightconeName: "athanklesscoronation", lightconeRank: "S1" },
            { characterName: "sunday", rank: "E0", lightconeName: "agroundedascent", lightconeRank: "S1" },
            { characterName: "robin", rank: "E0", lightconeName: "flowingnightglow", lightconeRank: "S1" },
            { characterName: "huohuo", rank: "E0", lightconeName: "nightoffright", lightconeRank: "S1" },
        ]
    },
    {
        name: "Archer",
        team: [
            { characterName: "archer", rank: "E0", lightconeName: "thehellwhereidealsburn", lightconeRank: "S1" },
            { characterName: "sparkle", rank: "E0", lightconeName: "earthlyescapade", lightconeRank: "S1" },
            { characterName: "silverwolf", rank: "E0", lightconeName: "incessantrain", lightconeRank: "S1" },
            { characterName: "gallagher", rank: "E6", lightconeName: "quidproquo", lightconeRank: "S5" },
        ]
    },
    {
        name: "Acheron",
        team: [
            { characterName: "acheron", rank: "E0", lightconeName: "alongthepassingshore", lightconeRank: "S1" },
            { characterName: "cipher", rank: "E0", lightconeName: "liesdanceonthebreeze", lightconeRank: "S1" },
            { characterName: "jiaoqiu", rank: "E0", lightconeName: "thosemanysprings", lightconeRank: "S1" },
            { characterName: "aventurine", rank: "E0", lightconeName: "inherentlyunjustdestiny", lightconeRank: "S1" },
        ]
    },
    {
        name: "Feixiao",
        team: [
            { characterName: "feixiao", rank: "E0", lightconeName: "iventureforthtohunt", lightconeRank: "S1" },
            { characterName: "topaz", rank: "E0", lightconeName: "worrisomeblissful", lightconeRank: "S1" },
            { characterName: "robin", rank: "E0", lightconeName: "flowingnightglow", lightconeRank: "S1" },
            { characterName: "aventurine", rank: "E0", lightconeName: "inherentlyunjustdestiny", lightconeRank: "S1" },
        ]
    },
    {
        name: "Firefly",
        team: [
            { characterName: "firefly", rank: "E0", lightconeName: "whereaboutsshoulddreamsrest", lightconeRank: "S1" },
            { characterName: "tingyunfugue", rank: "E0", lightconeName: "longroadleadshome", lightconeRank: "S1" },
            { characterName: "lingsha", rank: "E0", lightconeName: "scentalonestaystrue", lightconeRank: "S1" },
            { characterName: "ruanmei", rank: "E0", lightconeName: "pastselfinmirror", lightconeRank: "S1" },
        ]
    },
    {
        name: "DoT Kafka",
        team: [
            { characterName: "kafka", rank: "E0", lightconeName: "patienceisallyouneed", lightconeRank: "S1" },
            { characterName: "hysilens", rank: "E0", lightconeName: "whydoestheoceansing", lightconeRank: "S1" },
            { characterName: "blackswan", rank: "E0", lightconeName: "reforgedremembrance", lightconeRank: "S1" },
            { characterName: "huohuo", rank: "E0", lightconeName: "nightoffright", lightconeRank: "S1" },
        ]
    },
    {
        name: "The Herta",
        team: [
            { characterName: "theherta", rank: "E0", lightconeName: "intotheunreachableveil", lightconeRank: "S1" },
            { characterName: "anaxa", rank: "E0", lightconeName: "lifeshouldbecasttoflames", lightconeRank: "S1" },
            { characterName: "tribbie", rank: "E0", lightconeName: "iftimewereaflower", lightconeRank: "S1" },
            { characterName: "lingsha", rank: "E0", lightconeName: "scentalonestaystrue", lightconeRank: "S1" },
        ]
    }
];

class LoadoutManager {
    private static readonly STORAGE_KEY = 'honkai_team_loadouts';
    private static readonly LOADOUT_INDEX_KEY = 'honkai_current_loadout_index';
    private static readonly RULESET_VIEW_KEY = 'honkai_ruleset_view';

    // Resolve names to current database IDs and display names
    public static resolveTeamMember(member: TeamMember, characters: Character[], lightcones: Lightcone[]): ResolvedTeamMember | null {
        const character = characters.find(c => c.name === member.characterName);
        if (!character) {
            console.warn(`Character not found: ${member.characterName}`);
            return null;
        }

        let lightconeId: Id<"lightcones"> | undefined;
        let lightconeDisplayName: string | undefined;
        
        if (member.lightconeName) {
            const lightcone = lightcones.find(l => l.name === member.lightconeName);
            if (lightcone) {
                lightconeId = lightcone._id;
                lightconeDisplayName = lightcone.display_name;
            } else {
                console.warn(`Lightcone not found: ${member.lightconeName}`);
            }
        }

        return {
            ...member,
            characterId: character._id,
            characterDisplayName: character.display_name,
            lightconeId,
            lightconeDisplayName
        };
    }
    public static resolveTeam(team: TeamMember[], characters: Character[], lightcones: Lightcone[]): ResolvedTeamMember[] {
        return team.map(member => this.resolveTeamMember(member, characters, lightcones))
                   .filter((member): member is ResolvedTeamMember => member !== null);
    }

    // Convert resolved member back to storage format
    public static unresolveTeamMember(resolved: ResolvedTeamMember, characters: Character[], lightcones: Lightcone[]): TeamMember {
        const character = characters.find(c => c._id === resolved.characterId);
        const lightcone = resolved.lightconeId ? lightcones.find(l => l._id === resolved.lightconeId) : undefined;
        
        return {
            characterName: character?.name || resolved.characterName,
            rank: resolved.rank,
            lightconeName: lightcone?.name,
            lightconeRank: resolved.lightconeRank
        };
    }

    public static saveLoadouts(loadouts: Loadout[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loadouts));
        } catch (error) {
            toast.error("Failed to save Loadouts");
        }
    }

    public static loadLoadouts(): Loadout[] {
        try {
            const storedTeams = localStorage.getItem(this.STORAGE_KEY);
            return storedTeams ? JSON.parse(storedTeams) : this.getDefaultLoadouts();
        } catch (error) {
            toast.error("Failed to load Loadouts");
            return this.getDefaultLoadouts();
        }
    }

    public static getDefaultLoadouts(): Loadout[] {
        return Array.from({ length: loadoutSlots })
            .map((_, index) => (
                { name: `Team ${index + 1}`, team: [], notes: "" }
            )
        );
    }

    public static clearAllLoadouts(): void {
        const defaultLoadouts = this.getDefaultLoadouts();
        this.saveLoadouts(defaultLoadouts);
    }

    public static saveCurrentLoadoutIndex(index: number): void {
        if (index < 0 || index >= loadoutSlots) return;
        
        try {
            localStorage.setItem(this.LOADOUT_INDEX_KEY, index.toString());
        } catch (error) {
            toast.error("Failed to save current loadout index");
        }
    }

    public static loadCurrentLoadoutIndex(): number {
        try {
            const stored = localStorage.getItem(this.LOADOUT_INDEX_KEY);
            const index = stored ? parseInt(stored, 10) : 0;
            return (index >= 0 && index < loadoutSlots) ? index : 0;
        } catch (error) {
            return 0;
        }
    }

    public static saveRulesetView(ruleSet: RuleSet): void {
        try {
            localStorage.setItem(this.RULESET_VIEW_KEY, ruleSet);
        } catch (error) {
            toast.error("Failed to save ruleset view");
        }
    }

    public static loadRulesetView(): RuleSet {
        try {
            const stored = localStorage.getItem(this.RULESET_VIEW_KEY);
            return (stored as RuleSet) || "apocalypticshadow";
        } catch (error) {
            return "apocalypticshadow";
        }
    }

    public static getPresetTeams(): PresetOption[] {
        return presetTeamTemplates;
    }
}

export default LoadoutManager;