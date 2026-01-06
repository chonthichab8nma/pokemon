import React, { useState, useEffect } from 'react';
import axios, { type AxiosResponse, isAxiosError } from 'axios';
import { 
  Search, ArrowLeft, RefreshCw, Shield, Sword, 
  Layers, Users, Star, BarChart3, Info, ChevronRight, 
  LayoutGrid, GitBranch, Target, ShieldAlert
} from 'lucide-react';

// --- Interfaces & Types ---

type View = 'pokedex' | 'types' | 'compare' | 'team' | 'favorites';

interface NamedResource {
  name: string;
  url: string;
}

interface PokemonType {
  slot: number;
  type: NamedResource;
}

interface PokemonStat {
  base_stat: number;
  stat: NamedResource;
}

interface PokemonAbility {
  ability: NamedResource;
  is_hidden: boolean;
}

interface PokemonDetail {
  id: number;
  name: string;
  weight: number;
  height: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: { 
    front_default: string; 
    other: { 
      'official-artwork': { front_default: string };
      home: { front_default: string };
    } 
  };
  species: NamedResource;
}

interface EvolutionLink {
  species_name: string;
  id: string;
}

interface TypeDamage {
  double_damage_from: NamedResource[];
  double_damage_to: NamedResource[];
  half_damage_from: NamedResource[];
  half_damage_to: NamedResource[];
  no_damage_from: NamedResource[];
  no_damage_to: NamedResource[];
}

interface TypeResponse {
  damage_relations: TypeDamage;
}

interface EvolutionNode {
  species: NamedResource;
  evolves_to: EvolutionNode[];
}

interface EvolutionChainResponse {
  chain: EvolutionNode;
}

interface SpeciesResponse {
  evolution_chain: {
    url: string;
  };
}

// --- Constants ---

const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: "ปกติ", fire: "ไฟ", water: "น้ำ", grass: "หญ้า", electric: "ไฟฟ้า",
  ice: "น้ำแข็ง", fighting: "ต่อสู้", poison: "พิษ", ground: "ดิน", flying: "บิน",
  psychic: "พลังจิต", bug: "แมลง", rock: "หิน", ghost: "ผี", dragon: "มังกร",
  dark: "ความมืด", steel: "เหล็ก", fairy: "แฟรี่"
};

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400", fire: "bg-orange-500", water: "bg-blue-500", grass: "bg-green-500",
  electric: "bg-yellow-400", ice: "bg-cyan-300", fighting: "bg-red-700", poison: "bg-purple-500",
  ground: "bg-amber-600", flying: "bg-indigo-400", psychic: "bg-pink-500", bug: "bg-lime-500",
  rock: "bg-stone-500", ghost: "bg-purple-700", dragon: "bg-indigo-600", dark: "bg-slate-800",
  steel: "bg-slate-400", fairy: "bg-pink-300"
};

// --- Reusable Components ---

const Badge: React.FC<{ type: string; large?: boolean }> = ({ type, large }) => (
  <span className={`${TYPE_COLORS[type] || "bg-gray-500"} text-white ${large ? 'px-4 py-1 text-sm' : 'px-2 py-0.5 text-[10px]'} rounded-full font-medium shadow-sm capitalize whitespace-nowrap`}>
    {TYPE_TRANSLATIONS[type] || type}
  </span>
);

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-20">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 font-medium">กำลังดึงข้อมูล...</p>
  </div>
);

// --- Page Components ---

const EvolutionChain: React.FC<{ url: string }> = ({ url }) => {
  const [chain, setChain] = useState<EvolutionLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvolution = async () => {
      try {
        const speciesRes = await axios.get<SpeciesResponse>(url);
        const evolutionRes = await axios.get<EvolutionChainResponse>(speciesRes.data.evolution_chain.url);
        
        let evoData: EvolutionNode | undefined = evolutionRes.data.chain;
        const links: EvolutionLink[] = [];
        
        while (evoData) {
          const id = evoData.species.url.split('/').slice(-2, -1)[0];
          links.push({ species_name: evoData.species.name, id });
          evoData = evoData.evolves_to[0];
        }
        
        setChain(links);
      } catch (e) { 
        console.error("Evolution fetch error:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchEvolution();
  }, [url]);

  if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-xl"></div>;

  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto py-4">
      {chain.map((evo, idx) => (
        <React.Fragment key={`${evo.id}-${idx}`}>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full p-2 border border-gray-100 shadow-sm">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`} 
                alt={evo.species_name} 
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64?text=?')}
              />
            </div>
            <span className="text-[10px] font-bold mt-1 capitalize text-gray-600">{evo.species_name}</span>
          </div>
          {idx < chain.length - 1 && <ChevronRight size={16} className="text-gray-300" />}
        </React.Fragment>
      ))}
    </div>
  );
};

const TypesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [damageInfo, setDamageInfo] = useState<TypeDamage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTypeInfo = async (type: string) => {
    setLoading(true);
    setSelectedType(type);
    try {
      const res = await axios.get<TypeResponse>(`https://pokeapi.co/api/v2/type/${type}`);
      setDamageInfo(res.data.damage_relations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Layers className="text-blue-500" /> ข้อมูลธาตุ (Types Detail)
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {Object.keys(TYPE_COLORS).map(type => (
          <button 
            key={type} 
            onClick={() => fetchTypeInfo(type)}
            className={`${TYPE_COLORS[type]} p-3 rounded-xl text-white font-bold shadow-md hover:scale-105 transition-transform ${selectedType === type ? 'ring-4 ring-offset-2 ring-slate-800' : ''}`}
          >
            {TYPE_TRANSLATIONS[type]}
          </button>
        ))}
      </div>

      {loading && <Loader />}

      {!loading && damageInfo && selectedType && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 animate-slideUp">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-4 h-10 rounded-full ${TYPE_COLORS[selectedType]}`}></div>
            <h3 className="text-2xl font-bold">ข้อมูลธาตุ: {TYPE_TRANSLATIONS[selectedType]}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-red-600 flex items-center gap-2"><Target size={18} /> โจมตีแรงขึ้น x2</h4>
              <div className="flex flex-wrap gap-2">
                {damageInfo.double_damage_to.map(t => <Badge key={t.name} type={t.name} large />)}
                {damageInfo.double_damage_to.length === 0 && <span className="text-gray-400">ไม่มี</span>}
              </div>
              <h4 className="font-bold text-gray-600 flex items-center gap-2"><Shield size={18} /> รับดาเมจเบาลง x0.5</h4>
              <div className="flex flex-wrap gap-2">
                {damageInfo.half_damage_from.map(t => <Badge key={t.name} type={t.name} large />)}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-orange-600 flex items-center gap-2"><ShieldAlert size={18} /> รับดาเมจแรงขึ้น x2</h4>
              <div className="flex flex-wrap gap-2">
                {damageInfo.double_damage_from.map(t => <Badge key={t.name} type={t.name} large />)}
              </div>
              <h4 className="font-bold text-blue-600 flex items-center gap-2"><Sword size={18} /> โจมตีเบาลง x0.5</h4>
              <div className="flex flex-wrap gap-2">
                {damageInfo.half_damage_to.map(t => <Badge key={t.name} type={t.name} large />)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

export default function Pokemon() {
  const [view, setView] = useState<View>('pokedex');
  const [pokemonList, setPokemonList] = useState<PokemonDetail[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [offset, setOffset] = useState<number>(1);

  const fetchList = async (startId: number) => {
    setLoading(true);
    const promises: Promise<AxiosResponse<PokemonDetail>>[] = [];
    for (let i = startId; i < startId + 18; i++) {
      if (i <= 1010) promises.push(axios.get<PokemonDetail>(`https://pokeapi.co/api/v2/pokemon/${i}`));
    }
    
    const results = await Promise.allSettled(promises);
    const newItems = results
      .filter((r): r is PromiseFulfilledResult<AxiosResponse<PokemonDetail>> => r.status === 'fulfilled')
      .map(r => r.value.data);
      
    setPokemonList(prev => [...prev, ...newItems]);
    setOffset(startId + 18);
    setLoading(false);
  };

  useEffect(() => { fetchList(1); }, []);

  const handleSelect = async (idOrName: number | string) => {
    if (!idOrName) return;
    setLoading(true);
    try {
      const res = await axios.get<PokemonDetail>(`https://pokeapi.co/api/v2/pokemon/${String(idOrName).toLowerCase().trim()}`);
      setSelectedPokemon(res.data);
      window.scrollTo(0, 0);
    } catch (e) { 
      if(isAxiosError(e)){
        console.error("Message: ",e.message)
      }
      alert("ไม่พบข้อมูลโปเกมอนที่คุณค้นหา"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-24">
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-around md:justify-start md:gap-8 px-4 py-3">
          <button onClick={() => { setView('pokedex'); setSelectedPokemon(null); }} className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${view === 'pokedex' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
            <LayoutGrid size={22} /> <span className="text-[10px] md:text-sm">Pokedex</span>
          </button>
          <button onClick={() => setView('types')} className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${view === 'types' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
            <Layers size={22} /> <span className="text-[10px] md:text-sm">Types</span>
          </button>
          <button onClick={() => setView('compare')} className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${view === 'compare' ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
            <GitBranch size={22} /> <span className="text-[10px] md:text-sm">Compare</span>
          </button>
          <button onClick={() => setView('team')} className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${view === 'team' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
            <Users size={22} /> <span className="text-[10px] md:text-sm">Team</span>
          </button>
          <button onClick={() => setView('favorites')} className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${view === 'favorites' ? 'text-yellow-500 font-bold' : 'text-gray-400'}`}>
            <Star size={22} /> <span className="text-[10px] md:text-sm">Favorites</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:mt-20">
        {view === 'pokedex' && !selectedPokemon && (
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-4 flex items-center gap-3">
              <span className="bg-red-500 text-white p-2 rounded-lg"><Target size={28} /></span>
              POKEDEX
            </h1>
            <div className="relative group max-w-lg">
              <input 
                type="text" 
                placeholder="ค้นหาชื่อหรือหมายเลข..."
                className="w-full bg-white border-2 border-gray-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all shadow-sm"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSelect(search)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-500" size={20} />
            </div>
          </div>
        )}

        {view === 'pokedex' && (
          <>
            {selectedPokemon ? (
              <div className="animate-fadeIn max-w-2xl mx-auto">
                <button onClick={() => setSelectedPokemon(null)} className="mb-6 flex items-center gap-2 font-bold text-gray-500 hover:text-red-500 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm">
                  <ArrowLeft size={18} /> ย้อนกลับ
                </button>

                <div className="bg-white rounded-4xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className={`h-48 relative flex items-center justify-center ${TYPE_COLORS[selectedPokemon.types[0].type.name]} opacity-90`}>
                    <div className="absolute top-4 right-6 text-white text-6xl font-black opacity-20">#{selectedPokemon.id}</div>
                    <img 
                      src={selectedPokemon.sprites.other['official-artwork'].front_default} 
                      className="w-56 h-56 z-10 drop-shadow-2xl translate-y-12" 
                      alt={selectedPokemon.name} 
                    />
                  </div>

                  <div className="pt-20 px-8 pb-8">
                    <div className="text-center mb-6">
                      <h2 className="text-4xl font-black capitalize mb-2">{selectedPokemon.name}</h2>
                      <div className="flex justify-center gap-2">
                        {selectedPokemon.types.map(t => <Badge key={t.type.name} type={t.type.name} large />)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Weight</p>
                        <p className="text-lg font-bold">{selectedPokemon.weight / 10} kg</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Height</p>
                        <p className="text-lg font-bold">{selectedPokemon.height / 10} m</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h3 className="font-bold flex items-center gap-2 mb-3 text-gray-700">
                          <BarChart3 size={18} className="text-red-500" /> Stats (ค่าพลังพื้นฐาน)
                        </h3>
                        <div className="space-y-3">
                          {selectedPokemon.stats.map(s => (
                            <div key={s.stat.name} className="flex items-center gap-4">
                              <span className="w-24 text-xs font-bold uppercase text-gray-500">{s.stat.name.replace('special-', 'sp. ')}</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${s.base_stat > 80 ? 'bg-green-500' : 'bg-orange-400'} rounded-full`} 
                                  style={{ width: `${Math.min(100, (s.base_stat / 200) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-sm font-bold">{s.base_stat}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h3 className="font-bold flex items-center gap-2 mb-3 text-gray-700">
                          <Info size={18} className="text-blue-500" /> Abilities (ความสามารถ)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPokemon.abilities.map(a => (
                            <span key={a.ability.name} className={`px-4 py-2 rounded-xl text-sm font-bold border ${a.is_hidden ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                              {a.ability.name.replace('-', ' ')} {a.is_hidden && '(Hidden)'}
                            </span>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h3 className="font-bold flex items-center gap-2 mb-1 text-gray-700">
                          <GitBranch size={18} className="text-green-500" /> Evolution (สายวิวัฒนาการ)
                        </h3>
                        <EvolutionChain url={selectedPokemon.species.url} />
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                  {pokemonList.map(poke => (
                    <div 
                      key={poke.id} 
                      onClick={() => handleSelect(poke.id)}
                      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group border border-gray-100"
                    >
                      <div className="relative bg-gray-50 rounded-xl mb-3 flex items-center justify-center p-2 group-hover:bg-red-50 transition-colors">
                        <span className="absolute top-1 right-2 text-[10px] font-black text-gray-300">#{poke.id}</span>
                        <img src={poke.sprites.front_default} alt={poke.name} className="w-20 h-20 drop-shadow-md group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="font-bold capitalize text-slate-700 text-sm mb-2 truncate">{poke.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        {poke.types.map(t => <Badge key={t.type.name} type={t.type.name} />)}
                      </div>
                    </div>
                  ))}
                </div>
                {loading && <Loader />}
                <div className="flex justify-center mt-12">
                  <button 
                    onClick={() => fetchList(offset)} 
                    disabled={loading}
                    className="bg-slate-900 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 disabled:bg-gray-400"
                  >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> โหลดเพิ่มเติม
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {view === 'types' && <TypesPage />}
        {view === 'compare' && <div className="text-center py-20 text-gray-400 font-bold">ฟีเจอร์ "เปรียบเทียบ" กำลังอยู่ในการพัฒนา...</div>}
        {view === 'team' && <div className="text-center py-20 text-gray-400 font-bold">ฟีเจอร์ "สร้างทีม" กำลังอยู่ในการพัฒนา...</div>}
        {view === 'favorites' && <div className="text-center py-20 text-gray-400 font-bold">ฟีเจอร์ "รายการโปรด" กำลังอยู่ในการพัฒนา...</div>}
      </main>
    </div>
  );
}