import { Id } from "../../convex/_generated/dataModel";

interface CharacterPoolProps {
  characters: any[];
  selectedCharacters: Id<"character">[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCharacterSelect: (characterId: Id<"character">) => void;
  currentPhase?: { team: string; action: string };
  isDraftComplete: boolean;
  isDraftStarted: boolean;
}

export function CharacterPool({
  characters,
  selectedCharacters,
  searchTerm,
  onSearchChange,
  onCharacterSelect,
  currentPhase,
  isDraftComplete,
  isDraftStarted,
}: CharacterPoolProps) {
  const getCharacterImageUrl = (character: any) => {
    if (character.imageUrl) {
      return character.imageUrl;
    }
    // Fallback to placeholder if no imageUrl
    return `https://via.placeholder.com/100x100/374151/ffffff?text=${encodeURIComponent(
      character.display_name.slice(0, 2)
    )}`;
  };

  const isCharacterSelectable = (characterId: Id<"character">) => {
    return !selectedCharacters.includes(characterId) && !isDraftComplete && currentPhase && isDraftStarted;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Character Pool</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {currentPhase && !isDraftComplete && isDraftStarted && (
            <div className="text-sm text-gray-300">
              <span className={`font-medium ${currentPhase.team === "blue" ? "text-blue-400" : "text-red-400"}`}>
                {currentPhase.team === "blue" ? "Blue Team" : "Red Team"}
              </span>{" "}
              {currentPhase.action}
            </div>
          )}
          {!isDraftStarted && !isDraftComplete && (
            <div className="text-sm text-yellow-400 font-medium">
              Press "Start Draft" to begin
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {characters.map((character) => {
          const isSelected = selectedCharacters.includes(character._id);
          const isSelectable = isCharacterSelectable(character._id);

          const rarityBorderColor = character.rarity === 5 ? "border-amber-400" : character.rarity === 4 ? "border-purple-500" : "border-gray-600";
          const rarityBgGradient = character.rarity === 5 
            ? "bg-gradient-to-b from-[#ad6002] to-[#faa237]" 
            : character.rarity === 4 
              ? "bg-gradient-to-b from-purple-800 to-purple-500" 
              : "bg-gradient-to-b from-gray-700 to-gray-500";

          return (
            <button
              key={character._id}
              onClick={() => isSelectable && onCharacterSelect(character._id)}
              disabled={!isSelectable}
              className={`
                relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                ${isSelected 
                  ? "border-red-500 opacity-50 cursor-not-allowed" 
                  : isSelectable
                    ? `${rarityBorderColor} hover:border-cyan-400 cursor-pointer`
                    : `${rarityBorderColor} opacity-50 cursor-not-allowed`
                }
              `}
            >
              <div className={`absolute inset-0 ${rarityBgGradient}`}></div>
              <img
                src={getCharacterImageUrl(character)}
                alt={character.display_name}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/100x100/374151/ffffff?text=${encodeURIComponent(
                    character.display_name.slice(0, 2)
                  )}`;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate z-20">
                {character.display_name}
              </div>
              {isSelected && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center z-30">
                  <span className="text-white font-bold text-xs">TAKEN</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {characters.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          {searchTerm ? "No characters found matching your search." : "Loading characters..."}
        </div>
      )}
    </div>
  );
}
