import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CharacterPool } from "./CharacterPool";
import { TeamArea } from "./TeamArea";
import { DraftControls } from "./DraftControls";
import { CostTables } from "./CostTables";
import { DraftProgress } from "./DraftProgress";
import { TeamTest } from "./TeamTest";
import { Contact } from "./Contact";
import { Id } from "../../convex/_generated/dataModel";

export type RuleSet = "memoryofchaos" | "apocalypticshadow";
export type DraftMode = "4ban" | "6ban";
export type CharacterRank = "E0" | "E1" | "E2" | "E3" | "E4" | "E5" | "E6";
export type LightconeRank = "S1" | "S2" | "S3" | "S4" | "S5";

export interface DraftedCharacter {
  characterId: Id<"character">;
  rank: CharacterRank;
  lightconeId?: Id<"lightcones">;
  lightconeRank?: LightconeRank;
}

export interface DraftState {
  blueTeam: {
    name: string;
    drafted: DraftedCharacter[];
    banned: Id<"character">[];
  };
  redTeam: {
    name: string;
    drafted: DraftedCharacter[];
    banned: Id<"character">[];
  };
  currentStep: number;
  ruleSet: RuleSet;
  draftMode: DraftMode;
  history: DraftState[];
}

const DRAFT_ORDERS = {
  "4ban": [
    { team: "blue", action: "ban" },
    { team: "red", action: "ban" },
    { team: "blue", action: "pick" },
    { team: "red", action: "pick" },
    { team: "red", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "blue", action: "ban" },
    { team: "red", action: "ban" },
    { team: "red", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "red", action: "pick" },
    { team: "red", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "red", action: "pick" },
    { team: "red", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "red", action: "pick" },
  ],
  "6ban": [
    { team: "blue", action: "ban" },
    { team: "red", action: "ban" },
    { team: "blue", action: "pick" },
    { team: "red", action: "pick" },
    { team: "red", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "red", action: "ban" },
    { team: "blue", action: "ban" },
    { team: "blue", action: "ban" },
    { team: "red", action: "ban" },
    { team: "red", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "red", action: "pick" },
    { team: "red", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "red", action: "pick" },
    { team: "red", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "blue", action: "pick" },
    { team: "red", action: "pick" },
  ],
};

export function DraftingInterface() {
  const characters = useQuery(api.characters.list) || [];
  const lightcones = useQuery(api.lightcones.list) || [];

  const [draftState, setDraftState] = useState<DraftState>({
    blueTeam: { name: "Blue Team", drafted: [], banned: [] },
    redTeam: { name: "Red Team", drafted: [], banned: [] },
    currentStep: 0,
    ruleSet: "memoryofchaos",
    draftMode: "4ban",
    history: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"draft" | "costs" | "teamtest" | "contact">("draft");

  const currentDraftOrder = DRAFT_ORDERS[draftState.draftMode];
  const currentPhase = currentDraftOrder[draftState.currentStep];
  const isDraftComplete = draftState.currentStep >= currentDraftOrder.length;

  const getAllSelectedCharacters = () => {
    return [
      ...draftState.blueTeam.drafted.map(d => d.characterId),
      ...draftState.redTeam.drafted.map(d => d.characterId),
      ...draftState.blueTeam.banned,
      ...draftState.redTeam.banned,
    ];
  };

  const preserveLightconeSelections = (prevTeam: any, currentTeam: any) => {
    return {
      ...prevTeam,
      drafted: prevTeam.drafted.map((prevChar: any, index: number) => {
        const currentChar = currentTeam.drafted[index];
        if (currentChar && currentChar.characterId === prevChar.characterId) {
          return {
            ...prevChar,
            lightconeId: currentChar.lightconeId,
            lightconeRank: currentChar.lightconeRank,
          };
        }
        return prevChar;
      }),
    };
  };

  const filteredCharacters = characters.filter(char => {
    if (!searchTerm.trim()) return true;
    return char.aliases.some(alias => 
      alias.toLowerCase().includes(searchTerm.toLowerCase())
    ) || char.display_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCharacterSelect = (characterId: Id<"character">) => {
    if (isDraftComplete || !currentPhase) return;

    // Create a deep copy of the current state for history
    const currentStateForHistory: DraftState = {
      blueTeam: {
        name: draftState.blueTeam.name,
        drafted: [...draftState.blueTeam.drafted.map(d => ({ ...d }))],
        banned: [...draftState.blueTeam.banned],
      },
      redTeam: {
        name: draftState.redTeam.name,
        drafted: [...draftState.redTeam.drafted.map(d => ({ ...d }))],
        banned: [...draftState.redTeam.banned],
      },
      currentStep: draftState.currentStep,
      ruleSet: draftState.ruleSet,
      draftMode: draftState.draftMode,
      history: [...draftState.history],
    };

    const newState = { ...draftState };
    newState.history = [...draftState.history, currentStateForHistory];

    if (currentPhase.action === "ban") {
      if (currentPhase.team === "blue") {
        newState.blueTeam = {
          ...newState.blueTeam,
          banned: [...newState.blueTeam.banned, characterId],
        };
      } else {
        newState.redTeam = {
          ...newState.redTeam,
          banned: [...newState.redTeam.banned, characterId],
        };
      }
    } else {
      const draftedChar: DraftedCharacter = {
        characterId,
        rank: "E0",
      };
      
      if (currentPhase.team === "blue") {
        newState.blueTeam = {
          ...newState.blueTeam,
          drafted: [...newState.blueTeam.drafted, draftedChar],
        };
      } else {
        newState.redTeam = {
          ...newState.redTeam,
          drafted: [...newState.redTeam.drafted, draftedChar],
        };
      }
    }

    newState.currentStep++;
    setDraftState(newState);
  };

  const handleUndo = () => {
    if (draftState.history.length > 0) {
      const previousState = draftState.history[draftState.history.length - 1];
      
      const newState = {
        ...previousState,
        blueTeam: preserveLightconeSelections(previousState.blueTeam, draftState.blueTeam),
        redTeam: preserveLightconeSelections(previousState.redTeam, draftState.redTeam),
      };
      
      setDraftState(newState);
    }
  };

  const handleReset = () => {
    setDraftState({
      blueTeam: { name: "Blue Team", drafted: [], banned: [] },
      redTeam: { name: "Red Team", drafted: [], banned: [] },
      currentStep: 0,
      ruleSet: draftState.ruleSet,
      draftMode: draftState.draftMode,
      history: [],
    });
  };

  const handleTeamNameChange = (team: "blue" | "red", name: string) => {
    setDraftState(prev => ({
      ...prev,
      [team === "blue" ? "blueTeam" : "redTeam"]: {
        ...prev[team === "blue" ? "blueTeam" : "redTeam"],
        name,
      },
    }));
  };

  const handleCharacterUpdate = (
    team: "blue" | "red",
    index: number,
    updates: Partial<DraftedCharacter>
  ) => {
    setDraftState(prev => {
      const teamKey = team === "blue" ? "blueTeam" : "redTeam";
      const newTeam = { ...prev[teamKey] };
      newTeam.drafted = [...newTeam.drafted];
      newTeam.drafted[index] = { ...newTeam.drafted[index], ...updates };
      
      return {
        ...prev,
        [teamKey]: newTeam,
      };
    });
  };

  // Reset search when draft state changes to ensure UI updates
  useEffect(() => {
    // Clear search to refresh character pool display
    if (searchTerm) {
      setSearchTerm("");
    }
  }, [draftState.currentStep]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab("draft")}
            className={`px-6 py-3 font-medium rounded-tl-lg transition-colors ${
              activeTab === "draft"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setActiveTab("teamtest")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "teamtest"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Team Test
          </button>
          <button
            onClick={() => setActiveTab("costs")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "costs"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Cost Tables
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-6 py-3 font-medium rounded-tr-lg transition-colors ${
              activeTab === "contact"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Contact
          </button>
        </div>
      </div>

      {activeTab === "draft" ? (
        <>
          <DraftControls
        draftState={draftState}
        onRuleSetChange={(ruleSet) => setDraftState(prev => ({ ...prev, ruleSet }))}
        onDraftModeChange={(draftMode) => setDraftState(prev => ({ ...prev, draftMode }))}
        onUndo={handleUndo}
        onReset={handleReset}
        currentPhase={currentPhase}
        isDraftComplete={isDraftComplete}
        canUndo={draftState.history.length > 0}
      />

      <DraftProgress
        currentDraftOrder={currentDraftOrder}
        currentStep={draftState.currentStep}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamArea
          team="blue"
          teamData={draftState.blueTeam}
          characters={characters}
          lightcones={lightcones}
          ruleSet={draftState.ruleSet}
          onTeamNameChange={handleTeamNameChange}
          onCharacterUpdate={handleCharacterUpdate}
        />
        <TeamArea
          team="red"
          teamData={draftState.redTeam}
          characters={characters}
          lightcones={lightcones}
          ruleSet={draftState.ruleSet}
          onTeamNameChange={handleTeamNameChange}
          onCharacterUpdate={handleCharacterUpdate}
        />
      </div>

      <CharacterPool
        characters={filteredCharacters}
        selectedCharacters={getAllSelectedCharacters()}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCharacterSelect={handleCharacterSelect}
        currentPhase={currentPhase}
        isDraftComplete={isDraftComplete}
      />
        </>
      ) : activeTab === "teamtest" ? (
        <TeamTest
          characters={characters}
          lightcones={lightcones}
        />
      ) : activeTab === "costs" ? (
        <CostTables
          characters={characters}
          lightcones={lightcones}
        />
      ) : (
        <Contact />
      )}
    </div>
  );
}
