import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { PokemonListItem, NamedResource, PokemonType } from "./data";

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

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-20 text-xl">
        กำลังโหลด Pokémon...
      </p>
    );
  }

  if (notFound) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500 text-xl font-semibold mb-4">
          ไม่พบ Pokémon ที่คุณค้นหา
        </p>
        <button
          onClick={() => navigate("/pokemon")}
          className="bg-gray-700 text-white px-4 py-2 rounded-xl"
        >
          กลับไปหน้า List
        </button>
      </div>
    );
  }

  if (!pokemon) return null;

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
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-3xl shadow-lg p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-500 hover:underline"
      >
        ← กลับ
      </button>

      <div className="flex flex-col items-center">
        <img
          src={
            pokemon.sprites.other?.home?.front_default ||
            pokemon.sprites.front_default ||
            ""
          }
          alt={pokemon.name}
          className="w-48 h-48 object-contain mb-4"
        />

        <h2 className="text-3xl font-bold capitalize mb-2">{pokemon.name}</h2>

        <div className="flex gap-2 mb-4">
          {pokemon.types.map((t) => (
            <span
              key={t.slot}
              className={`${
                typeColors[t.type.name] || "bg-gray-300"
              } text-white px-3 py-1 rounded-full text-sm capitalize`}
            >
              {t.type.name}
            </span>
          ))}
        </div>

        <div className="mt-6 mb-6 w-full text-center">
          <p className="text-sm text-gray-500">Species</p>
          <p className="capitalize font-semibold">{pokemon.species.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full text-center">
          <div className="bg-gray-100 rounded-xl p-3">
            <p className="text-sm text-gray-500">Height</p>
            <p className="font-semibold">{pokemon.height}</p>
          </div>

          <div className="bg-gray-100 rounded-xl p-3">
            <p className="text-sm text-gray-500">Weight</p>
            <p className="font-semibold">{pokemon.weight}</p>
          </div>
        </div>

        <div className="mt-6 w-full">
          <h3 className="font-bold mb-2">Stats</h3>

          <div className="space-y-2">
            {pokemon.stats.map((s) => (
              <div key={s.stat.name}>
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{s.stat.name}</span>
                  <span className="font-semibold">{s.base_stat}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(s.base_stat, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 w-full">
          <h3 className="font-bold mb-2">Abilities</h3>

          <ul className="flex gap-2 flex-wrap">
            {pokemon.abilities.map((a) => (
              <li
                key={a.ability.name}
                className="bg-blue-100 px-3 py-1 rounded-full text-sm capitalize"
              >
                {a.ability.name}
                {a.is_hidden && (
                  <span className="ml-1 text-xs text-gray-500">(hidden)</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {evolutions.length > 0 && (
          <div className="mt-8 w-full border-t pt-6">
            <h3 className="font-bold mb-4 text-center">Evolution Chain</h3>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              {evolutions.map((evo) => (
                <div
                  key={evo.name}
                  onClick={() => navigate(`/pokemon/${evo.name}`)}
                  className="cursor-pointer flex flex-col items-center hover:scale-105 transition-transform"
                >
                  <div className="bg-gray-50 rounded-full p-2 mb-2">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${
                        evo.url.split("/").slice(-2, -1)[0]
                      }.png`}
                      alt={evo.name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <p className="capitalize font-bold text-sm">{evo.name}</p>

                  {/* แสดง Type ของแต่ละร่าง */}
                  <div className="flex gap-1 mt-1">
                    {evo.types.map((type) => (
                      <span
                        key={type}
                        className={`${
                          typeColors[type] || "bg-gray-300"
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
              <div className="mt-8 w-full border-t pt-6">
                <h3 className="font-bold mb-4 text-center">Other Forms</h3>

                <div className="flex justify-center gap-6 flex-wrap">
                  {forms.map((form) => (
                    <div key={form.name} className="flex flex-col items-center">
                      <div className="bg-gray-50 rounded-full p-2 mb-2">
                        <img
                          src={form.image || ""}
                          alt={form.name}
                          className="w-20 h-20 object-contain"
                        />
                      </div>

                      <p className="capitalize font-bold text-sm text-center">
                        {form.name
                          .replace(pokemon.name, "")
                          .replace("-", " ") || "normal"}
                      </p>

                      <div className="flex gap-1 mt-1">
                        {form.types.map((type) => (
                          <span
                            key={type}
                            className={`${
                              typeColors[type] || "bg-gray-300"
                            } text-[10px] text-white px-2 py-0.5 rounded-md capitalize`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
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
