import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { DraftingInterface } from "./Components/DraftingInterface/DraftingInterface";
import { useEffect } from "react";
import "./App.css";

export default function App() {
  const seedCharacters = useMutation(api.characters.seedCharacters);
  const seedLightcones = useMutation(api.lightcones.seedLightcones);
  
  // Get favicon URL from Convex storage
  const faviconUrl = useQuery(api.storage.getStorageUrl, { 
    storageId: "kg26ct6gwrwstmp70xgkk5e3xs7gyp01" as any 
  });

  useEffect(() => {
    // Seed data on app load
    seedCharacters();
    seedLightcones();
  }, [seedCharacters, seedLightcones]);

  // Set favicon when URL is available
  useEffect(() => {
    if (faviconUrl) {
      const favicon = document.getElementById('favicon') as HTMLLinkElement;
      if (favicon) {
        favicon.href = faviconUrl;
      }
    }
  }, [faviconUrl]);

  return (
    <div className="App min-h-screen">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-white">PvP HSR - Draft</h1>
        </div>
      </header>
      
      <main>
        <DraftingInterface />
      </main>
      
      <Toaster />
    </div>
  );
}
