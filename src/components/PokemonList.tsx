import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import type { NamedResource, PokemonListItem } from "./data";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { addFavorite, removeFavorite, isFavorite } from "../utils/favorites";

export const PokemonList = () => {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  // const [loading, setLoading] = useState(false);
  // const [selectedPokemon, setSelectedPokemon] =
  //   useState<PokemonListItem | null>(null);
  // const [detailPokemon, setDetailPokemon] = useState<PokemonListItem | null>(null);
  // const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);

  const isFirstLoad = useRef(true);

  // const handleSelect = async (idOrName: number | string) => {
  //   if (!idOrName) return;
  //   setLoading(true);
  //   setNotFound(false);
  //   console.log("กำลัง search:", idOrName);
  //   try {
  //     const res = await axios.get<PokemonListItem>(
  //       `https://pokeapi.co/api/v2/pokemon/${String(idOrName)
  //         .toLowerCase()
  //         .trim()}`
  //     );
  //     setSelectedPokemon(res.data);
  //     setNotFound(false);

  //     console.log("res", res);
  //     console.log("data", res.data);
  //   } catch (error) {
  //     console.error(error);
  //     setSelectedPokemon(null);
  //     setNotFound(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSearch = () => {
    if (!search.trim()) return;
    navigate(`/pokemon/${search.toLowerCase().trim()}`);
  };

  useEffect(() => {
    if (!isFirstLoad.current && offset === 0) return;
    isFirstLoad.current = false;
    const LIMIT = 12;

    const fetchPokemons = async () => {
      try {
        const res = await axios.get(
          `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`
        );

        const results = res.data.results;
        // console.log("res", res);
        // console.log("data", res.data);
        // console.log("results", results);

        const pokemonPromises = results.map((p: NamedResource) =>
          axios.get<PokemonListItem>(p.url)
        );

        const pokemonResponses = await Promise.all(pokemonPromises);

        const pokemonData = pokemonResponses.map((r) => r.data);

        setPokemons((prevPokemons) => [...prevPokemons, ...pokemonData]);
        // console.log("pokemonPromises", pokemonPromises);
        // console.log("pokemonResponses", pokemonResponses);
        // console.log("pokemonData", pokemonData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPokemons();
  }, [offset, refresh]);

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
  const typeHexColors: Record<string, string> = {
    grass: "#22c55e",
    poison: "#a855f7",
    fire: "#f97316",
    water: "#3b82f6",
    electric: "#facc15",
    bug: "#84cc16",
    normal: "#9ca3af",
    ground: "#d97706",
    fairy: "#f472b6",
    fighting: "#dc2626",
    psychic: "#ec4899",
    rock: "#78716c",
    ghost: "#4338ca",
    ice: "#22d3ee",
    dragon: "#4f46e5",
  };

  return (
    <div className="min-h-screen bg-black text-green p-4 font-pixel">
      <h2 className="flex justify-center text-4xl mb-10 mt-4"> Pokémon</h2>

      {/* Search================================================================================ */}

      <div className="relative max-w-sm mx-auto mb-10">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full border-green border-2  rounded-2xl py-3 pr-20 pl-4 focus:outline-none "
        />

        <button
          onClick={() => handleSearch()}
          className="absolute right-1 top-1/2 -translate-y-1/2 hover:text-green px-4 py-1  flex items-center"
        >
          <Search size={16} className="mr-1" />
        </button>
      </div>

      {/* Fev================================================================================ */}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pokemons.map((pokemon) => {
          const primaryType = pokemon.types[0].type.name;
          const gradientColor = typeHexColors[primaryType] || "#374151";

          return (
            <div
              key={pokemon.id}
              onClick={() => navigate(`/pokemon/${pokemon.id}`)}
              className="relative bg-black rounded-2xl shadow-md p-4 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition"
              style={{
                background: `linear-gradient(to top, ${gradientColor} 0%, #000000 70%)`,
              }}
            >
              <button
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();

                  if (isFavorite(pokemon.id)) {
                    removeFavorite(pokemon.id);
                  } else {
                    addFavorite({
                      id: pokemon.id,
                      name: pokemon.name,
                      image:
                        pokemon.sprites.other?.home?.front_default ||
                        pokemon.sprites.front_default ||
                        "",
                    });
                  }

                  setRefresh((r) => r + 1);
                }}
              >
                <Star
                  className={
                    isFavorite(pokemon.id)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  }
                />
              </button>

              <img
                src={
                  pokemon.sprites.other?.home?.front_default ||
                  pokemon.sprites.front_default ||
                  ""
                }
                alt={pokemon.name}
                className="w-28 h-28 object-contain mb-2"
              />

              {/* Name================================================================================ */}

              <h3 className="capitalize font-bold text-gray-100 mb-2 text-lg drop-shadow-md">
                {pokemon.name}
              </h3>
              <div className="flex gap-2 flex-wrap justify-center">
                {pokemon.types.map((t) => (
                  <span
                    key={t.slot}
                    className={`${
                      typeColors[t.type.name] || "bg-gray-300"
                    } text-white px-3 py-1 rounded-full text-xs font-semibold capitalize`}
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => {
            setOffset((prevOffset) => prevOffset + 12);
          }}
          className=" text-green hover:text-amber-200 p-4 mt-10 mb-10 "
        >
          Next
        </button>
      </div>
    </div>
  );
};
