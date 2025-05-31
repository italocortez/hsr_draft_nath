import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { LightconeRank } from "./DraftingInterface";

interface LightconeSelectorProps {
  lightcones: any[];
  selectedLightconeId?: Id<"lightcones">;
  selectedRank?: LightconeRank;
  onLightconeChange: (lightconeId?: Id<"lightcones">, rank?: LightconeRank) => void;
}

export function LightconeSelector({
  lightcones,
  selectedLightconeId,
  selectedRank,
  onLightconeChange,
}: LightconeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchResults = useQuery(
    api.lightcones.search, 
    searchTerm.trim() ? { searchTerm } : "skip"
  ) || [];

  // Use search results when there's a search term, otherwise show all lightcones
  const filteredLightcones = searchTerm.trim() 
    ? searchResults 
    : lightcones;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLightcone = selectedLightconeId 
    ? lightcones.find(l => l._id === selectedLightconeId)
    : null;

  const handleLightconeSelect = (lightconeId: Id<"lightcones">) => {
    onLightconeChange(lightconeId, selectedRank || "S1");
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleRemoveLightcone = () => {
    onLightconeChange(undefined, undefined);
  };

  return (
    <div className="space-y-1">
      {selectedLightcone ? (
        <div className="space-y-1">
          <div className="bg-gray-600 rounded p-2 text-xs">
            <div className="flex justify-between items-start gap-2">
              <span className="text-white flex-1 break-words leading-tight">{selectedLightcone.display_name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-amber-400">{selectedLightcone.cost[selectedRank || "S1"]}</span>
                <button
                  onClick={handleRemoveLightcone}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <select
            value={selectedRank || "S1"}
            onChange={(e) => onLightconeChange(selectedLightconeId, e.target.value as LightconeRank)}
            className="w-full bg-gray-700 text-white text-xs border border-gray-600 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            {(["S1", "S2", "S3", "S4", "S5"] as LightconeRank[]).map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search lightcone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-gray-700 text-white text-xs border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto z-10">
              {filteredLightcones.slice(0, 20).map((lightcone) => (
                <button
                  key={lightcone._id}
                  onClick={() => handleLightconeSelect(lightcone._id)}
                  className="w-full text-left px-2 py-1 text-xs text-white hover:bg-gray-600 flex justify-between items-start gap-2"
                >
                  <span className="break-words leading-tight flex-1">{lightcone.display_name}</span>
                  <span className="text-amber-400 flex-shrink-0">{lightcone.cost.S1}</span>
                </button>
              ))}
              {filteredLightcones.length === 0 && searchTerm && (
                <div className="px-2 py-1 text-xs text-gray-400">No lightcones found</div>
              )}
              {filteredLightcones.length === 0 && !searchTerm && (
                <div className="px-2 py-1 text-xs text-gray-400">Start typing to search...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
