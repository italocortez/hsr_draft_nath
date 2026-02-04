import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast, Toaster } from "sonner";
import { DraftedCharacter, DraftingInterface } from "./components/DraftingInterface";
import { useEffect, useState } from "react";
import "./App.css";
import { TeamTest } from "./components/TeamTest";
import { CostTables } from "./components/CostTables";
import { Tutorial } from "./components/Tutorial";
import { LandingPage } from "./components/LandingPage";
import { Character, Lightcone, Pairing } from "./lib/utils";
import { Header, Tab } from "./components/Header";

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
  const pairings: Pairing[] = useQuery(api.characters.getPairings) || [];
  const lightcones: Lightcone[] = useQuery(api.lightcones.list) || [];

  const [activeTab, setActiveTab] = useState<Tab>("landing");
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
            const scrollPercentage = 0.25; // % of Page
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

    // Scroll to the top when changing tab
    useEffect(() => {
        scrollToTop();
    }, [activeTab]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleNavigate = (tab: string) => setActiveTab(tab as Tab);

    return (
        <div className="App">
            {activeTab === "landing" ? (
                <LandingPage onNavigate={handleNavigate} />
            ) : (
                <>
                    <header>
                        <Header 
                            activeTab={activeTab}
                            onTabChange={handleNavigate}
                        />
                    </header>

                    <main>
                        {/* NEVER UNMOUNT DraftingInteface - Wipes DraftState */}
                        <DraftingInterface 
                            characters={characters} 
                            pairings={pairings}
                            lightcones={lightcones} 
                            isVisible={activeTab === "draft"}
                        />

                        {activeTab === "teamtest" && (
                            <TeamTest 
                                characters={characters} 
                                pairings={pairings}
                                lightcones={lightcones} 
                            />
                        )}

                        {activeTab === "costs" && (
                            <CostTables 
                                characters={characters} 
                                pairings={pairings}
                                lightcones={lightcones} 
                            />
                        )}

                        {activeTab === "tutorial" && (
                            <Tutorial />
                        )}
                    </main>
                </>
            )}

            {/* Scroll to Top Button - only show when not on landing page */}
            {activeTab !== "landing" && (
                <button
                    onClick={scrollToTop}
                    className={`scroll-button ${showScrollToTop ? `visible` : ``}`}
                    title="Scroll to Start"
                >
                    <ScrollToTopIcon />
                </button>
            )}

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
