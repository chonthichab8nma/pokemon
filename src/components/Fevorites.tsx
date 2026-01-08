import { useState } from "react";
import { getFavorites, removeFavorite } from "../utils/favorites";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Heart, ArrowLeft } from "lucide-react";
import "../App.css"

export default function Favorites() {
  const [favorites, setFavorites] = useState(getFavorites());
  const navigate = useNavigate();

  const handleRemove = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); 
    removeFavorite(id);
    setFavorites(getFavorites());
  };

  if (favorites.length === 0) {
    return (
      <div className="font-pixel min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 p-4">
        <div className="bg-zinc-900 p-6 rounded-full mb-6 border border-zinc-800">
            <Heart size={48} className="text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You don't have any favorite Pokémon yet. </h2>
        <p className="mb-8">Explore and add your favorite Pokémon first!</p>
        <Link 
            to="/pokemon" 
            className="bg-[#7fff00] text-black px-6 py-3 rounded-full font-bold hover:bg-[#ffff00] transition-colors"
        >
            Go catch some!
        </Link>
      </div>
    );
  }

  return (
    <div className="font-pixel  min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
       
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
             >
                <ArrowLeft size={24} />
             </button>
             <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                My Favorites <span className="text-[#7fff00]">({favorites.length})</span>
             </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map((p) => (
            <div 
                key={p.id} 
                className="group relative rounded-3xl border border-[#7fff00] p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#ffff00] hover:shadow-2xl hover:shadow-purple-900/10"
            >
              <Link to={`/pokemon/${p.id}`} className="block">
                
               
                <div className="relative flex justify-center py-6 mb-2">
                    <div className="absolute inset-0 bg-liner-to-tr from-purple-500/20 to-blue-500/20" />
                    <img 
                        src={p.image} 
                        alt={p.name}
                        className="w-32 h-32 object-contain relative z-10 drop-shadow-lg transition-transform duration-500 group-hover:scale-110" 
                    />
                </div>

              
                <div className="text-center mb-4">
                    <p className="text-xs text-zinc-500 font-mono mb-1">#{String(p.id).padStart(3, '0')}</p>
                    <p className="capitalize text-lg font-bold text-gray-100 group-hover:text-white transition-colors">
                        {p.name}
                    </p>
                </div>
              </Link>

              
              <button
                onClick={(e) => handleRemove(e, p.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-sm font-medium transition-all hover:bg-red-900/30 hover:text-red-400 border border-transparent hover:border-red-900/50"
              >
                <Trash2 size={16} />
                {/* <span>Remove</span> */}
              </button>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}