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
		role: v.string(),
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
  }).searchIndex("search_display_name", {
    searchField: "display_name",
  }),

  icons: defineTable({
    name: v.string(),
    imageUrl: v.string(),
    type: v.optional(v.string()),
  }).index("by_name", ["name"]),

  tutorial: defineTable({
    step_order: v.number(),
    step_name: v.string(),
    step_explanation: v.array(v.string()),
    reference_img: v.optional(v.union(v.id("_storage"), v.string())),
  }).index("by_step_order", ["step_order"]),

  pairing: defineTable({
    source: v.string(),
    pair_target: v.string(),
    cost: v.object({
      memoryofchaos: v.number(),
      apocalypticshadow: v.number(),
    }),
  }).index("by_source", ["source"])
    .index("by_pair_target", ["pair_target"])
    .index("by_source_and_target", ["source", "pair_target"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
