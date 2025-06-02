import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const lightcones = await ctx.db.query("lightcones").collect();
    // Only return the fields we actually use
    return lightcones.map(lightcone => ({
      _id: lightcone._id,
      display_name: lightcone.display_name,
      aliases: lightcone.aliases,
      cost: lightcone.cost,
      rarity: lightcone.rarity,
      //imageUrl: lightcone.imageUrl,
    }));
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      const lightcones = await ctx.db.query("lightcones").collect();
      return lightcones.map(lightcone => ({
        _id: lightcone._id,
        display_name: lightcone.display_name,
        aliases: lightcone.aliases,
        cost: lightcone.cost,
        rarity: lightcone.rarity,
        //imageUrl: lightcone.imageUrl,
      }));
    }
    
    // Get all lightcones and filter client-side since search indexes don't work with arrays
    const allLightcones = await ctx.db.query("lightcones").collect();
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
    
    return filteredResults.map(lightcone => ({
      _id: lightcone._id,
      display_name: lightcone.display_name,
      aliases: lightcone.aliases,
      cost: lightcone.cost,
      rarity: lightcone.rarity,
      //imageUrl: lightcone.imageUrl,
    }));
  },
});

export const seedLightcones = mutation({
  args: {},
  handler: async (ctx) => {
    // Data already exists, no need to seed
    return;
  },
});
