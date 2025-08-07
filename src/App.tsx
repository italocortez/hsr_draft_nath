import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { DraftedCharacter, DraftingInterface } from "./components/DraftingInterface";
import { useEffect, useState } from "react";
import "./App.css";
import { TeamTest } from "./components/TeamTest";
import { CostTables } from "./components/CostTables";
import { Contact } from "./components/Contact";

type Tab = "draft" | "teamtest" | "costs" | "contact";

export default function App() {
    const seedCharacters = useMutation(api.characters.seedCharacters);
    const seedLightcones = useMutation(api.lightcones.seedLightcones);
    const characters = useQuery(api.characters.list) || [];
    const lightcones = useQuery(api.lightcones.list) || [];

    const [activeTab, setActiveTab] = useState<Tab>("draft");
    const [testTeam, setTestTeam] = useState<DraftedCharacter[]>([]);
  
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
        <div className="App">
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <h1 className="text-xl font-bold text-white">PvP HSR - Draft</h1>
                </div>
            </header>

            <main>
                {/* Tab Navigation */}
                <div className="tabs Box">
                    <button
                        onClick={_ => setActiveTab("draft" as Tab)}
                        className={(activeTab === "draft") ? `active` : undefined}
                    >
                        {`Draft`}
                    </button>
                    <button
                        onClick={_ => setActiveTab("teamtest" as Tab)}
                        className={(activeTab === "teamtest") ? `active` : undefined}
                    >
                        {`Team Test`}
                    </button>
                    <button
                        onClick={_ => setActiveTab("costs" as Tab)}
                        className={(activeTab === "costs") ? `active` : undefined}
                    >
                        {`Costs Table`}
                    </button>
                    <button
                        onClick={_ => setActiveTab("contact" as Tab)}
                        className={(activeTab === "contact") ? `active` : undefined}
                    >
                        {`Contact`}
                    </button>
                </div>

                {/* NEVER UNMOUNT DraftingInteface - Wipes DraftState */}
                <DraftingInterface 
                    characters={characters} 
                    lightcones={lightcones} 
                    isVisible={activeTab === "draft"}
                />

                {activeTab === "teamtest" && (
                    <TeamTest 
                        characters={characters} 
                        lightcones={lightcones} 
                        teamState={{ testTeam, setTestTeam }}
                    />
                )}

                {activeTab === "costs" && (
                    <CostTables 
                        characters={characters} 
                        lightcones={lightcones} 
                    />
                )}

                {activeTab === "contact" && (
                    <Contact />
                )}
            </main>

            <Toaster />
        </div>
    );
}
