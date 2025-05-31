import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lightcones").collect();
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return await ctx.db.query("lightcones").collect();
    }
    
    // Search both aliases and display names
    const aliasResults = await ctx.db
      .query("lightcones")
      .withSearchIndex("search_aliases", (q) => 
        q.search("aliases", args.searchTerm)
      )
      .collect();
    
    const nameResults = await ctx.db
      .query("lightcones")
      .withSearchIndex("search_display_name", (q) => 
        q.search("display_name", args.searchTerm)
      )
      .collect();
    
    // Combine and deduplicate results
    const allResults = [...aliasResults, ...nameResults];
    const uniqueResults = allResults.filter((item, index, self) => 
      index === self.findIndex(t => t._id === item._id)
    );
    
    return uniqueResults;
  },
});

export const seedLightcones = mutation({
  args: {},
  handler: async (ctx) => {
    // Data already exists, no need to seed
    return;
  },
});
