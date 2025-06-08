import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const characters = await ctx.db.query("character").collect();
    // Only return the fields we actually use
    return characters.map(character => ({
      _id: character._id,
      display_name: character.display_name,
      aliases: character.aliases,
      element: character.element,
      path: character.path,
      rarity: character.rarity,
      role: character.role,
      cost: character.cost,
      imageUrl: character.imageUrl,
    }));
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      const characters = await ctx.db.query("character").collect();
      return characters.map(character => ({
        _id: character._id,
        display_name: character.display_name,
        aliases: character.aliases,
        element: character.element,
        path: character.path,
        rarity: character.rarity,
        role: character.role,
        cost: character.cost,
        imageUrl: character.imageUrl,
      }));
    }
    
    const results = await ctx.db
      .query("character")
      .withSearchIndex("search_aliases", (q) => 
        q.search("aliases", args.searchTerm)
      )
      .collect();
    
    return results.map(character => ({
      _id: character._id,
      display_name: character.display_name,
      aliases: character.aliases,
      element: character.element,
      path: character.path,
      rarity: character.rarity,
      role: character.role,
      cost: character.cost,
      imageUrl: character.imageUrl,
    }));
  },
});

export const seedCharacters = mutation({
  args: {},
  handler: async (ctx) => {
    // Data already exists, no need to seed
    return;
  },
});
