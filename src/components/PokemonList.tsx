import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Search } from "lucide-react";
// import React from "react";

interface NamedResource {
  name: string;
  url: string;
}
interface PokemonType {
  slot: number;
  type: NamedResource;
}

interface PokemonSprites {
  front_default: string | null;
  other?: {
    home?: {
      front_default: string | null;
    };
  };
}

interface PokemonListItem {
  id: number;
  name: string;
  types: PokemonType[];
  sprites: PokemonSprites;
}

export const PokemonList = () => {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonListItem | null>(null);
  const [notFound, setNotFound] = useState(false);

  const isFirstLoad = useRef(true);

  const handleSelect = async (idOrName: number | string) => {
    if (!idOrName) return;
    setLoading(true);
    setNotFound(false);
    console.log("กำลัง search:", idOrName);
    try {
      const res = await axios.get<PokemonListItem>(
        `https://pokeapi.co/api/v2/pokemon/${String(idOrName)
          .toLowerCase()
          .trim()}`
      );
      setSelectedPokemon(res.data);
      setNotFound(false);

      console.log("res", res);
      console.log("data", res.data);
    } catch (error) {
      console.error(error);
      setSelectedPokemon(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
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
        console.log("เออเร่อนะจ้ะ");
      } finally {
        // console.log("hello world ");
      }
    };
    fetchPokemons();
  }, [offset]);

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

  return (
    <>
      <h2 className="flex justify-center text-6xl mb-10 mt-10"> Pokémon</h2>
      <div className="relative max-w-sm mx-auto mb-10">
        <input
          type="text"
          placeholder="ค้นหา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSelect(search)}
          className="w-full bg-amber-300 border-2 border-gray-300 rounded-2xl py-3 pr-20 pl-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          onClick={() => handleSelect(search)}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-white px-4 py-1 rounded-2xl hover:bg-yellow-500 transition flex items-center"
        >
          <Search size={16} className="mr-1" />
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-500 mb-4">กำลังโหลด Pokémon...</p>
      )}
      {selectedPokemon && !loading && (
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img
              src={
                selectedPokemon.sprites.other?.home?.front_default ||
                selectedPokemon.sprites.front_default ||
                ""
              }
              alt={selectedPokemon.name}
              className="w-32 h-32 object-contain mb-4"
            />
            <h3 className="capitalize font-bold text-gray-700 mb-2 text-2xl">
              {selectedPokemon.name}
            </h3>
            <div className="flex gap-2 flex-wrap justify-center">
              {selectedPokemon.types.map((t) => (
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
        </div>
      )}

      {notFound && (
        <p className="text-center text-red-500 font-semibold mb-4">
          ไม่พบ Pokémon ที่คุณค้นหา
        </p>
      )}
      {!selectedPokemon && !loading && !notFound && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition"
            >
              <img
                src={
                  pokemon.sprites.other?.home?.front_default ||
                  pokemon.sprites.front_default ||
                  ""
                }
                alt={pokemon.name}
                className="w-28 h-28 object-contain mb-2"
              />

              <h3 className="capitalize font-bold text-gray-700 mb-2">
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
          ))}
        </div>
      )}
      {!selectedPokemon && !loading && !notFound && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              setOffset((prevOffset) => prevOffset + 12);
            }}
            className="bg-[#5DBACA] text-white rounded-4xl p-4 mt-10 mb-10 "
          >
            หน้าถัดไป
          </button>
        </div>
      )}
    </>
  );
};
