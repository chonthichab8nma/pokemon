import { useState, useEffect,useRef } from "react";
import axios from "axios";
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

  const isFirstLoad = useRef(true);

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
        console.log("res", res);
        console.log("data", res.data);
        console.log("results", results);

        const pokemonPromises = results.map((p: NamedResource) =>
          axios.get<PokemonListItem>(p.url)
        );

        const pokemonResponses = await Promise.all(pokemonPromises);

        const pokemonData = pokemonResponses.map((r) => r.data);

        setPokemons((prevPokemons) => [...prevPokemons, ...pokemonData]);
        console.log("pokemonPromises", pokemonPromises);
        console.log("pokemonResponses", pokemonResponses);
        console.log("pokemonData", pokemonData);
      } catch (error) {
        console.error(error);
        console.log("เออเร่อนะจ้ะ");
      } finally {
        console.log("hello world ");
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
      <h2 className="flex justify-center text-6xl mb-10 mt-10">Pokemon</h2>
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
    </>
  );
};
