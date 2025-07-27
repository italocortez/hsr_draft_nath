import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { LightconeRank } from "./DraftingInterface";
import { api } from "../../convex/_generated/api";
import "../css/LightconeSelector.css";

interface LightconeSelectorProps {
  lightcones: any[];
  selectedLightconeId?: Id<"lightcones">;
  selectedRank?: LightconeRank;
  onLightconeChange: (lightconeId?: Id<"lightcones">, rank?: LightconeRank) => void;
}

export function UNUSED_LightconeSelector({
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
    <div className="LightconeSelector">
        {selectedLightcone ? <>
            {/* Lightcone (selected) */}
            <div className="lightcone bg-gray-600 rounded">
                {/* Label */}
                <span className="lc-name">{selectedLightcone.display_name}</span>
                
                <div className="lc-info">
                    {/* Cost */}
                    <span className="cost">{selectedLightcone.cost[selectedRank || "S1"]}</span>
                    
                    {/* Clear button */}
                    <button
                        onClick={handleRemoveLightcone}
                        className="text-red-400 hover:text-red-300"
                    >
                        X
                    </button>
                </div>
            </div>

            {/* Super Imposition */}
            <select
                value={selectedRank || "S1"}
                onChange={(e) => onLightconeChange(selectedLightconeId, e.target.value as LightconeRank)}
                className="imposition bg-gray-700 border border-gray-600 focus:outline-none"
                >
                {(["S1", "S2", "S3", "S4", "S5"] as LightconeRank[]).map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                ))}
            </select>
        </> : <>
            <div className="lightcone-search" ref={dropdownRef}>
                <input
                    type="text"
                    placeholder="Search lightcone..."
                    value={searchTerm}
                    onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="lc-input bg-gray-700 border border-gray-600 rounded px-2 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                
                {isOpen && (
                    <div className="result-set absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto z-50">
                        {filteredLightcones.slice(0, 20).map((lightcone) => (
                            <button
                                key={lightcone._id}
                                onClick={() => handleLightconeSelect(lightcone._id)}
                                className="result w-full text-left text-xs hover:bg-gray-600"
                            >
                                <span className="lc-name break-words leading-tight flex-1">{lightcone.display_name}</span>
                                <span className="cost text-amber-400 flex-shrink-0">{lightcone.cost.S1}</span>
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
        </>}
    </div>
  );
}
