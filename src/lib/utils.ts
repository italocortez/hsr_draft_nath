import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Id } from "../../convex/_generated/dataModel";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Team = "blue" | "red" | "test"; // test used in TeamTest
export type Action = "pick" | "ban" | "test"; // test used in TeamTest
export type Turn = { team: Team, action: Action };

export const Eidolons = [ "E0", "E1", "E2", "E3", "E4", "E5", "E6" ] as const;
export type CharacterRank = typeof Eidolons[number];

export const SuperImpositions = [ "S1", "S2", "S3", "S4", "S5" ] as const;
export type LightconeRank = typeof SuperImpositions[number];

export const UniqueElements = [ "fire", "ice", "imaginary", "lightning", "physical", "quantum", "wind" ] as const;
export type Element = typeof UniqueElements[number];

export const UniquePaths = [ "abundance", "destruction", "erudition", "harmony", "hunt", "nihility", "preservation", "remembrance" ] as const;
export type Path = typeof UniquePaths[number];

export const UniqueRoles = [ "dps", "support", "sustain" ] as const;
export type Role = typeof UniqueRoles[number];

export type Rarity = 3 | 4 | 5;

export type CharacterCost = {
    memoryofchaos: { E0: number, E1: number, E2: number, E3: number, E4: number, E5: number, E6: number },
    apocalypticshadow: { E0: number, E1: number, E2: number, E3: number, E4: number, E5: number, E6: number },
}
export type LightconeCost = { S1: number, S2: number, S3: number, S4: number, S5: number };

export interface Character {
    _id: Id<"character">;
    name: string; // ruanmei
    display_name: string; // Ruan Mei
    aliases: string[];
    element: Element;
    path: Path;
    rarity: Rarity;
    role: Role;
    cost: CharacterCost;
    imageUrl?: string | undefined;
}
export interface Lightcone {
    _id: Id<"lightcones">;
    name: string; // agroundedascent
    display_name: string; // A Grounded Ascent
    aliases: string[];
    path: Path;
    cost: LightconeCost;
    rarity: Rarity;
    imageUrl?: string | undefined;
}
