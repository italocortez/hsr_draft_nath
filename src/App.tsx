import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { DraftingInterface } from "./components/DraftingInterface";
import { useEffect } from "react";

export default function App() {
  const seedCharacters = useMutation(api.characters.seedCharacters);
  const seedLightcones = useMutation(api.lightcones.seedLightcones);

  useEffect(() => {
    // Seed data on app load
    seedCharacters();
    seedLightcones();
  }, [seedCharacters, seedLightcones]);

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-white">Star Rail Draft</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4">
        <DraftingInterface />
      </main>
      <Toaster />
    </div>
  );
}
