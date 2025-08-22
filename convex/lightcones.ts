import { Lightcone, LightconeCost, Path, Rarity } from "../src/lib/utils";
import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const mapToLightcone = (character: any): Lightcone => ({
    _id: (character._id as Id<"lightcones">),
    display_name: (character.display_name as string),
    aliases: (character.aliases as string[]),
    path: (character.path as Path),
    cost: (character.cost as LightconeCost),
    rarity: (character.rarity as Rarity),
    // imageUrl: (character.imageUrl as string | undefined),
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const lightcones = await ctx.db.query("lightcones").collect();
        // Only return the fields we actually use
        return lightcones.map(mapToLightcone);
    },
});

export const search = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        if (!args.searchTerm.trim()) {
            const lightcones = await ctx.db.query("lightcones").collect();
            return lightcones.map(mapToLightcone);
        }
        
        // Get all lightcones and filter client-side since search indexes don't work with arrays
        const allLightcones = (await ctx.db.query("lightcones").collect());
        const searchTermLower = args.searchTerm.toLowerCase();
        
        const filteredResults = allLightcones.filter(lightcone => {
            // Search in display name
            if (lightcone.display_name.toLowerCase().includes(searchTermLower)) {
                return true;
            }
            
            // Search in aliases array
            return lightcone.aliases.some(alias => 
                alias.toLowerCase().includes(searchTermLower)
            );
        });
        
        return filteredResults.map(mapToLightcone);
    },
});

export const seedLightcones = mutation({
    args: {},
    handler: async (ctx) => {
        // Data already exists, no need to seed
        return;
    },
});
