import { Character, CharacterCost, Element, Path, Rarity, Role, LightconeRank, SuperImpositions } from "../src/lib/utils";
import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const mapToCharacter = (character: any): Character => ({
    _id: (character._id as Id<"character">),
    display_name: (character.display_name as string),
    aliases: (character.aliases as string[]),
    element: (character.element as Element),
    path: (character.path as Path),
    rarity: (character.rarity as Rarity),
    role: (character.role as Role),
    cost: (character.cost as CharacterCost),
    imageUrl: (character.imageUrl as string | undefined),
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const characters = await ctx.db.query("character").collect();
        // Only return the fields we actually use
        return characters.map(mapToCharacter);
    },
});

export const search = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        if (!args.searchTerm.trim()) {
            const characters = await ctx.db.query("character").collect();
            return characters.map(mapToCharacter);
        }
        
        const results = await ctx.db
            .query("character")
            .withSearchIndex("search_aliases", (q) => q.search("aliases", args.searchTerm))
            .collect();
        return results.map(mapToCharacter);
    },
});

export const seedCharacters = mutation({
    args: {},
    handler: async (ctx) => {
        // Data already exists, no need to seed
        return;
    },
});
