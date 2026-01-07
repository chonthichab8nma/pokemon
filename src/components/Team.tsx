import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTeam, removeFromTeam } from "../utils/team";

interface PokemonTeamItem {
  id: number;
  name: string;
  image: string;
  types: string[];
}

const typeColors: Record<string, string> = {
  grass: "bg-green-500",
  poison: "bg-purple-500",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400 text-black",
  bug: "bg-lime-500",
  normal: "bg-gray-400",
  ground: "bg-amber-600",
  fairy: "bg-pink-400",
  fighting: "bg-red-600",
  psychic: "bg-pink-500",
  rock: "bg-stone-500",
  ghost: "bg-indigo-700",
  ice: "bg-cyan-400",
  dragon: "bg-indigo-600",
};

export const Team = () => {
  const [team, setTeam] = useState<PokemonTeamItem[]>(() => getTeam());

  useEffect(() => {
    // setTeam(getTeam());

    const listener = () => setTeam(getTeam());
    window.addEventListener("teamUpdated", listener);

    return () => window.removeEventListener("teamUpdated", listener);
  }, []);

  const handleRemove = (id: number) => {
    removeFromTeam(id);
    setTeam(getTeam());
  };

  if (team.length === 0) {
    return <p className="text-gray-400 text-xl flex justify-center mt-4">ยังไม่มี Pokémon ในทีม</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">My Pokémon Team</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {team.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center relative hover:shadow-lg transition"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                handleRemove(p.id);
                window.dispatchEvent(new Event("teamUpdated"));
              }}
              className="absolute top-2 right-2 bg-red-100 text-red-500 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-200"
            >
              ✕
            </button>

            <Link
              to={`/pokemon/${p.name}`}
              className="flex flex-col items-center w-full"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-32 h-32 object-contain mb-2"
              />
              <h3 className="text-xl font-bold capitalize mb-2">{p.name}</h3>

              <div className="flex gap-1">
                {p.types.map((t) => (
                  <span
                    key={t}
                    className={`${
                      typeColors[t] || "bg-gray-400"
                    } text-white text-xs px-2 py-1 rounded-full capitalize`}
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
  );
};
