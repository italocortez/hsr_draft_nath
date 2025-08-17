import { DraftedCharacter } from "@/components/DraftingInterface";
import { toast } from "sonner";

export interface Loadout {
    team: DraftedCharacter[];
    name: string; // Slot name
    notes: string;
}

export const teamSize = 4; // 4 Character slots
export const loadoutSlots = 3; // 3 loadout slots

class LoadoutManager {
    private static readonly STORAGE_KEY = 'honkai_team_loadouts';
    private static readonly LOADOUT_INDEX_KEY = 'honkai_current_loadout_index';

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
}

export default LoadoutManager;