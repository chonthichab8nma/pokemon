import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { PokemonListItem, NamedResource, PokemonType } from "./data";
import { addFavorite, removeFavorite, isFavorite } from "../utils/favorites";
import { addToTeam, removeFromTeam, isInTeam } from "../utils/team";
import { Star, Plus } from "lucide-react";
import "../App.css";
interface EvolutionDetail extends NamedResource {
  types: string[];
}

interface PokemonForm {
  name: string;
  image: string | null;
  types: string[];
}

interface EvolutionChainNode {
  species: NamedResource;
  evolves_to: EvolutionChainNode[];
}

interface PokemonVariety {
  is_default: boolean;
  pokemon: NamedResource;
}

export const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState<PokemonListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [evolutions, setEvolutions] = useState<EvolutionDetail[]>([]);
  const [forms, setForms] = useState<PokemonForm[]>([]);
  const [teamMessage, setTeamMessage] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [inTeam, setInTeam] = useState(false);

  const parseEvolutionChain = (chain: EvolutionChainNode): NamedResource[] => {
    const result: NamedResource[] = [];
    const traverse = (currentStep: EvolutionChainNode) => {
      result.push(currentStep.species);
      currentStep.evolves_to.forEach(traverse);
    };
    traverse(chain);
    return result;
  };

  useEffect(() => {
    if (!id) return;

    const fetchPokemon = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const res = await axios.get<PokemonListItem>(
          `https://pokeapi.co/api/v2/pokemon/${id.toLowerCase()}`
        );
        setPokemon(res.data);

        const speciesRes = await axios.get(res.data.species.url);
        const varieties = speciesRes.data.varieties;

        const formDetails = await Promise.all(
          varieties.map(
            async (v: PokemonVariety): Promise<PokemonForm | null> => {
              try {
                const formRes = await axios.get<PokemonListItem>(v.pokemon.url);
                return {
                  name: formRes.data.name,
                  image:
                    formRes.data.sprites.other?.home?.front_default ||
                    formRes.data.sprites.front_default,
                  types: formRes.data.types.map(
                    (t: PokemonType) => t.type.name
                  ),
                };
              } catch {
                return null;
              }
            }
          )
        );

        setForms(formDetails.filter(Boolean));

        const evoRes = await axios.get(speciesRes.data.evolution_chain.url);
        const evoList = parseEvolutionChain(evoRes.data.chain);

        const evoWithTypes = await Promise.all(
          evoList.map(async (evo) => {
            try {
              const detail = await axios.get<PokemonListItem>(
                `https://pokeapi.co/api/v2/pokemon/${evo.name}`
              );
              return {
                ...evo,
                types: detail.data.types.map((t: PokemonType) => t.type.name),
              };
            } catch {
              return { ...evo, types: [] };
            }
          })
        );
        setEvolutions(evoWithTypes);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error(error);
        setNotFound(true);
        setPokemon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [id]);

  useEffect(() => {
    if (pokemon) {
      setFavorite(isFavorite(pokemon.id));
      setInTeam(isInTeam(pokemon.id));
    }
  }, [pokemon]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-center text-white text-xl animate-pulse">
          กำลังโหลด Pokémon...
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <p className="text-red-500 text-xl font-semibold mb-4">
          ไม่พบ Pokémon ที่ค้นหา
        </p>
        <button
          onClick={() => navigate("/pokemon")}
          className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-600"
        >
          กลับ
        </button>
      </div>
    );
  }

  if (!pokemon) return null;

  const pokemonImage =
    pokemon.sprites.other?.home?.front_default ||
    pokemon.sprites.front_default ||
    "";

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
    //
    <div className="font-pixel min-h-screen w-full bg-black py-10 px-4 text-white">
     
      <div className="max-w-8xl mx-auto mt-10 bg-black relative  ">
       
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-sm text-gray-400 hover:text-white hover:underline z-50 cursor-pointer "
        >
          ← Back
        </button>
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={() => {
              if (favorite) removeFavorite(pokemon.id);
              else
                addFavorite({
                  id: pokemon.id,
                  name: pokemon.name,
                  image: pokemonImage,
                });
              setFavorite(!favorite);
            }}
            className={`p-2 rounded-full transition-all ${
              favorite
                ? "bg-yellow-500 text-white"
                : "bg-zinc-700 text-gray-300 hover:bg-zinc-600"
            }`}
          >
            <Star
              size={20}
              fill={favorite ? "currentColor" : "none"}
              stroke="currentColor"
            />
          </button>
          <button
            onClick={() => {
              if (!pokemon) return;
              if (inTeam) {
                removeFromTeam(pokemon.id);
                setInTeam(false);
              } else {
                const added = addToTeam({
                  id: pokemon.id,
                  name: pokemon.name,
                  image: pokemonImage,
                  types: pokemon.types.map((t) => t.type.name),
                });
                if (added) {
                  setInTeam(true);
                } else {
                  setTeamMessage("ทีมเต็มแล้ว! สูงสุด 6 ตัว");
                  setTimeout(() => setTeamMessage(null), 3000);
                }
              }
              window.dispatchEvent(new Event("teamUpdated"));
            }}
            className={`p-2 rounded-full transition-all ${
              inTeam ? "bg-red-600 text-white" : "bg-green-600 text-white"
            }`}
          >
            <Plus size={20} />
          </button>
        </div>

        {teamMessage && (
          <div className="w-full mb-4 absolute top-20 left-0 flex justify-center z-10">
            <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
              {teamMessage}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="relative w-full flex justify-center md:justify-start mb-6">
              <div className="absolute top-1/2 left-1/2 md:left-24 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gray-700 rounded-full blur-3xl opacity-30 z-0"></div>
              <img
                src={pokemonImage}
                alt={pokemon.name}
                className="w-56 h-56 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              />
            </div>

            <h2 className="text-4xl font-extrabold capitalize mb-2">
              {pokemon.name}
            </h2>

            <div className="flex gap-2 mb-6 justify-center md:justify-start">
              {pokemon.types.map((t) => (
                <span
                  key={t.slot}
                  className={`${
                    typeColors[t.type.name] || "bg-gray-600"
                  } text-white px-4 py-1 rounded-full text-sm capitalize shadow-md`}
                >
                  {t.type.name}
                </span>
              ))}
            </div>

            <div className="w-full mb-6 text-center md:text-left">
              <p className="text-sm text-gray-400">Species</p>
              <p className="capitalize font-semibold text-lg">
                {pokemon.species.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-center md:text-left">
                <p className="text-sm text-gray-400">Height</p>
                <p className="font-semibold text-white">{pokemon.height}</p>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-center md:text-left">
                <p className="text-sm text-gray-400">Weight</p>
                <p className="font-semibold text-white">{pokemon.weight}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="w-full mb-8">
              <h3 className="font-bold text-xl mb-4 text-gray-200 border-l-4 border-blue-500 pl-3">
                Base Stats
              </h3>
              <div className="space-y-3">
                {pokemon.stats.map((s) => (
                  <div key={s.stat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-400">
                        {s.stat.name}
                      </span>
                      <span className="font-semibold">{s.base_stat}</span>
                    </div>

                    <div className="w-full bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          s.base_stat >= 100
                            ? "bg-green-500"
                            : s.base_stat >= 60
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }`}
                        style={{ width: `${Math.min(s.base_stat, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <h3 className="font-bold text-xl mb-4 text-gray-200 border-l-4 border-purple-500 pl-3">
                Abilities
              </h3>
              <ul className="flex gap-2 flex-wrap">
                {pokemon.abilities.map((a) => (
                  <li
                    key={a.ability.name}
                    className={`px-4 py-2 rounded-lg text-sm capitalize border ${
                      a.is_hidden
                        ? "bg-transparent border-dashed border-zinc-600 text-zinc-400"
                        : "bg-zinc-800 border-zinc-700 text-white"
                    }`}
                  >
                    {a.ability.name.replace("-", " ")}
                    {a.is_hidden && (
                      <span className="ml-2 text-xs text-zinc-500">
                        (hidden)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {evolutions.length > 0 && (
          <div className="mt-12 w-full border-t border-[#7fff00] pt-8">
            <h3 className="font-bold text-xl mb-6 text-center text-gray-200">
              Evolution Chain
            </h3>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {evolutions.map((evo) => (
                <div
                  key={evo.name}
                  onClick={() => navigate(`/pokemon/${evo.name}`)}
                  className="cursor-pointer flex flex-col items-center group"
                >
                  <div className=" border border-[#7fff00] rounded-full p-4 mb-3 transition-transform group-hover:scale-110 group-hover:border-[#ffff00]">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${
                        evo.url.split("/").slice(-2, -1)[0]
                      }.png`}
                      alt={evo.name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <p className="capitalize font-bold text-sm text-gray-300 group-hover:text-white">
                    {evo.name}
                  </p>

                  <div className="flex gap-1 mt-2">
                    {evo.types.map((type) => (
                      <span
                        key={type}
                        className={`${
                          typeColors[type] || "bg-gray-600"
                        } text-[10px] text-white px-2 py-0.5 rounded-md capitalize`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {forms.length > 1 && (
              <div className="mt-10 w-full border-t border-[#7fff00] pt-6">
                <h3 className="font-bold mb-4 text-center text-gray-400">
                  Varieties
                </h3>

                <div className="flex justify-center gap-4 flex-wrap">
                  {forms.map((form) => (
                    <div
                      key={form.name}
                      onClick={() => navigate(`/pokemon/${form.name}`)}
                      className={`cursor-pointer flex flex-col items-center hover:scale-105 transition opacity-80 hover:opacity-100`}
                    >
                      <div
                        className={`rounded-full p-1 mb-1 ${
                          form.name === pokemon.name
                            ? "ring-2 ring-[#7fff00]"
                            : ""
                        }`}
                      >
                        <img
                          src={form.image || ""}
                          alt={form.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <p className="capitalize text-xs text-center text-gray-500">
                        {form.name
                          .replace(pokemon.name, "")
                          .replace("-", " ") || "Normal"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
