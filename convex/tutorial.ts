import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tutorials = await ctx.db
      .query("tutorial")
      .withIndex("by_step_order")
      .order("asc")
      .collect();

    return Promise.all(
      tutorials.map(async (tutorial) => {
        let imageUrl = null;
        if (tutorial.reference_img) {
          if (typeof tutorial.reference_img === 'string') {
            // If it's already a URL string, use it directly
            imageUrl = tutorial.reference_img;
          } else {
            // If it's a storage ID, get the URL from storage
            imageUrl = await ctx.storage.getUrl(tutorial.reference_img);
          }
        }
        return {
          ...tutorial,
          imageUrl,
        };
      })
    );
  },
});

export const seedTutorial = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if tutorial data already exists
    const existing = await ctx.db.query("tutorial").first();
    if (existing) {
      return { message: "Tutorial data already exists" };
    }

    // Sample tutorial data
    const tutorialSteps = [
      {
        step_order: 1,
        step_name: "Getting Started",
        step_explanation: [
          "Welcome to the PvP HSR Draft tool!",
          "This application helps you draft teams for Honkai Star Rail PvP battles.",
          "Navigate through the different tabs to explore all features."
        ],
      },
      {
        step_order: 2,
        step_name: "Draft Interface",
        step_explanation: [
          "The Draft tab is where the main action happens.",
          "You can select characters and lightcones for your team composition.",
          "Use the timer and controls to manage your draft session."
        ],
      },
      {
        step_order: 3,
        step_name: "Team Testing",
        step_explanation: [
          "The Team Test tab allows you to experiment with different team compositions.",
          "You can test various combinations without affecting your main draft.",
          "This is perfect for theory-crafting and planning strategies."
        ],
      },
      {
        step_order: 4,
        step_name: "Cost Analysis",
        step_explanation: [
          "The Costs Table provides detailed information about character and lightcone costs.",
          "Use this data to make informed decisions during your draft.",
          "Different eidolon levels and superimposition levels have varying costs."
        ],
      },
    ];

    // Insert tutorial steps
    for (const step of tutorialSteps) {
      await ctx.db.insert("tutorial", step);
    }

    return { message: "Tutorial data seeded successfully" };
  },
});
