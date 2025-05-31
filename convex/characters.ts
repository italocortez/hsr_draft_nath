import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("character").collect();
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return await ctx.db.query("character").collect();
    }
    
    const results = await ctx.db
      .query("character")
      .withSearchIndex("search_aliases", (q) => 
        q.search("aliases", args.searchTerm)
      )
      .collect();
    
    return results;
  },
});

export const seedCharacters = mutation({
  args: {},
  handler: async (ctx) => {
    // Data already exists, no need to seed
    return;
  },
});
