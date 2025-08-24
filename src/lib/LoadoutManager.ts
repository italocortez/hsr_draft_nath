import { DraftedCharacter, RuleSet } from "@/components/DraftingInterface";
import { toast } from "sonner";
import { Character, CharacterRank, Lightcone, LightconeRank } from "./utils";
import { Id } from "../../convex/_generated/dataModel";

export interface LoadoutCharacter {
    characterId: Id<"character">;
    characterName: string;
    rank: CharacterRank;

    lightconeId?: Id<"lightcones">;
    lightconeName?: string;
    lightconeRank?: LightconeRank;
}

export interface Loadout {
    team: LoadoutCharacter[];
    name: string; // Slot name
    notes: string;
}

export const teamSize = 4; // 4 Character slots
export const loadoutSlots = 3; // 3 loadout slots

class LoadoutManager {
    private static readonly STORAGE_KEY = 'honkai_team_loadouts';
    private static readonly LOADOUT_INDEX_KEY = 'honkai_current_loadout_index';
    private static readonly RULESET_VIEW_KEY = 'honkai_ruleset_view';

    // Save all Loadouts state
    public static saveLoadouts(loadouts: Loadout[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loadouts));
        } catch (error) {
            toast.error("Failed to save Loadouts");
        }
    }

    // PUll saved Loadouts from localStorage
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
        return [
            { name: "Team 1", team: [], notes: "" },
            { name: "Team 2", team: [], notes: "" },
            { name: "Team 3", team: [], notes: "" }
        ];
    }

    // Save a specific state to localStorage
    public static saveLoadout(index: number, loadout: Loadout): void {
        if (index < 0 || index >= loadoutSlots) {
            toast.error(`'${index}' Invalid Loadout index`);
            return;
        }

        const loadouts = this.loadLoadouts();
        loadouts[index] = { ...loadout };
        this.saveLoadouts(loadouts);
    }

    // Clear a specific state in localStorage from loadout slot
    public static clearLoadout(index: number): void {
        if (index < 0 || index >= loadoutSlots) {
            toast.error(`'${index}' Invalid Loadout index`);
            return;
        }

        const loadouts = this.loadLoadouts();
        loadouts[index] = { ...loadouts[index], team: [] };
        this.saveLoadouts(loadouts);
    }

    // Clear all Loadouts in localStorage to default values
    public static clearAllLoadouts(): void {
        try {
            const defaultLoadouts = this.getDefaultLoadouts();
            this.saveLoadouts(defaultLoadouts);
        } catch (error) {
            toast.error("Failed to clear all Loadouts");
        }
    }

    // Get one Loadout by index
    public static getLoadout(index: number): Loadout {
        if (index < 0 || index >= loadoutSlots) {
            toast.error(`'${index}' Invalid Loadout index`);
            throw new Error();
        }

        const loadouts = this.loadLoadouts();
        return loadouts[index] || null;
    }

    public static refreshLoadoutIds(characters: Character[], lightcones: Lightcone[]): void {
        if (!characters || !lightcones) {
            toast.error(`Invalid characters/lightcones array`);
            throw new Error();
        }

        const loadouts = this.loadLoadouts();
        for (let i = 0; i < loadouts.length; i++) {
            const currLoadout = loadouts[i];
            for (let j = 0; j < currLoadout.team.length; j++) {
                const currCharacter = currLoadout.team[j];

                const characterDb: Character | undefined = characters.find(c => c.name === currCharacter.characterName);
                if (characterDb && currCharacter.characterId !== characterDb?._id) {
                    currLoadout.team = [ ...currLoadout.team, { ...currCharacter, characterId: characterDb?._id } ];
                }

                if (currCharacter.lightconeName) {
                    const lightconeDb: Lightcone | undefined = lightcones.find(l => l.name === currCharacter.lightconeName);
                    if (lightconeDb && currCharacter.lightconeId !== lightconeDb?._id) {
                        currLoadout.team = [ ...currLoadout.team, { ...currCharacter, lightconeId: lightconeDb?._id } ];
                    }
                }
            }
        }
        
        this.saveLoadouts(loadouts);
    }

    // Remember the last Loadout slot worked on
    // setLatestTeamIndex
    public static saveCurrentLoadoutIndex(index: number): void {
        if (index < 0 || index >= loadoutSlots) {
            toast.error(`'${index}' Invalid Loadout index`);
            return;
        }

        try {
            localStorage.setItem(this.LOADOUT_INDEX_KEY, index.toString());
        } catch (error) {
            toast.error(`Failed to save current Loadout's index`);
        }
    }

    // Load on startup the last Loadout slot worked on
    // getLatestTeamIndex
    public static loadCurrentLoadoutIndex(): number {
        try {
            const stored = localStorage.getItem(this.LOADOUT_INDEX_KEY);
            const index = stored ? parseInt(stored, 10) : 0;

            return (index >= 0 && index < loadoutSlots) ? index : 0;
        } catch (error) {
            toast.error(`Failed to load current Loadout's index`);
            return 0;
        }
    }

    // Load on startup the last viewed ruleset
    public static getLatestRulesetView(): RuleSet {
        try {
            const stored = localStorage.getItem(this.RULESET_VIEW_KEY);
            const ruleSet: RuleSet = (stored ? stored : "apocalypticshadow") as RuleSet;

            return ruleSet;
        } catch (error) {
            toast.error(`Failed to load current RuleSet view`);
            return ("apocalypticshadow" as RuleSet);
        }
    }

    public static setLatestRulesetView(ruleSet: RuleSet): void {
        if (!ruleSet) {
            toast.error(`'${ruleSet}' Invalid RuleSet`);
            return;
        }

        try {
            localStorage.setItem(this.RULESET_VIEW_KEY, ruleSet);
        } catch (error) {
            toast.error(`Failed to save current RuleSet view`);
        }
    }
}

export default LoadoutManager;