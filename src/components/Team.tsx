import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTeam, removeFromTeam } from "../utils/team";
import { Trash2, ShieldQuestion, ArrowLeft } from "lucide-react"; 
import "../App.css"

interface PokemonTeamItem {
  id: number;
  name: string;
  image: string;
  types: string[];
}

const typeColors: Record<string, string> = {
  grass: "bg-green-600", 
  poison: "bg-purple-600",
  fire: "bg-orange-600",
  water: "bg-blue-600",
  electric: "bg-yellow-500 text-black",
  bug: "bg-lime-600",
  normal: "bg-zinc-500",
  ground: "bg-amber-700",
  fairy: "bg-pink-500",
  fighting: "bg-red-700",
  psychic: "bg-pink-600",
  rock: "bg-stone-600",
  ghost: "bg-indigo-800",
  ice: "bg-cyan-500",
  dragon: "bg-indigo-700",
};

export const Team = () => {
  const [team, setTeam] = useState<PokemonTeamItem[]>(() => getTeam());
  const navigate = useNavigate();

  useEffect(() => {
    const listener = () => setTeam(getTeam());
    window.addEventListener("teamUpdated", listener);
    return () => window.removeEventListener("teamUpdated", listener);
  }, []);

  const handleRemove = (id: number) => {
    removeFromTeam(id);
    window.dispatchEvent(new Event("teamUpdated")); // Dispatch event เมื่อลบ
  };

  if (team.length === 0) {
    return (
      <div className="font-pixel min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 p-4">
        <div className="bg-zinc-900 p-6 rounded-full mb-6 border border-zinc-800 animate-pulse">
          <ShieldQuestion size={48} className="text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Your team is still empty!
        </h2>
        <p className="mb-8 text-center">
          You need at least one Pokémon to start your adventure.
        </p>
        <Link
          to="/pokemon"
          className="bg-[#7fff00] text-black px-6 py-3 rounded-full font-bold hover:bg-[#ffff00] transition-colors shadow-lg shadow-blue-500/20"
        >
          Let's go catch some Pokémon!
        </Link>
      </div>
    );
  }

  return (
    <div className="font-pixel min-h-screen bg-black text-white p-6 md:p-12 relative">
      
      <button
          onClick={() => navigate("/pokemon")}
          className="absolute top-6 left-6 text-sm text-zinc-400 hover:text-white hover:underline z-50 cursor-pointer bg-black/50 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back to List
      </button>

      <div className="max-w-6xl mx-auto mt-10">
        
        <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight">
          Member <span className="text-[#7fff00] text-2xl">({team.length}/6)</span>
        </h1>

      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((p) => (
            
            <div
              key={p.id}
              className="group relative rounded-3xl border border-[#7fff00] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#ffff00]"
            >
            
              <button
                onClick={() => {
                  // e.preventDefault();
                  // e.stopPropagation(); 
                  handleRemove(p.id);
                }}
                className="absolute top-4 right-4 p-2 bg-zinc-800 text-zinc-400 rounded-full hover:bg-red-600 hover:text-white transition-all z-20 opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Remove from team"
              >
                <Trash2 size={18} />
              </button>

              <Link
                to={`/pokemon/${p.name}`}
                className="flex flex-col items-center w-full relative z-10"
              >
               
                <div className="relative w-full flex justify-center items-center mb-4">
                  
                 
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-40 h-40 object-contain relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-transform group-hover:-translate-y-2"
                  />
                </div>

                <h3 className="text-2xl font-bold capitalize mb-3">{p.name}</h3>

                {/* Types Badges */}
                <div className="flex gap-2">
                  {p.types.map((t) => (
                    <span
                      key={t}
                      className={`${
                        typeColors[t] || "bg-zinc-600"
                      } text-white text-xs font-bold px-3 py-1 rounded-full capitalize shadow-sm`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};