import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  character: defineTable({
    display_name: v.string(),
    name: v.string(),
    aliases: v.array(v.string()),
    element: v.string(),
    path: v.string(),
    rarity: v.number(),
    cost: v.object({
      memoryofchaos: v.object({
        E0: v.number(),
        E1: v.number(),
        E2: v.number(),
        E3: v.number(),
        E4: v.number(),
        E5: v.number(),
        E6: v.number(),
      }),
      apocalypticshadow: v.object({
        E0: v.number(),
        E1: v.number(),
        E2: v.number(),
        E3: v.number(),
        E4: v.number(),
        E5: v.number(),
        E6: v.number(),
      }),
    }),
    imageUrl: v.optional(v.string()),
  }).searchIndex("search_aliases", {
    searchField: "aliases",
  }),
  
  lightcones: defineTable({
    display_name: v.string(),
    name: v.string(),
    aliases: v.array(v.string()),
    path: v.string(),
    rarity: v.number(),
    cost: v.object({
      S1: v.number(),
      S2: v.number(),
      S3: v.number(),
      S4: v.number(),
      S5: v.number(),
    }),
    imageUrl: v.optional(v.string()),
  }).searchIndex("search_aliases", {
    searchField: "aliases",
  }).searchIndex("search_display_name", {
    searchField: "display_name",
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
