import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast, Toaster } from "sonner";
import { DraftedCharacter, DraftingInterface } from "./components/DraftingInterface";
import { useEffect, useState } from "react";
import "./App.css";
import { TeamTest } from "./components/TeamTest";
import { CostTables } from "./components/CostTables";
import { Contact } from "./components/Contact";
import { Tutorial } from "./components/Tutorial";
import { Character, Lightcone } from "./lib/utils";

type Tab = "draft" | "teamtest" | "costs" | "tutorial" | "contact";

const ScrollToTopIcon: React.FC = () => (
    <svg 
        width="clamp(1.625rem, 3vw, 2.125rem)" 
        height="clamp(1.625rem, 3vw, 2.125rem)" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path 
            d="M12 19V5M5 12L12 5L19 12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);

export default function App() {
    const seedCharacters = useMutation(api.characters.seedCharacters);
    const seedLightcones = useMutation(api.lightcones.seedLightcones);
    const characters: Character[] = useQuery(api.characters.list) || [];
    const lightcones: Lightcone[] = useQuery(api.lightcones.list) || [];

    const [activeTab, setActiveTab] = useState<Tab>("draft");
    const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
  
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

    // Handle scroll to top button visibility
    useEffect(() => {
        const handleScroll = () => {
            const scrollPercentage = 0.33; // % of Page
            const maximumScrollDistance = 2400; // x maximum pixels required to scroll
            
            // Reveal button after scrolling down 30% of document height OR 2400px, whichever is smaller
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percentageThreshold = totalHeight * scrollPercentage;
            const scrollThreshold = Math.min(percentageThreshold, maximumScrollDistance);
            
            setShowScrollToTop(window.scrollY > scrollThreshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
                        {`Loadouts`}
                    </button>
                    <button
                        onClick={_ => setActiveTab("costs" as Tab)}
                        className={(activeTab === "costs") ? `active` : undefined}
                    >
                        {`Costs`}
                    </button>
                    <button
                        onClick={_ => setActiveTab("tutorial" as Tab)}
                        className={(activeTab === "tutorial") ? `active` : undefined}
                    >
                        {`Tutorial`}
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
                    />
                )}

                {activeTab === "costs" && (
                    <CostTables 
                        characters={characters} 
                        lightcones={lightcones} 
                    />
                )}

                {activeTab === "tutorial" && (
                    <Tutorial />
                )}

                {activeTab === "contact" && (
                    <Contact />
                )}
            </main>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`scroll-button ${showScrollToTop ? `visible` : ``}`}
                title="Scroll to Start"
            >
                <ScrollToTopIcon />
            </button>

            {/* Notifications Enabler */}
            <Toaster 
                position="top-left" 
                richColors
                toastOptions={{
                    style: {
                        fontSize: `1rem`
                    }
                }}
            />
        </div>
    );
}